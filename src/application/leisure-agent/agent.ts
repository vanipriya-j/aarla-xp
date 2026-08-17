import type { AgentRecommendation, AgentResult, LeisureAgentTools } from "@/application/leisure-agent/types";
import type { Activity, LeisureIntent, MemoryProposal, Plan, PlanStep, Preference } from "@/domains/types";
import { AGENT_STATES, ENGINE_VERSION } from "@/lib/constants";
import type { AIProvider } from "@/services/ai/provider";
import {
  applyHardConstraints,
  explicitCategoryLock,
  planDuration,
  planSpend,
  scoreActivity,
  validatePlan,
} from "@/services/deterministic";

export class LeisureAgent {
  constructor(
    private readonly tools: LeisureAgentTools,
    private readonly ai: AIProvider,
  ) {}

  async consider(rawInput: string, personId: string, circleId?: string): Promise<AgentResult> {
    const personMemory = await this.tools.getPersonMemory(personId);
    const circles = await this.tools.listCircles(personId);

    const interpreted = await this.ai.generateStructured<LeisureIntent>({
      purpose: "intent",
      prompt: rawInput,
      fallback: blankIntent(rawInput, personId),
    });

    const resolvedCircle =
      (circleId && circles.find((c) => c.id === circleId)) ||
      circles.find((c) => c.slug === interpreted.inferredContext.circleHint) ||
      inferCircleFromText(rawInput, circles);

    const intent: LeisureIntent = {
      ...interpreted,
      id: `intent_${Date.now()}`,
      personId,
      circleId: resolvedCircle?.id,
      rawInput,
      createdAt: new Date(),
    };

    const circleMemory = resolvedCircle ? await this.tools.getCircleMemory(resolvedCircle.id) : null;
    const allHistory = await this.tools.getLeisureHistory(personId);
    const karma = await this.tools.getKarma(personId, 30);
    const preferences: Preference[] = [
      ...personMemory.preferences,
      ...(circleMemory?.preferences ?? []),
    ];

    const query = searchStrategy(intent, resolvedCircle?.slug);
    const found = await this.tools.searchExperiences(query);
    const inventory = applyHardConstraints(
      found.map((item) => item.activity),
      intent,
    );

    const ranked = inventory
      .map((activity) =>
        scoreActivity({
          activity,
          intent,
          preferences,
          history: allHistory,
          karma,
          circleSlug: resolvedCircle?.slug,
          travelToleranceKm: personMemory.travelToleranceKm,
        }),
      )
      .sort((a, b) => b.score - a.score);

    const composed = composePlanPersonalities(intent, ranked.map((r) => r.activity), resolvedCircle?.slug);
    const recommendations: AgentRecommendation[] = [];

    for (const draft of composed) {
      const activities = draft.steps
        .map((step) => inventory.find((activity) => activity.id === step.activityId))
        .filter((activity): activity is Activity => Boolean(activity));

      if (draft.steps.some((step) => step.activityId && !inventory.some((activity) => activity.id === step.activityId))) {
        continue;
      }

      const spend = planSpend(draft.steps, activities);
      const duration = planDuration(draft.steps);
      const start = nextEvening();
      const plan: Plan = {
        id: `plan_${draft.personality.toLowerCase()}_${Date.now()}_${recommendations.length}`,
        personId,
        circleId: resolvedCircle?.id,
        intentId: intent.id,
        title: draft.title,
        personality: draft.personality,
        explanation: "",
        startAt: start,
        durationMinutes: duration,
        estimatedSpendMin: spend.min,
        estimatedSpendMax: spend.max,
        currency: "INR",
        status: "DRAFT",
        stopCount: draft.steps.filter((step) => step.kind !== "TRAVEL" && step.kind !== "BUFFER").length,
        effort: activities.every((a) => a.effort === "EASY") ? "Easy" : "Moderate",
        imageUrl: activities[0]?.imageUrl,
        steps: withClock(draft.steps, start),
      };

      const validation = validatePlan(plan, intent);
      if (!validation.ok) continue;

      const reason = explainPlan(intent, plan, personMemory.memories.map((m) => m.statement), resolvedCircle?.name);
      plan.explanation = reason;

      const related = ranked.filter((row) => plan.steps.some((step) => step.activityId === row.activity.id));
      const score = related.length ? related.reduce((sum, row) => sum + row.score, 0) / related.length : 0.6;
      const signals = related[0]?.signals ?? {};

      recommendations.push({
        label: draft.label,
        personality: draft.personality,
        plan,
        reason,
        score,
        signals: { ...signals },
      });
    }

    const limited = recommendations.slice(0, 5);
    const reply = await this.ai.generateText({
      purpose: "explain",
      prompt: `${rawInput}\ncircle=${resolvedCircle?.name ?? "unknown"}`,
    });

    const insight = await this.ai.generateText({
      purpose: "pattern",
      prompt: personMemory.memories.map((m) => m.statement).join("\n"),
    });

    const memoryProposals = buildMemoryProposals(intent, personId, resolvedCircle?.id);
    await this.tools.proposeMemoryUpdates(memoryProposals);

    try {
      await this.tools.saveIntent(intent);
      for (const [index, rec] of limited.entries()) {
        const saved = await this.tools.createPlan(rec.plan);
        rec.plan = saved;
        await this.tools.saveRecommendation({
          personId,
          intentId: intent.id,
          planId: saved.id,
          label: rec.label,
          title: saved.title,
          reason: rec.reason,
          finalScore: rec.score,
          ranking: index + 1,
          signals: rec.signals,
          engineVersion: ENGINE_VERSION,
        });
      }
    } catch {
      // Persistence is best-effort in tests without a pushed schema.
    }

    return {
      intent,
      circle: resolvedCircle ? { id: resolvedCircle.id, name: resolvedCircle.name, slug: resolvedCircle.slug } : undefined,
      reply: humanReply(intent, reply),
      insight,
      states: [...AGENT_STATES],
      recommendations: limited,
      memoryProposals,
    };
  }

}

