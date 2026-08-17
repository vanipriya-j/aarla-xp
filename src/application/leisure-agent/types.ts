import type {
  Activity,
  CircleMemory,
  EventRecord,
  LeisureExperience,
  LeisureIntent,
  MemoryProposal,
  PersonMemory,
  Place,
  Plan,
  ProviderAction,
  RouteResult,
  ValidationResult,
  XPKarma,
} from "@/domains/types";

export interface ExperienceQuery {
  text?: string;
  tags?: string[];
  audience?: string[];
  maxDuration?: number;
  maxBudget?: number;
  excludeTouristy?: boolean;
  circleSlug?: string;
  surprise?: boolean;
}

export interface LeisureAgentTools {
  getPersonMemory(personId: string): Promise<PersonMemory>;
  listCircles(personId: string): Promise<{ id: string; name: string; slug: string }[]>;
  getCircleMemory(circleId: string): Promise<CircleMemory | null>;
  getLeisureHistory(personId: string, circleId?: string): Promise<LeisureExperience[]>;
  getKarma(personId: string, period?: number): Promise<XPKarma>;
  searchExperiences(query: ExperienceQuery): Promise<{ activity: Activity }[]>;
  searchEvents(query: ExperienceQuery): Promise<EventRecord[]>;
  searchPlaces(query: ExperienceQuery): Promise<Place[]>;
  validateTimeWindow(candidate: { durationMinutes: number }, intent: LeisureIntent): Promise<ValidationResult>;
  validateBudget(candidate: { estimatedSpendMax?: number }, intent: LeisureIntent): Promise<ValidationResult>;
  calculateRoute(input: { from?: Place; to?: Place }): Promise<RouteResult>;
  searchDining(input: ExperienceQuery): Promise<{ activity: Activity }[]>;
  getTransportOptions(input: { from?: string; to?: string }): Promise<ProviderAction[]>;
  getProviderActions(input: { need: string }): Promise<ProviderAction[]>;
  saveIntent(intent: LeisureIntent): Promise<LeisureIntent>;
  createPlan(input: Plan): Promise<Plan>;
  modifyPlan(planId: string, changes: Partial<Plan>): Promise<Plan>;
  saveRecommendation(input: {
    personId: string;
    intentId?: string;
    planId?: string;
    label: string;
    title: string;
    reason: string;
    finalScore: number;
    ranking: number;
    signals: Record<string, number>;
    engineVersion: string;
  }): Promise<void>;
  saveRecommendationInteraction(input: {
    personId: string;
    type: string;
    targetType: string;
    targetId: string;
    reason?: string;
    circleId?: string;
  }): Promise<void>;
  proposeMemoryUpdates(input: MemoryProposal[]): Promise<MemoryProposal[]>;
}

export interface AgentRecommendation {
  label: string;
  personality: string;
  plan: Plan;
  reason: string;
  score: number;
  signals: Record<string, number>;
}

export interface AgentResult {
  intent: LeisureIntent;
  circle?: { id: string; name: string; slug: string };
  reply: string;
  followUp?: string;
  insight?: string;
  states: string[];
  recommendations: AgentRecommendation[];
  memoryProposals: MemoryProposal[];
}
