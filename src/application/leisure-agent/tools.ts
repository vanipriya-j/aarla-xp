import type { LeisureAgentTools } from "@/application/leisure-agent/types";
import { mapActivity, mapCircle, mapEvent, mapExperience, mapIntent, mapMemory, mapPerson, mapPlace, mapPlan, mapPreference } from "@/db/map";
import { prisma } from "@/db/prisma";
import type { Activity, LeisureIntent, MemoryProposal } from "@/domains/types";
import { calculateRoute, computeKarma, validateBudget, validateTimeWindow } from "@/services/deterministic";
import { validateMemoryProposal } from "@/services/memory/policy";
import { actionsForNeed } from "@/services/providers";

function matchesQuery(activity: Activity, query: { text?: string; tags?: string[]; audience?: string[]; excludeTouristy?: boolean }) {
  const haystack = `${activity.name} ${activity.summary} ${activity.tags.join(" ")} ${activity.audience.join(" ")}`.toLowerCase();
  if (query.excludeTouristy && activity.touristyScore > 0.62) return false;
  if (query.audience?.length && !query.audience.some((a) => activity.audience.includes(a) || activity.audience.includes("any"))) {
    if (!query.audience.some((a) => haystack.includes(a))) return false;
  }
  if (query.tags?.length && !query.tags.some((tag) => haystack.includes(tag.toLowerCase()))) return false;
  if (query.text) {
    const tokens = query.text.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
    if (tokens.length && !tokens.some((token) => haystack.includes(token))) return false;
  }
  return true;
}

