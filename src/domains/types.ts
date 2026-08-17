export const KARMA_DIMENSIONS = [
  "move",
  "create",
  "explore",
  "culture",
  "social",
  "rest",
  "learn",
  "play",
] as const;

export type KarmaDimension = (typeof KARMA_DIMENSIONS)[number];

export type PreferenceSource = "EXPLICIT" | "INFERRED" | "BEHAVIOURAL" | "SYSTEM";
export type MemoryLayer = "EXPLICIT" | "CIRCLE" | "BEHAVIOURAL" | "OBSERVATION";
export type MemoryStatus = "ACTIVE" | "WEAKENED" | "SUPERSEDED" | "REJECTED";
export type MemoryMutation = "CREATE" | "REINFORCE" | "WEAKEN" | "CONTRADICT";
export type PlanStatus = "DRAFT" | "SAVED" | "UPCOMING" | "DONE" | "CANCELLED";
export type PlanPersonality = "BEST_FIT" | "LOCAL" | "CONTEMPORARY" | "SLOW" | "SURPRISE";
export type InteractionType =
  | "VIEWED"
  | "OPENED"
  | "SAVED"
  | "DISMISSED"
  | "REJECTED"
  | "SELECTED"
  | "PLANNED"
  | "BOOKED"
  | "DONE"
  | "LOVED"
  | "DISLIKED";

export type RejectionReason =
  | "too_expensive"
  | "too_far"
  | "too_crowded"
  | "too_much_effort"
  | "not_my_vibe"
  | "kids_wont_enjoy"
  | "already_done"
  | "wrong_time"
  | "something_else";

export interface Person {
  id: string;
  name: string;
  locationLabel: string;
  city: string;
  country: string;
  avatarUrl?: string;
}

export interface Circle {
  id: string;
  personId: string;
  name: string;
  slug: string;
  relationship?: string;
  description?: string;
  inferred: boolean;
  avatarHint?: string;
  memberSummary?: string;
  members: CircleMember[];
}

export interface CircleMember {
  displayName: string;
  relationship?: string;
  ageBand?: string;
  notes?: string;
}

export interface Preference {
  id: string;
  personId: string;
  circleId?: string;
  type: string;
  key: string;
  value: string;
  weight: number;
  source: PreferenceSource;
  confidence: number;
  narrative?: string;
}

export interface MemoryRecord {
  id: string;
  personId: string;
  circleId?: string;
  subjectType: "PERSON" | "CIRCLE";
  layer: MemoryLayer;
  category: string;
  statement: string;
  confidence: number;
  status: MemoryStatus;
  source: string;
  createdAt: Date;
  lastConfirmedAt?: Date;
  evidence: MemoryEvidence[];
}

export interface MemoryEvidence {
  kind: string;
  refId?: string;
  excerpt?: string;
}

export interface MemoryProposal {
  subjectType: "PERSON" | "CIRCLE";
  subjectId: string;
  statement: string;
  category: string;
  confidence: number;
  evidenceIds: string[];
  mutation: MemoryMutation;
}

export interface IntentConstraint {
  kind: string;
  value: string | number;
  flexibility: "STRICT" | "APPROXIMATE";
}

export interface IntentPreference {
  key: string;
  value: string;
  weight: number;
}

export interface LeisureIntent {
  id: string;
  rawInput: string;
  personId: string;
  circleId?: string;
  startAt?: Date;
  endAt?: Date;
  durationMinutes?: number;
  startingLocation?: string;
  budget?: {
    amount?: number;
    currency: string;
    scope?: "TOTAL" | "PER_PERSON";
    flexibility?: "STRICT" | "APPROXIMATE";
  };
  companions?: {
    kind?: string;
    count?: number;
    visitors?: boolean;
    origin?: string;
  };
  mood?: string[];
  energy?: string;
  positiveIntents: string[];
  negativeIntents: string[];
  occasion?: string;
  visitorContext?: string;
  hardConstraints: IntentConstraint[];
  softPreferences: IntentPreference[];
  inferredContext: Record<string, unknown>;
  createdAt: Date;
}

