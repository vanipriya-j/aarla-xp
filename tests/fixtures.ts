import type { LeisureAgentTools } from "@/application/leisure-agent/types";
import type { Activity, LeisureExperience, LeisureIntent, MemoryProposal, PersonMemory, Plan, Preference, XPKarma } from "@/domains/types";
import { computeKarma, validateBudget, validateTimeWindow } from "@/services/deterministic";
import { actionsForNeed } from "@/services/providers";

export function activity(partial: Partial<Activity> & Pick<Activity, "id" | "name">): Activity {
  return {
    slug: partial.id,
    summary: partial.summary ?? partial.name,
    durationMin: 60,
    effort: "EASY",
    karma: { culture: 0.4 },
    tags: [],
    audience: ["any"],
    touristyScore: 0.3,
    quality: 0.8,
    ...partial,
  };
}

export function intent(partial: Partial<LeisureIntent> = {}): LeisureIntent {
  return {
    id: "intent_test",
    rawInput: "I have 3 hours. Budget around ₹3000 maximum.",
    personId: "person_test",
    durationMinutes: 180,
    budget: { amount: 3000, currency: "INR", scope: "TOTAL", flexibility: "STRICT" },
    positiveIntents: [],
    negativeIntents: [],
    hardConstraints: [],
    softPreferences: [],
    inferredContext: {},
    createdAt: new Date(),
    ...partial,
  };
}

export const inventory = {
  mylaporeWalk: activity({
    id: "act_mylapore_walk",
    name: "Walk around Mylapore temple streets",
    durationMin: 40,
    priceMin: 0,
    priceMax: 0,
    tags: ["walk", "local", "heritage", "mylapore", "lived"],
    audience: ["us-friends", "any"],
    touristyScore: 0.15,
    karma: { culture: 0.8, explore: 0.5 },
  }),
  coffee: activity({
    id: "act_filter_coffee",
    name: "Filter coffee in Mylapore",
    durationMin: 25,
    priceMin: 80,
    priceMax: 200,
    tags: ["coffee", "food", "local"],
    audience: ["us-friends", "any"],
  }),
  carnatic: activity({
    id: "act_carnatic_short",
    name: "A short classical music stop",
    durationMin: 50,
    priceMin: 300,
    priceMax: 800,
    tags: ["music", "carnatic", "concert", "local"],
    audience: ["just-me", "us-friends"],
    karma: { culture: 0.95 },
  }),
  gallery: activity({
    id: "act_gallery_hop",
    name: "Gallery hop in Alwarpet",
    durationMin: 50,
    tags: ["gallery", "contemporary", "art"],
    audience: ["us-friends"],
  }),
  design: activity({
    id: "act_design_store",
    name: "Design store browse",
    durationMin: 35,
    priceMax: 1800,
    tags: ["design", "contemporary"],
  }),
  dinner: activity({
    id: "act_alwarpet_dinner",
    name: "Dinner in Alwarpet",
    durationMin: 70,
    priceMin: 1400,
    priceMax: 2200,
    tags: ["dinner", "food"],
  }),
  beach: activity({
    id: "act_beach_walk",
    name: "Besant Nagar beach walk",
    durationMin: 40,
    tags: ["beach", "walk", "slow"],
  }),
  beachFood: activity({
    id: "act_beach_food",
    name: "Beach-side food",
    durationMin: 40,
    priceMax: 900,
    tags: ["food", "beach", "slow"],
  }),
  liveMusic: activity({
    id: "act_live_music",
    name: "Live music by the sea",
    durationMin: 45,
    tags: ["music", "slow"],
  }),
  movie: activity({
    id: "act_movie_one",
    name: "An evening screening",
    durationMin: 150,
    priceMax: 450,
    tags: ["movie", "cinema", "film"],
    karma: { rest: 0.5, social: 0.3 },
  }),
  movieTwo: activity({
    id: "act_movie_two",
    name: "Another good movie",
    durationMin: 150,
    priceMax: 480,
    tags: ["movie", "cinema", "film"],
    karma: { rest: 0.5 },
  }),
  pottery: activity({
    id: "act_pottery",
    name: "Pottery workshop",
    durationMin: 150,
    priceMax: 1800,
    tags: ["workshop", "create", "pottery"],
    travelEffort: "HIGH",
    parentalEffort: "MEDIUM",
    karma: { create: 0.8, learn: 0.5 },
  }),
  kidsGallery: activity({
    id: "act_kids_gallery",
    name: "Interactive children's gallery",
    durationMin: 90,
    tags: ["kids", "contained", "kids-independent", "family", "museum"],
    audience: ["family"],
    parentalEffort: "LOW",
    karma: { learn: 0.6, play: 0.5 },
  }),
  fair: activity({
    id: "act_fair",
    name: "Crowded weekend fair",
    durationMin: 120,
    tags: ["fair", "unstructured-crowd", "family"],
    audience: ["family"],
    parentalEffort: "HIGH",
    quality: 0.8,
  }),
  park: activity({
    id: "act_park",
    name: "Park walk",
    durationMin: 40,
    tags: ["outdoors", "move", "walk"],
    karma: { move: 0.8 },
  }),
  expensiveLong: activity({
    id: "act_too_much",
    name: "All-day resort outing",
    durationMin: 300,
    priceMin: 4500,
    priceMax: 4500,
    tags: ["local"],
  }),
};

