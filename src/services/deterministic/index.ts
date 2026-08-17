import {
  type Activity,
  type IntentConstraint,
  type LeisureExperience,
  type LeisureIntent,
  type Plan,
  type PlanStep,
  type Preference,
  type RankedCandidate,
  type RouteResult,
  type ScoreSignals,
  type ValidationResult,
  type XPKarma,
  KARMA_DIMENSIONS,
  type KarmaDimension,
} from "@/domains/types";

export function emptySignals(): ScoreSignals {
  return {
    preferenceFit: 0,
    circleFit: 0,
    contextFit: 0,
    timingFit: 0,
    distanceFit: 0.7,
    budgetFit: 0.7,
    novelty: 0.6,
    karmaDiversity: 0.5,
    quality: 0.7,
    repetitionPenalty: 0,
    dislikePenalty: 0,
    parentalFit: 0.5,
  };
}

export function validateTimeWindow(
  durationMinutes: number,
  intent: Pick<LeisureIntent, "durationMinutes">,
): ValidationResult {
  const limit = intent.durationMinutes;
  if (limit == null) return { ok: true, reasons: [] };
  if (durationMinutes > limit + 10) {
    return {
      ok: false,
      reasons: [`Needs about ${durationMinutes} minutes; you only have ${limit}.`],
    };
  }
  return { ok: true, reasons: [] };
}

export function validateBudget(
  spendMax: number | undefined,
  intent: Pick<LeisureIntent, "budget">,
): ValidationResult {
  const cap = intent.budget?.amount;
  if (cap == null || spendMax == null) return { ok: true, reasons: [] };
  const slack = intent.budget?.flexibility === "STRICT" ? 0 : cap * 0.08;
  if (spendMax > cap + slack) {
    return {
      ok: false,
      reasons: [`Estimated spend ₹${spendMax} exceeds the ₹${cap} budget.`],
    };
  }
  return { ok: true, reasons: [] };
}

export function validatePlan(plan: Plan, intent: LeisureIntent): ValidationResult {
  const reasons: string[] = [];
  const time = validateTimeWindow(plan.durationMinutes, intent);
  const budget = validateBudget(plan.estimatedSpendMax, intent);
  if (!time.ok) reasons.push(...time.reasons);
  if (!budget.ok) reasons.push(...budget.reasons);

  const stepMinutes = plan.steps.reduce((sum, step) => sum + step.durationMin, 0);
  if (stepMinutes > plan.durationMinutes + 15) {
    reasons.push("Step timings do not fit the stated window.");
  }

  return { ok: reasons.length === 0, reasons };
}