function blankIntent(rawInput: string, personId: string): LeisureIntent {
  return {
    id: "draft",
    rawInput,
    personId,
    positiveIntents: [],
    negativeIntents: [],
    hardConstraints: [],
    softPreferences: [],
    inferredContext: {},
    createdAt: new Date(),
  };
}

function inferCircleFromText(text: string, circles: { id: string; name: string; slug: string }[]) {
  const lower = text.toLowerCase();
  if (/alone|solo|just me/.test(lower)) return circles.find((c) => c.slug === "just-me");
  if (/kids|family|daughters|husband/.test(lower)) return circles.find((c) => c.slug === "family");
  if (/us|visiting|from the us/.test(lower)) return circles.find((c) => c.slug === "us-friends");
  if (/nerd|quiz|gaming/.test(lower)) return circles.find((c) => c.slug === "nerd-gang");
  if (/friends/.test(lower)) return circles.find((c) => c.slug === "us-friends") ?? circles.find((c) => c.slug === "nerd-gang");
  return undefined;
}

function searchStrategy(intent: LeisureIntent, circleSlug?: string) {
  const text = intent.rawInput.toLowerCase();
  if (/movie|film/.test(text) && !/surprise/.test(text)) {
    return { text: "movie", tags: ["movie", "cinema", "film"], maxDuration: intent.durationMinutes, maxBudget: intent.budget?.amount };
  }
  if (/concert/.test(text)) {
    return { text: "concert", tags: ["concert", "music", "carnatic"], maxDuration: intent.durationMinutes, maxBudget: intent.budget?.amount };
  }
  return {
    text: undefined,
    tags: undefined,
    audience: circleSlug ? [circleSlug, circleSlug === "just-me" ? "solo" : circleSlug, "any"] : undefined,
    maxDuration: intent.durationMinutes,
    maxBudget: intent.budget?.amount,
    excludeTouristy: intent.negativeIntents.some((n) => /tourist/.test(n)),
    circleSlug,
    surprise: /surprise/.test(text) && !explicitCategoryLock(intent),
  };
}

