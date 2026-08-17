import { cache } from "react";
import { LeisureAgent } from "@/application/leisure-agent/agent";
import { createPrismaTools } from "@/application/leisure-agent/tools";
import type { AgentResult } from "@/application/leisure-agent/types";
import { mapCircle, mapExperience, mapPerson, mapPlan } from "@/db/map";
import { prisma } from "@/db/prisma";
import { DEMO_PERSON_ID } from "@/lib/constants";
import { createAIProvider } from "@/services/ai/mock-provider";
import { computeKarma } from "@/services/deterministic";
import { applyRejectionToMemory, shouldTouchAffinity, validateMemoryProposal } from "@/services/memory/policy";
import { PROVIDERS } from "@/services/providers";
import { listConnectors } from "@/services/sources";

export const getDemoPersonId = cache(async () => {
  const demo = await prisma.person.findFirst({ where: { isDemo: true } });
  return demo?.id ?? DEMO_PERSON_ID;
});

export async function submitLeisurePrompt(input: {
  text: string;
  personId?: string;
  circleId?: string;
}): Promise<AgentResult> {
  const personId = input.personId ?? (await getDemoPersonId());
  const agent = new LeisureAgent(createPrismaTools(), createAIProvider());
  return agent.consider(input.text, personId, input.circleId);
}

export const getForYou = cache(async (personId?: string) => {
  const id = personId ?? (await getDemoPersonId());
  const person = await prisma.person.findUniqueOrThrow({ where: { id } });
  const circles = await prisma.circle.findMany({ where: { personId: id }, include: { members: true } });
  const experiences = await prisma.leisureExperience.findMany({
    where: { personId: id },
    include: { activity: true },
    orderBy: { happenedAt: "desc" },
  });
  const karma = computeKarma(experiences.map(mapExperience), 30);
  const upcoming = await prisma.plan.findMany({
    where: { personId: id, status: { in: ["UPCOMING", "SAVED"] } },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
    orderBy: { startAt: "asc" },
    take: 4,
  });
  const loved = experiences.filter((item) => item.loved).slice(0, 6);
  const handpicked = await prisma.plan.findMany({
    where: { personId: id, status: { in: ["SAVED", "DRAFT", "UPCOMING"] }, personality: { not: null } },
    include: { steps: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
  const bookings = await prisma.booking.findMany({
    where: { personId: id, status: { in: ["CONFIRMED", "UPCOMING"] } },
    orderBy: { startsAt: "asc" },
    take: 3,
  });
  const memories = await prisma.memory.findMany({
    where: { personId: id, status: "ACTIVE", layer: { in: ["OBSERVATION", "BEHAVIOURAL"] } },
    orderBy: { confidence: "desc" },
    take: 3,
  });

  return {
    person: mapPerson(person),
    circles: circles.map(mapCircle),
    karma,
    upcoming: upcoming.map(mapPlan),
    handpicked: handpicked.map(mapPlan),
    loved: loved.map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.activity?.imageUrl,
      notes: item.notes,
      circleId: item.circleId,
    })),
    bookings,
    insight:
      memories[0]?.statement ??
      "You seem to choose music when you're on your own, but experiences with a strong local story when you're hosting people.",
    nudge: karmaNudge(karma),
  };
});

export async function getPlan(id: string) {
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: { steps: { orderBy: { sortOrder: "asc" }, include: { place: true, activity: true } } },
  });
  if (!plan) return null;
  const circle = plan.circleId ? await prisma.circle.findUnique({ where: { id: plan.circleId } }) : null;
  return { plan: mapPlan(plan), circle: circle ? mapCircle({ ...circle, members: [] }) : null, steps: plan.steps };
}

export async function modifyPlan(planId: string, changes: { status?: string; title?: string }) {
  const tools = createPrismaTools();
  return tools.modifyPlan(planId, changes);
}