export function calculateRoute(from?: { lat?: number; lng?: number }, to?: { lat?: number; lng?: number }): RouteResult {
  if (!from?.lat || !from.lng || !to?.lat || !to.lng) {
    return { minutes: 25, effort: "MODERATE", mode: "ride" };
  }
  const km = haversineKm(from.lat, from.lng, to.lat, to.lng);
  const minutes = Math.max(12, Math.round(km * 4.2 + 8));
  const effort = minutes < 20 ? "LOW" : minutes < 40 ? "MODERATE" : "HIGH";
  return { minutes, effort, mode: minutes < 18 ? "walk" : "ride" };
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg(lat2 - lat1);
  const dLon = deg(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg(lat1)) * Math.cos(deg(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg(n: number) {
  return (n * Math.PI) / 180;
}

export function computeKarma(
  experiences: LeisureExperience[],
  windowDays = 30,
  now = new Date(),
): XPKarma {
  const cutoff = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  const recent = experiences.filter((item) => item.happenedAt >= cutoff);
  const totals = Object.fromEntries(KARMA_DIMENSIONS.map((d) => [d, 0])) as Record<KarmaDimension, number>;

  for (const item of recent) {
    for (const dimension of KARMA_DIMENSIONS) {
      totals[dimension] += item.karma[dimension] ?? 0;
    }
  }

  const sum = KARMA_DIMENSIONS.reduce((acc, d) => acc + totals[d], 0);
  const percents = Object.fromEntries(
    KARMA_DIMENSIONS.map((d) => [d, sum === 0 ? 0 : Math.round((totals[d] / sum) * 100)]),
  ) as Record<KarmaDimension, number>;

  const ranked = [...KARMA_DIMENSIONS].sort((a, b) => percents[b] - percents[a]);
  return {
    windowDays,
    totals,
    percents,
    dominant: ranked.filter((d) => percents[d] >= 16).slice(0, 3),
    underrepresented: ranked.filter((d) => percents[d] <= 8).slice(-3).reverse(),
  };
}

export function scoreActivity(input: {
  activity: Activity;
  intent: LeisureIntent;
  preferences: Preference[];
  history: LeisureExperience[];
  karma: XPKarma;
  circleSlug?: string;
  travelToleranceKm?: number;
}): RankedCandidate {
  const { activity, intent, preferences, history, karma, circleSlug, travelToleranceKm } = input;
  const signals = emptySignals();
  const text = `${intent.rawInput} ${intent.positiveIntents.join(" ")}`.toLowerCase();
  const negatives = intent.negativeIntents.map((n) => n.toLowerCase());

  signals.quality = activity.quality;
  signals.timingFit = intent.durationMinutes
    ? clamp(1 - Math.max(0, activity.durationMin - intent.durationMinutes) / Math.max(intent.durationMinutes, 1))
    : 0.75;

  if (intent.budget?.amount != null && activity.priceMax != null) {
    signals.budgetFit = activity.priceMax <= intent.budget.amount ? 1 : 0.15;
  }

  const likes = preferences.filter((p) => p.type === "LIKE" || p.key === "like");
  const dislikes = preferences.filter((p) => p.type === "DISLIKE" || p.key === "dislike");

  signals.preferenceFit = averageMatch(activity, likes, 0.45);
  signals.dislikePenalty = averageMatch(activity, dislikes, 0);

  if (circleSlug) {
    const circlePrefs = preferences.filter((p) => p.circleId);
    signals.circleFit = circlePrefs.length ? averageMatch(activity, circlePrefs, 0.4) : audienceFit(activity, circleSlug);
  } else {
    signals.circleFit = 0.5;
  }

  let context = 0.4;
  if (intent.positiveIntents.some((p) => /chennai|local|lived|authentic|place/.test(p.toLowerCase()))) {
    context += (1 - activity.touristyScore) * 0.35;
    if (activity.tags.some((t) => /local|heritage|chennai|carnatic|filter|neighbourhood|neighborhood/.test(t))) {
      context += 0.2;
    }
  }
  if (negatives.some((n) => /tourist/.test(n))) {
    context -= activity.touristyScore * 0.55;
  }
  if (intent.mood?.some((m) => /low|gentle|slow/.test(m)) && activity.effort === "EASY") context += 0.15;
  if (intent.energy === "low" && activity.effort !== "EASY") context -= 0.2;
  signals.contextFit = clamp(context);

  const done = history.filter((h) => h.activityId === activity.id || titlesSimilar(h.title, activity.name));
  signals.repetitionPenalty = Math.min(0.8, done.length * 0.28);
  signals.novelty = clamp(0.85 - signals.repetitionPenalty);

  const surprise = /surprise/.test(text) && !explicitCategoryLock(intent);
  if (surprise) {
    const activityKarma = dominantKarma(activity.karma);
    signals.karmaDiversity = karma.underrepresented.includes(activityKarma) ? 0.95 : karma.dominant.includes(activityKarma) ? 0.2 : 0.55;
  } else {
    signals.karmaDiversity = 0.5;
  }

  if (circleSlug === "family" || intent.companions?.kind === "family") {
    const effort = activity.parentalEffort ?? "MEDIUM";
    signals.parentalFit = effort === "LOW" ? 1 : effort === "MEDIUM" ? 0.45 : 0.1;
    if (activity.tags.includes("unstructured-crowd")) signals.parentalFit -= 0.35;
    if (activity.tags.includes("contained") || activity.tags.includes("kids-independent")) signals.parentalFit += 0.2;
  }

  if (travelToleranceKm != null && activity.travelEffort === "HIGH") {
    signals.distanceFit = travelToleranceKm >= 15 ? 0.55 : 0.2;
  } else if (activity.travelEffort === "LOW") {
    signals.distanceFit = 0.9;
  }

  const weights = {
    preferenceFit: 0.16,
    circleFit: 0.14,
    contextFit: 0.16,
    timingFit: 0.08,
    distanceFit: 0.07,
    budgetFit: 0.1,
    novelty: 0.05,
    karmaDiversity: surprise ? 0.12 : 0.03,
    quality: 0.08,
    parentalFit: circleSlug === "family" ? 0.12 : 0.03,
    repetitionPenalty: -0.1,
    dislikePenalty: -0.14,
  } as const;

  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    score += signals[key as keyof ScoreSignals] * weight;
  }

  return { activity, score: clamp(score), signals };
}

export function applyHardConstraints(activities: Activity[], intent: LeisureIntent): Activity[] {
  return activities.filter((activity) => {
    if (intent.durationMinutes && activity.durationMin > intent.durationMinutes + 10) return false;
    if (intent.budget?.amount != null && activity.priceMin != null && activity.priceMin > intent.budget.amount) {
      return false;
    }
    if (hasAgeRestrictionConflict(activity, intent)) return false;
    return true;
  });
}

export function extractHardConstraints(intent: LeisureIntent): IntentConstraint[] {
  const constraints: IntentConstraint[] = [...intent.hardConstraints];
  if (intent.durationMinutes != null) {
    constraints.push({ kind: "duration", value: intent.durationMinutes, flexibility: "APPROXIMATE" });
  }
  if (intent.budget?.amount != null) {
    constraints.push({
      kind: "budget",
      value: intent.budget.amount,
      flexibility: intent.budget.flexibility ?? "APPROXIMATE",
    });
  }
  return constraints;
}

export function planSpend(steps: PlanStep[], activities: Activity[]) {
  let min = 0;
  let max = 0;
  for (const step of steps) {
    const activity = activities.find((a) => a.id === step.activityId);
    if (!activity) continue;
    min += activity.priceMin ?? 0;
    max += activity.priceMax ?? activity.priceMin ?? 0;
  }
  return { min, max };
}

export function planDuration(steps: PlanStep[]) {
  return steps.reduce((sum, step) => sum + step.durationMin, 0);
}

function averageMatch(activity: Activity, prefs: Preference[], baseline: number) {
  if (!prefs.length) return baseline;
  const haystack = `${activity.name} ${activity.summary} ${activity.tags.join(" ")}`.toLowerCase();
  const hits = prefs.map((pref) => {
    const token = `${pref.key} ${pref.value}`.toLowerCase();
    const matched = token.split(/\s+/).some((part) => part.length > 2 && haystack.includes(part));
    return (matched ? 1 : 0) * pref.weight * pref.confidence;
  });
  return clamp(baseline + hits.reduce((a, b) => a + b, 0) / (prefs.length * 1.6));
}

function audienceFit(activity: Activity, circleSlug: string) {
  if (activity.audience.includes(circleSlug) || activity.audience.includes("any")) return 0.85;
  if (circleSlug === "just-me" && activity.audience.includes("solo")) return 0.9;
  if (circleSlug === "nerd-gang" && activity.audience.some((a) => /friend|nerd|quiz|game/.test(a))) return 0.88;
  if (circleSlug === "us-friends" && activity.audience.some((a) => /friend|visitor|host/.test(a))) return 0.86;
  return 0.35;
}

function titlesSimilar(a: string, b: string) {
  const na = a.toLowerCase();
  const nb = b.toLowerCase();
  return na.includes(nb) || nb.includes(na);
}

function dominantKarma(karma: Partial<Record<KarmaDimension, number>>): KarmaDimension {
  return (Object.entries(karma).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] as KarmaDimension) ?? "culture";
}

export function explicitCategoryLock(intent: LeisureIntent) {
  const text = intent.rawInput.toLowerCase();
  return /movie|film|concert|quiz|pottery|museum|beach|cafe|café/.test(text) && !/surprise/.test(text);
}

function hasAgeRestrictionConflict(activity: Activity, intent: LeisureIntent) {
  if (activity.tags.includes("adults-only") && (intent.companions?.kind === "family" || intent.circleId?.includes("family"))) {
    return true;
  }
  return false;
}

function clamp(n: number) {
  return Math.max(0, Math.min(1, n));
}