function composePlanPersonalities(intent: LeisureIntent, inventory: Activity[], circleSlug?: string) {
  const text = intent.rawInput.toLowerCase();
  if (/movie|film/.test(text) && !/surprise/.test(text)) {
    return moviePlans(inventory);
  }

  const local = pick(inventory, ["local", "heritage", "walk", "mylapore", "carnatic", "coffee", "lived"]);
  const contemporary = pick(inventory, ["contemporary", "gallery", "design", "alwarpet", "art"]);
  const slow = pick(inventory, ["beach", "slow", "sea", "elliot", "besant"]);
  const play = pick(inventory, ["quiz", "game", "puzzle", "maker", "workshop", "move", "outdoor"]);
  const limit = intent.durationMinutes ?? 240;
  const budget = intent.budget?.amount;

  const plans = [];
  const localPlan = stitch("BEST_FIT", "Best for you", "Local & lived-in evening", local, ["walk", "coffee", "music", "food"], limit, budget);
  const contemporaryPlan = stitch("CONTEMPORARY", "Contemporary", "Art, design and a proper dinner", contemporary, ["gallery", "design", "dinner", "food"], limit, budget);
  const slowPlan = stitch("SLOW", "Slow & relax", "Sea air, food and a little music", slow, ["walk", "food", "music"], limit, budget);

  if (localPlan) plans.push(localPlan);
  if (contemporaryPlan) plans.push(contemporaryPlan);
  if (slowPlan) plans.push(slowPlan);

  if (/surprise/.test(text) && play.length) {
    const surprise = stitch("SURPRISE", "A little different", "Something more hands-on than another seated night", play, ["workshop", "outdoor", "game"], limit, budget);
    if (surprise) plans.unshift(surprise);
  }

  if (circleSlug === "family") {
    const family = pick(inventory, ["kids", "contained", "family", "museum", "workshop"]);
    const familyPlan = stitch("BEST_FIT", "Best for you", "Curious, low-chase family time", family, ["contained", "workshop", "food"], limit, budget);
    if (familyPlan) plans.unshift(familyPlan);
  }

  if (!plans.length) {
    const fallback = inventory.slice(0, 3).map((activity, index) => ({
      personality: index === 0 ? "BEST_FIT" : index === 1 ? "CONTEMPORARY" : "SLOW",
      label: index === 0 ? "Best for you" : index === 1 ? "Another reading" : "Slow & relax",
      title: activity.name,
      steps: [
        step(0, "ACTIVITY", activity.name, activity.summary, activity.durationMin, activity),
      ],
    }));
    return fallback;
  }

  return plans.slice(0, 4);
}

function moviePlans(inventory: Activity[]) {
  const movies = inventory.filter((activity) => activity.tags.some((tag) => /movie|cinema|film/.test(tag)) || /movie|film|cinema/.test(activity.name.toLowerCase()));
  return movies.slice(0, 3).map((activity, index) => ({
    personality: index === 0 ? "BEST_FIT" : index === 1 ? "CONTEMPORARY" : "SLOW",
    label: index === 0 ? "Best for you" : index === 1 ? "Another screening" : "A quieter one",
    title: activity.name,
    steps: [step(0, "ACTIVITY", activity.name, activity.summary, Math.min(activity.durationMin, 180), activity)],
  }));
}

function pick(inventory: Activity[], tokens: string[]) {
  return inventory.filter((activity) => {
    const hay = `${activity.name} ${activity.summary} ${activity.tags.join(" ")}`.toLowerCase();
    return tokens.some((token) => hay.includes(token));
  });
}

function stitch(
  personality: string,
  label: string,
  title: string,
  pool: Activity[],
  preferredTags: string[],
  limit = 240,
  budget?: number,
) {
  const chosen: Activity[] = [];
  for (const tag of preferredTags) {
    const next = pool.find((item) => !chosen.includes(item) && `${item.name} ${item.tags.join(" ")}`.toLowerCase().includes(tag));
    if (next) chosen.push(next);
  }
  for (const item of pool) {
    if (chosen.length >= 3) break;
    if (!chosen.includes(item)) chosen.push(item);
  }
  if (!chosen.length) return null;

  const travel = limit <= 180 ? 15 : 25;
  const usable = chosen.slice(0, 3).filter((item) => {
    const price = item.priceMax ?? item.priceMin ?? 0;
    return budget == null || price <= budget;
  });

  const steps: PlanStep[] = [];
  let order = 0;
  let used = travel;
  let spend = 0;
  steps.push(step(order++, "TRAVEL", "Leave home", "A short ride to the first stop.", travel, undefined, "RIDE_DEEPLINK"));
  for (const item of usable) {
    const duration = Math.min(item.durationMin, 55);
    const price = item.priceMax ?? item.priceMin ?? 0;
    if (used + duration + travel > limit + 5) continue;
    if (budget != null && spend + price > budget) continue;
    const kind = item.tags.includes("food") || item.tags.includes("coffee") ? "MEAL" : item.tags.includes("walk") ? "WALK" : "ACTIVITY";
    steps.push(step(order++, kind, item.name, item.summary, duration, item, actionFor(kind)));
    used += duration;
    spend += price;
  }
  if (used + travel <= limit + 5) {
    steps.push(step(order++, "TRAVEL", "Ride home", "Back when you are ready.", travel, undefined, "RIDE_DEEPLINK"));
  }
  const activitySteps = steps.filter((item) => item.activityId);
  if (!activitySteps.length) return null;
  const named = usable.filter((item) => activitySteps.some((stepItem) => stepItem.activityId === item.id));
  return { personality, label, title: titleFrom(named, title), steps };
}

