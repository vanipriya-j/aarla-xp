import type {
  Activity,
  Circle,
  EventRecord,
  LeisureExperience,
  LeisureIntent,
  MemoryRecord,
  Person,
  Place,
  Plan,
  Preference,
} from "@/domains/types";
import type {
  Activity as DbActivity,
  Circle as DbCircle,
  CircleMember,
  Event as DbEvent,
  LeisureExperience as DbExperience,
  LeisureIntent as DbIntent,
  Memory as DbMemory,
  MemoryEvidence,
  Person as DbPerson,
  Place as DbPlace,
  Plan as DbPlan,
  PlanStep as DbStep,
  Preference as DbPreference,
} from "@prisma/client";

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function mapPerson(row: DbPerson): Person {
  return {
    id: row.id,
    name: row.name,
    locationLabel: row.locationLabel,
    city: row.city,
    country: row.country,
    avatarUrl: row.avatarUrl ?? undefined,
  };
}

export function mapCircle(row: DbCircle & { members?: CircleMember[] }): Circle {
  return {
    id: row.id,
    personId: row.personId,
    name: row.name,
    slug: row.slug,
    relationship: row.relationship ?? undefined,
    description: row.description ?? undefined,
    inferred: row.inferred,
    avatarHint: row.avatarHint ?? undefined,
    memberSummary: row.memberSummary ?? undefined,
    members:
      row.members?.map((member) => ({
        displayName: member.displayName,
        relationship: member.relationship ?? undefined,
        ageBand: member.ageBand ?? undefined,
        notes: member.notes ?? undefined,
      })) ?? [],
  };
}

export function mapPreference(row: DbPreference): Preference {
  return {
    id: row.id,
    personId: row.personId,
    circleId: row.circleId ?? undefined,
    type: row.type,
    key: row.key,
    value: row.value,
    weight: row.weight,
    source: row.source as Preference["source"],
    confidence: row.confidence,
    narrative: row.narrative ?? undefined,
  };
}

export function mapMemory(row: DbMemory & { evidence?: MemoryEvidence[] }): MemoryRecord {
  return {
    id: row.id,
    personId: row.personId,
    circleId: row.circleId ?? undefined,
    subjectType: row.subjectType as MemoryRecord["subjectType"],
    layer: row.layer as MemoryRecord["layer"],
    category: row.category,
    statement: row.statement,
    confidence: row.confidence,
    status: row.status as MemoryRecord["status"],
    source: row.source,
    createdAt: row.createdAt,
    lastConfirmedAt: row.lastConfirmedAt ?? undefined,
    evidence:
      row.evidence?.map((item) => ({
        kind: item.kind,
        refId: item.refId ?? undefined,
        excerpt: item.excerpt ?? undefined,
      })) ?? [],
  };
}

export function mapPlace(row: DbPlace): Place {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    neighborhood: row.neighborhood ?? undefined,
    city: row.city,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    description: row.description ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    tags: parseJson(row.tagsJson, []),
    openingHours: row.openingHours ?? undefined,
    priceBand: row.priceBand ?? undefined,
    provenance: row.provenance ?? undefined,
  };
}

export function mapActivity(row: DbActivity & { place?: DbPlace | null }): Activity {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    placeId: row.placeId ?? undefined,
    place: row.place ? mapPlace(row.place) : undefined,
    summary: row.summary,
    description: row.description ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    durationMin: row.durationMin,
    effort: row.effort,
    priceMin: row.priceMin ?? undefined,
    priceMax: row.priceMax ?? undefined,
    priceBand: row.priceBand ?? undefined,
    karma: parseJson(row.karmaJson, {}),
    tags: parseJson(row.tagsJson, []),
    audience: parseJson(row.audienceJson, []),
    energy: row.energy ?? undefined,
    parentalEffort: row.parentalEffort ?? undefined,
    travelEffort: row.travelEffort ?? undefined,
    touristyScore: row.touristyScore,
    quality: row.quality,
    provenance: row.provenance ?? undefined,
  };
}

export function mapEvent(row: DbEvent): EventRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    activityId: row.activityId ?? undefined,
    placeId: row.placeId ?? undefined,
    startsAt: row.startsAt ?? undefined,
    endsAt: row.endsAt ?? undefined,
    summary: row.summary ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    priceMin: row.priceMin ?? undefined,
    priceMax: row.priceMax ?? undefined,
    availability: row.availability ?? undefined,
    provenance: row.provenance ?? undefined,
  };
}

export function mapExperience(row: DbExperience): LeisureExperience {
  return {
    id: row.id,
    personId: row.personId,
    circleId: row.circleId ?? undefined,
    activityId: row.activityId ?? undefined,
    title: row.title,
    happenedAt: row.happenedAt,
    loved: row.loved,
    karma: parseJson(row.karmaJson, {}),
  };
}

export function mapIntent(row: DbIntent): LeisureIntent {
  return {
    id: row.id,
    rawInput: row.rawInput,
    personId: row.personId,
    circleId: row.circleId ?? undefined,
    startAt: row.startAt ?? undefined,
    endAt: row.endAt ?? undefined,
    durationMinutes: row.durationMinutes ?? undefined,
    startingLocation: row.startingLocation ?? undefined,
    budget:
      row.budgetAmount != null
        ? {
            amount: row.budgetAmount,
            currency: row.budgetCurrency,
            scope: (row.budgetScope as "TOTAL" | "PER_PERSON") ?? "TOTAL",
            flexibility: (row.budgetFlexibility as "STRICT" | "APPROXIMATE") ?? "APPROXIMATE",
          }
        : undefined,
    companions: parseJson(row.companionsJson, undefined),
    mood: parseJson(row.moodJson, []),
    energy: row.energy ?? undefined,
    positiveIntents: parseJson(row.positiveIntentsJson, []),
    negativeIntents: parseJson(row.negativeIntentsJson, []),
    occasion: row.occasion ?? undefined,
    visitorContext: row.visitorContext ?? undefined,
    hardConstraints: parseJson(row.hardConstraintsJson, []),
    softPreferences: parseJson(row.softPreferencesJson, []),
    inferredContext: parseJson(row.inferredContextJson, {}),
    createdAt: row.createdAt,
  };
}

export function mapPlan(row: DbPlan & { steps?: DbStep[] }): Plan {
  return {
    id: row.id,
    personId: row.personId,
    circleId: row.circleId ?? undefined,
    intentId: row.intentId ?? undefined,
    title: row.title,
    personality: row.personality ?? undefined,
    explanation: row.explanation,
    startAt: row.startAt ?? undefined,
    endAt: row.endAt ?? undefined,
    durationMinutes: row.durationMinutes,
    estimatedSpendMin: row.estimatedSpendMin ?? undefined,
    estimatedSpendMax: row.estimatedSpendMax ?? undefined,
    currency: row.currency,
    status: row.status,
    stopCount: row.stopCount,
    effort: row.effort ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    steps:
      row.steps?.map((step) => ({
        id: step.id,
        sortOrder: step.sortOrder,
        kind: step.kind,
        title: step.title,
        description: step.description ?? undefined,
        startsAt: step.startsAt ?? undefined,
        durationMin: step.durationMin,
        placeId: step.placeId ?? undefined,
        activityId: step.activityId ?? undefined,
        eventId: step.eventId ?? undefined,
        actionKind: step.actionKind ?? undefined,
        status: step.status,
      })) ?? [],
  };
}