export function movieHeavyHistory(): LeisureExperience[] {
  const now = new Date();
  const movies: LeisureExperience[] = [1, 2, 3].map((n) => ({
    id: `exp_movie_${n}`,
    personId: "person_test",
    title: "Movie",
    happenedAt: new Date(now.getTime() - n * 86400000),
    loved: false,
    activityId: inventory.movie.id,
    karma: { rest: 0.5, social: 0.3 },
  }));
  return [
    ...movies,
    {
      id: "exp_dinner",
      personId: "person_test",
      title: "Restaurant",
      happenedAt: new Date(now.getTime() - 4 * 86400000),
      loved: false,
      karma: { rest: 0.2, social: 0.7 },
    },
  ];
}

export function createMemoryTools(options?: {
  activities?: Activity[];
  history?: LeisureExperience[];
  preferences?: Preference[];
  travelToleranceKm?: number;
}): LeisureAgentTools & { proposals: MemoryProposal[]; interactions: Array<{ type: string; reason?: string; targetId: string }> } {
  const activities = options?.activities ?? Object.values(inventory);
  const history = options?.history ?? [];
  const preferences = options?.preferences ?? [];
  const proposals: MemoryProposal[] = [];
  const interactions: Array<{ type: string; reason?: string; targetId: string }> = [];
  const karma: XPKarma = computeKarma(history, 30);

  const personMemory: PersonMemory = {
    person: { id: "person_test", name: "Vanipriya", locationLabel: "Chennai", city: "Chennai", country: "India" },
    preferences,
    memories: [
      {
        id: "mem_1",
        personId: "person_test",
        subjectType: "PERSON",
        layer: "EXPLICIT",
        category: "music_solo",
        statement: "I like going to concerts alone.",
        confidence: 0.95,
        status: "ACTIVE",
        source: "EXPLICIT",
        createdAt: new Date(),
        evidence: [],
      },
    ],
    travelToleranceKm: options?.travelToleranceKm,
  };

  return {
    proposals,
    interactions,
    async getPersonMemory() {
      return personMemory;
    },
    async listCircles() {
      return [
        { id: "circle_just_me", name: "Just me", slug: "just-me" },
        { id: "circle_family", name: "Family", slug: "family" },
        { id: "circle_nerd", name: "Nerd gang", slug: "nerd-gang" },
        { id: "circle_us", name: "US Friends", slug: "us-friends" },
      ];
    },
    async getCircleMemory(circleId) {
      return {
        circle: {
          id: circleId,
          personId: "person_test",
          name: circleId,
          slug: circleId.replace("circle_", "").replace("_", "-"),
          inferred: true,
          members: [],
        },
        preferences: preferences.filter((p) => p.circleId === circleId),
        memories: [],
      };
    },
    async getLeisureHistory() {
      return history;
    },
    async getKarma() {
      return karma;
    },
    async searchExperiences(query) {
      return activities
        .filter((item) => {
          const hay = `${item.name} ${item.tags.join(" ")}`.toLowerCase();
          if (query.tags?.length && !query.tags.some((tag) => hay.includes(tag))) return false;
          if (query.text && !hay.includes(query.text.toLowerCase()) && query.tags?.length) return hay.includes(query.tags[0]);
          if (query.text && query.tags?.includes("movie") && !/movie|film|cinema/.test(hay)) return false;
          return true;
        })
        .map((item) => ({ activity: item }));
    },
    async searchEvents() {
      return [];
    },
    async searchPlaces() {
      return [];
    },
    async validateTimeWindow(candidate, current) {
      return validateTimeWindow(candidate.durationMinutes, current);
    },
    async validateBudget(candidate, current) {
      return validateBudget(candidate.estimatedSpendMax, current);
    },
    async calculateRoute() {
      return { minutes: 20, effort: "LOW", mode: "ride" };
    },
    async searchDining() {
      return activities.filter((item) => item.tags.includes("food")).map((item) => ({ activity: item }));
    },
    async getTransportOptions() {
      return actionsForNeed("transport");
    },
    async getProviderActions(input) {
      return actionsForNeed(input.need);
    },
    async saveIntent(current) {
      return current;
    },
    async createPlan(input) {
      return input;
    },
    async saveRecommendation() {},
    async modifyPlan(_id, changes) {
      return { id: _id, personId: "person_test", title: "x", explanation: "", durationMinutes: 60, currency: "INR", status: "SAVED", stopCount: 1, steps: [], ...changes } as Plan;
    },
    async saveRecommendationInteraction(input) {
      interactions.push({ type: input.type, reason: input.reason, targetId: input.targetId });
    },
    async proposeMemoryUpdates(input) {
      proposals.push(...input);
      return input;
    },
  };
}