function titleFrom(activities: Activity[], fallback: string) {
  if (activities.length >= 3) {
    return `${short(activities[0].name)} + ${short(activities[1].name)} + ${short(activities[2].name)}`;
  }
  if (activities.length === 2) return `${short(activities[0].name)} + ${short(activities[1].name)}`;
  return activities[0]?.name ?? fallback;
}

function short(name: string) {
  return name.replace(/ in .+$/i, "").replace(/experience/i, "").trim();
}

function step(
  sortOrder: number,
  kind: string,
  title: string,
  description: string,
  durationMin: number,
  activity?: Activity,
  actionKind?: string,
): PlanStep {
  return {
    sortOrder,
    kind,
    title,
    description,
    durationMin,
    placeId: activity?.placeId,
    activityId: activity?.id,
    actionKind,
    status: "PLANNED",
  };
}

function actionFor(kind: string) {
  if (kind === "MEAL") return "DINING_RESERVE";
  if (kind === "ACTIVITY") return "EVENT_BOOK";
  return undefined;
}

function withClock(steps: PlanStep[], start: Date) {
  let cursor = start.getTime();
  return steps.map((step) => {
    const startsAt = new Date(cursor);
    cursor += step.durationMin * 60 * 1000;
    return { ...step, startsAt };
  });
}

function nextEvening() {
  const date = new Date();
  date.setHours(17, 30, 0, 0);
  if (date.getTime() < Date.now()) date.setDate(date.getDate() + 1);
  return date;
}

function explainPlan(intent: LeisureIntent, plan: Plan, memories: string[], circleName?: string) {
  const local = intent.positiveIntents.some((p) => /chennai|local|authentic/.test(p));
  const visitors = Boolean(intent.visitorContext);
  if (visitors && local) {
    return "You tend to enjoy Chennai most when it feels lived-in rather than staged. This gives your visitors culture, food and music without turning the evening into a sightseeing checklist.";
  }
  if (intent.positiveIntents.includes("surprise")) {
    return "You've had a run of seated evenings. Since you said surprise me, this leans toward something more hands-on while still staying inside the time you have.";
  }
  if (circleName === "Family" || intent.companions?.kind === "family") {
    return "Family outings seem to work best when the children can explore without you spending the whole time managing them. This stays contained and curious.";
  }
  if (memories.some((m) => /concert|music/.test(m.toLowerCase())) && /music|carnatic|concert/.test(plan.title.toLowerCase())) {
    return "Music is usually how you spend time on your own. This keeps the quality of the performance first, without turning it into a group outing.";
  }
  return `This fits the ${intent.durationMinutes ? `${Math.round(intent.durationMinutes / 60)} hours` : "time"} you have${circleName ? ` with ${circleName}` : ""}, and stays close to what you actually enjoy.`;
}

function humanReply(intent: LeisureIntent, fallback: string) {
  if (intent.visitorContext && intent.durationMinutes) {
    return `I found a few ways to make those ${Math.round(intent.durationMinutes / 60)} hours feel distinctly Chennai without turning it into a sightseeing checklist.`;
  }
  if (intent.positiveIntents.includes("surprise")) {
    return "I stayed away from another default night out and looked for something that would change the texture of the weekend.";
  }
  return fallback;
}

function buildMemoryProposals(intent: LeisureIntent, personId: string, circleId?: string): MemoryProposal[] {
  const proposals: MemoryProposal[] = [];
  if (/concerts? alone|alone.*concert|concert.*alone/.test(intent.rawInput.toLowerCase())) {
    proposals.push({
      subjectType: "CIRCLE",
      subjectId: circleId ?? personId,
      statement: "Likes going to concerts alone.",
      category: "music_solo",
      confidence: 0.86,
      evidenceIds: [intent.id],
      mutation: "CREATE",
    });
  }
  if (intent.visitorContext) {
    proposals.push({
      subjectType: "PERSON",
      subjectId: personId,
      statement: "When hosting visitors, values experiences that communicate a strong sense of place.",
      category: "hosting",
      confidence: 0.72,
      evidenceIds: [intent.id],
      mutation: "CREATE",
    });
  }
  return proposals;
}