export async function recordInteraction(input: {
  personId?: string;
  type: string;
  targetType: string;
  targetId: string;
  reason?: string;
  circleId?: string;
}) {
  const personId = input.personId ?? (await getDemoPersonId());
  const tools = createPrismaTools();
  await tools.saveRecommendationInteraction({ ...input, personId });

  if (input.type === "REJECTED" && input.reason) {
    const mapped = applyRejectionToMemory(input.reason);
    if (mapped) {
      await tools.proposeMemoryUpdates([
        {
          subjectType: "PERSON",
          subjectId: personId,
          statement: mapped.statement,
          category: mapped.category,
          confidence: 0.7,
          evidenceIds: [input.targetId],
          mutation: "CREATE",
        },
      ]);
    }
    if (input.reason === "too_far") {
      const existing = await prisma.preference.findFirst({
        where: { personId, key: "travel_tolerance_km" },
      });
      const next = Math.max(4, (existing ? Number(existing.value) : 12) - 3);
      if (existing) {
        await prisma.preference.update({ where: { id: existing.id }, data: { value: String(next), weight: existing.weight + 0.1 } });
      } else {
        await prisma.preference.create({
          data: {
            personId,
            type: "CONSTRAINT",
            key: "travel_tolerance_km",
            value: String(next),
            source: "BEHAVIOURAL",
            confidence: 0.66,
            narrative: "Inferred from a too-far rejection.",
          },
        });
      }
    }
    if (!shouldTouchAffinity(input.reason) && input.targetId) {
      // Distance/budget/effort rejections must not weaken activity affinity.
    }
  }

  if (input.type === "SAVED") {
    await prisma.plan.updateMany({ where: { id: input.targetId }, data: { status: "SAVED" } });
    await prisma.favorite.create({
      data: { personId, targetType: input.targetType, targetId: input.targetId, title: "Saved plan" },
    });
  }

  return { ok: true, affinityTouched: shouldTouchAffinity(input.reason) };
}

export async function getKarma(personId?: string, period = 30) {
  const id = personId ?? (await getDemoPersonId());
  const experiences = await prisma.leisureExperience.findMany({ where: { personId: id } });
  return computeKarma(experiences.map(mapExperience), period);
}

export async function getLeisureInsight(personId?: string) {
  const forYou = await getForYou(personId);
  return { insight: forYou.insight, nudge: forYou.nudge };
}

export async function getPlans(personId?: string, tab: "UPCOMING" | "SAVED" | "DONE" = "UPCOMING") {
  const id = personId ?? (await getDemoPersonId());
  const status = tab === "UPCOMING" ? ["UPCOMING"] : tab === "SAVED" ? ["SAVED", "DRAFT"] : ["DONE"];
  const rows = await prisma.plan.findMany({
    where: { personId: id, status: { in: status } },
    include: { steps: true },
    orderBy: { startAt: "desc" },
  });
  return rows.map(mapPlan);
}

export async function getBookings(personId?: string) {
  const id = personId ?? (await getDemoPersonId());
  return prisma.booking.findMany({ where: { personId: id }, orderBy: { startsAt: "asc" } });
}

export async function getCircles(personId?: string) {
  const id = personId ?? (await getDemoPersonId());
  const rows = await prisma.circle.findMany({ where: { personId: id }, include: { members: true } });
  return rows.map(mapCircle);
}

export async function getFavorites(personId?: string) {
  const id = personId ?? (await getDemoPersonId());
  return prisma.favorite.findMany({ where: { personId: id }, orderBy: { createdAt: "desc" } });
}

export async function getProfile(personId?: string) {
  const id = personId ?? (await getDemoPersonId());
  const person = await prisma.person.findUniqueOrThrow({ where: { id } });
  const memories = await prisma.memory.findMany({
    where: { personId: id, status: "ACTIVE" },
    include: { evidence: true },
    orderBy: { confidence: "desc" },
  });
  return { person: mapPerson(person), memories };
}

export async function getDevSnapshot() {
  return {
    engine: ENGINE_LABEL,
    providers: PROVIDERS,
    connectors: await Promise.all(
      listConnectors().map(async (connector) => ({
        sourceId: connector.sourceId,
        health: await connector.healthCheck(),
      })),
    ),
    policyExample: validateMemoryProposal(
      {
        subjectType: "PERSON",
        subjectId: DEMO_PERSON_ID,
        statement: "Likes going to concerts alone.",
        category: "music_solo",
        confidence: 0.9,
        evidenceIds: ["demo"],
        mutation: "CREATE",
      },
      [],
      [],
    ),
  };
}

const ENGINE_LABEL = "leisure-agent.v0";

function karmaNudge(karma: { dominant: string[]; underrepresented: string[] }) {
  if (karma.dominant.includes("culture") && karma.underrepresented.includes("move")) {
    return {
      title: "A little more air this weekend?",
      body: "Culture and social evenings have been doing most of the work. If you want, I can bias the next stretch toward something outdoors or made with your hands.",
    };
  }
  return {
    title: "Your leisure has a shape",
    body: "Nothing here is a score. It is just a gentle reading of how your time has been landing.",
  };
}