export function createPrismaTools(): LeisureAgentTools {
  return {
    async getPersonMemory(personId) {
      const person = await prisma.person.findUniqueOrThrow({ where: { id: personId } });
      const preferences = await prisma.preference.findMany({ where: { personId } });
      const memories = await prisma.memory.findMany({
        where: { personId, status: "ACTIVE" },
        include: { evidence: true },
      });
      const travel = preferences.find((p) => p.key === "travel_tolerance_km");
      return {
        person: mapPerson(person),
        preferences: preferences.map(mapPreference),
        memories: memories.map(mapMemory),
        travelToleranceKm: travel ? Number(travel.value) : undefined,
      };
    },

    async listCircles(personId) {
      const rows = await prisma.circle.findMany({ where: { personId } });
      return rows.map((row) => ({ id: row.id, name: row.name, slug: row.slug }));
    },

    async getCircleMemory(circleId) {
      const circle = await prisma.circle.findUnique({
        where: { id: circleId },
        include: { members: true },
      });
      if (!circle) return null;
      const preferences = await prisma.preference.findMany({ where: { circleId } });
      const memories = await prisma.memory.findMany({
        where: { circleId, status: "ACTIVE" },
        include: { evidence: true },
      });
      return {
        circle: mapCircle(circle),
        preferences: preferences.map(mapPreference),
        memories: memories.map(mapMemory),
      };
    },

    async getLeisureHistory(personId, circleId) {
      const rows = await prisma.leisureExperience.findMany({
        where: { personId, ...(circleId ? { circleId } : {}) },
        orderBy: { happenedAt: "desc" },
      });
      return rows.map(mapExperience);
    },

    async getKarma(personId, period = 30) {
      const history = await this.getLeisureHistory(personId);
      return computeKarma(history, period);
    },

    async searchExperiences(query) {
      const rows = await prisma.activity.findMany({ include: { place: true } });
      return rows
        .map(mapActivity)
        .filter((activity) => matchesQuery(activity, query))
        .filter((activity) => (query.maxDuration ? activity.durationMin <= query.maxDuration + 10 : true))
        .filter((activity) => (query.maxBudget && activity.priceMin != null ? activity.priceMin <= query.maxBudget : true))
        .map((activity) => ({ activity }));
    },

    async searchEvents(query) {
      const rows = await prisma.event.findMany();
      const text = query.text?.toLowerCase() ?? "";
      return rows.map(mapEvent).filter((event) => !text || `${event.name} ${event.summary ?? ""}`.toLowerCase().includes(text));
    },

    async searchPlaces(query) {
      const rows = await prisma.place.findMany();
      const text = query.text?.toLowerCase() ?? "";
      return rows.map(mapPlace).filter((place) => !text || `${place.name} ${place.neighborhood ?? ""} ${place.tags.join(" ")}`.toLowerCase().includes(text));
    },

    async validateTimeWindow(candidate, intent) {
      return validateTimeWindow(candidate.durationMinutes, intent);
    },

    async validateBudget(candidate, intent) {
      return validateBudget(candidate.estimatedSpendMax, intent);
    },

    async calculateRoute(input) {
      return calculateRoute(input.from, input.to);
    },

    async searchDining(input) {
      return this.searchExperiences({ ...input, tags: [...(input.tags ?? []), "food", "coffee", "dining"] });
    },

    async getTransportOptions() {
      return actionsForNeed("transport");
    },

    async getProviderActions(input) {
      return actionsForNeed(input.need);
    },

    async saveIntent(intent) {
      const row = await persistIntent(intent);
      return mapIntent(row);
    },

    async createPlan(input) {
      const created = await prisma.plan.create({
        data: {
          id: input.id,
          personId: input.personId,
          circleId: input.circleId,
          intentId: input.intentId,
          title: input.title,
          personality: input.personality,
          explanation: input.explanation,
          startAt: input.startAt,
          endAt: input.endAt,
          durationMinutes: input.durationMinutes,
          estimatedSpendMin: input.estimatedSpendMin,
          estimatedSpendMax: input.estimatedSpendMax,
          currency: input.currency,
          status: input.status,
          stopCount: input.stopCount,
          effort: input.effort,
          imageUrl: input.imageUrl,
          steps: {
            create: input.steps.map((step) => ({
              sortOrder: step.sortOrder,
              kind: step.kind,
              title: step.title,
              description: step.description,
              startsAt: step.startsAt,
              durationMin: step.durationMin,
              placeId: step.placeId,
              activityId: step.activityId,
              eventId: step.eventId,
              actionKind: step.actionKind,
              status: step.status ?? "PLANNED",
            })),
          },
        },
        include: { steps: { orderBy: { sortOrder: "asc" } } },
      });
      return mapPlan(created);
    },

    async saveRecommendation(input) {
      await prisma.recommendation.create({
        data: {
          personId: input.personId,
          intentId: input.intentId,
          planId: input.planId,
          label: input.label,
          title: input.title,
          reason: input.reason,
          finalScore: input.finalScore,
          ranking: input.ranking,
          signalsJson: JSON.stringify(input.signals),
          engineVersion: input.engineVersion,
        },
      });
    },

    async modifyPlan(planId, changes) {
      const updated = await prisma.plan.update({
        where: { id: planId },
        data: {
          title: changes.title,
          explanation: changes.explanation,
          status: changes.status,
          circleId: changes.circleId,
        },
        include: { steps: { orderBy: { sortOrder: "asc" } } },
      });
      return mapPlan(updated);
    },

    async saveRecommendationInteraction(input) {
      await prisma.interaction.create({ data: input });
    },

    async proposeMemoryUpdates(input) {
      const accepted: MemoryProposal[] = [];
      for (const proposal of input) {
        const existing = await prisma.memory.findMany({
          where: { personId: proposal.subjectType === "PERSON" ? proposal.subjectId : undefined },
          include: { evidence: true },
        });
        const preferences = await prisma.preference.findMany({
          where: { personId: proposal.subjectType === "PERSON" ? proposal.subjectId : undefined },
        });
        const decision = validateMemoryProposal(proposal, existing.map(mapMemory), preferences.map(mapPreference));
        await prisma.memoryProposal.create({
          data: {
            personId: proposal.subjectType === "PERSON" ? proposal.subjectId : existing[0]?.personId ?? proposal.subjectId,
            subjectType: proposal.subjectType,
            subjectId: proposal.subjectId,
            statement: proposal.statement,
            category: proposal.category,
            confidence: proposal.confidence,
            mutation: proposal.mutation,
            evidenceJson: JSON.stringify(proposal.evidenceIds),
            status: decision.action === "REJECT" ? "REJECTED" : "ACCEPTED",
          },
        });
        if (decision.action !== "REJECT") accepted.push(proposal);
      }
      return accepted;
    },
  };
}

export async function persistIntent(intent: LeisureIntent) {
  return prisma.leisureIntent.create({
    data: {
      id: intent.id,
      personId: intent.personId,
      circleId: intent.circleId,
      rawInput: intent.rawInput,
      startAt: intent.startAt,
      endAt: intent.endAt,
      durationMinutes: intent.durationMinutes,
      startingLocation: intent.startingLocation,
      budgetAmount: intent.budget?.amount,
      budgetCurrency: intent.budget?.currency ?? "INR",
      budgetScope: intent.budget?.scope,
      budgetFlexibility: intent.budget?.flexibility,
      companionsJson: JSON.stringify(intent.companions ?? null),
      moodJson: JSON.stringify(intent.mood ?? []),
      energy: intent.energy,
      positiveIntentsJson: JSON.stringify(intent.positiveIntents),
      negativeIntentsJson: JSON.stringify(intent.negativeIntents),
      occasion: intent.occasion,
      visitorContext: intent.visitorContext,
      hardConstraintsJson: JSON.stringify(intent.hardConstraints),
      softPreferencesJson: JSON.stringify(intent.softPreferences),
      inferredContextJson: JSON.stringify(intent.inferredContext),
    },
  });
}