export interface Place {
  id: string;
  name: string;
  slug: string;
  neighborhood?: string;
  city: string;
  lat?: number;
  lng?: number;
  description?: string;
  imageUrl?: string;
  tags: string[];
  openingHours?: string;
  priceBand?: string;
  provenance?: string;
}

export interface Activity {
  id: string;
  name: string;
  slug: string;
  placeId?: string;
  place?: Place;
  summary: string;
  description?: string;
  imageUrl?: string;
  durationMin: number;
  effort: string;
  priceMin?: number;
  priceMax?: number;
  priceBand?: string;
  karma: Partial<Record<KarmaDimension, number>>;
  tags: string[];
  audience: string[];
  energy?: string;
  parentalEffort?: string;
  travelEffort?: string;
  touristyScore: number;
  quality: number;
  provenance?: string;
}

export interface EventRecord {
  id: string;
  name: string;
  slug: string;
  activityId?: string;
  placeId?: string;
  startsAt?: Date;
  endsAt?: Date;
  summary?: string;
  imageUrl?: string;
  priceMin?: number;
  priceMax?: number;
  availability?: string;
  provenance?: string;
}

export interface PlanStep {
  id?: string;
  sortOrder: number;
  kind: string;
  title: string;
  description?: string;
  startsAt?: Date;
  durationMin: number;
  placeId?: string;
  activityId?: string;
  eventId?: string;
  actionKind?: string;
  status?: string;
}

export interface Plan {
  id: string;
  personId: string;
  circleId?: string;
  intentId?: string;
  title: string;
  personality?: string;
  explanation: string;
  startAt?: Date;
  endAt?: Date;
  durationMinutes: number;
  estimatedSpendMin?: number;
  estimatedSpendMax?: number;
  currency: string;
  status: PlanStatus | string;
  stopCount: number;
  effort?: string;
  imageUrl?: string;
  steps: PlanStep[];
}

export interface ScoreSignals {
  preferenceFit: number;
  circleFit: number;
  contextFit: number;
  timingFit: number;
  distanceFit: number;
  budgetFit: number;
  novelty: number;
  karmaDiversity: number;
  quality: number;
  repetitionPenalty: number;
  dislikePenalty: number;
  parentalFit: number;
}

export interface RankedCandidate {
  activity: Activity;
  score: number;
  signals: ScoreSignals;
}

export interface ValidationResult {
  ok: boolean;
  reasons: string[];
}

export interface RouteResult {
  minutes: number;
  effort: "LOW" | "MODERATE" | "HIGH";
  mode: string;
}

export interface ExperienceCandidate {
  activity: Activity;
  event?: EventRecord;
}

export interface PersonMemory {
  person: Person;
  preferences: Preference[];
  memories: MemoryRecord[];
  travelToleranceKm?: number;
}

export interface CircleMemory {
  circle: Circle;
  preferences: Preference[];
  memories: MemoryRecord[];
}

export interface XPKarma {
  windowDays: number;
  totals: Record<KarmaDimension, number>;
  percents: Record<KarmaDimension, number>;
  dominant: KarmaDimension[];
  underrepresented: KarmaDimension[];
}

export interface LeisureExperience {
  id: string;
  personId: string;
  circleId?: string;
  activityId?: string;
  title: string;
  happenedAt: Date;
  loved: boolean;
  karma: Partial<Record<KarmaDimension, number>>;
}

export interface ProviderAction {
  providerSlug: string;
  providerName: string;
  capability: string;
  status: string;
  label: string;
  live: boolean;
}

export const REJECTION_REASONS: { id: RejectionReason; label: string }[] = [
  { id: "too_expensive", label: "Too expensive" },
  { id: "too_far", label: "Too far" },
  { id: "too_crowded", label: "Too crowded" },
  { id: "too_much_effort", label: "Too much effort" },
  { id: "not_my_vibe", label: "Not my vibe" },
  { id: "kids_wont_enjoy", label: "Kids won't enjoy" },
  { id: "already_done", label: "Already done" },
  { id: "wrong_time", label: "Wrong time" },
  { id: "something_else", label: "Something else" },
];
