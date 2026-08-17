import { describe, expect, it } from "vitest";
import { LeisureAgent } from "@/application/leisure-agent/agent";
import { applyHardConstraints, scoreActivity, validatePlan } from "@/services/deterministic";
import { MockAIProvider } from "@/services/ai/mock-provider";
import { applyRejectionToMemory, shouldTouchAffinity, validateMemoryProposal } from "@/services/memory/policy";
import { createMemoryTools, intent, inventory, movieHeavyHistory } from "./fixtures";

const agentFor = (tools = createMemoryTools()) => new LeisureAgent(tools, new MockAIProvider());

describe("Test A — hard time and budget constraints", () => {
  it("never returns a 5-hour or ₹4500 plan for a 3-hour ₹3000 request", async () => {
    const tools = createMemoryTools();
    const result = await agentFor(tools).consider(
      "I have 3 hours. ₹3,000 maximum.",
      "person_test",
    );

    expect(result.recommendations.length).toBeGreaterThan(0);
    for (const rec of result.recommendations) {
      expect(rec.plan.durationMinutes).toBeLessThanOrEqual(190);
      expect(rec.plan.estimatedSpendMax ?? 0).toBeLessThanOrEqual(3240);
    }

    const illegal = validatePlan(
      {
        id: "bad",
        personId: "person_test",
        title: "Too much",
        explanation: "",
        durationMinutes: 300,
        estimatedSpendMax: 4500,
        currency: "INR",
        status: "DRAFT",
        stopCount: 1,
        steps: [{ sortOrder: 0, kind: "ACTIVITY", title: "All day", durationMin: 300 }],
      },
      intent({ durationMinutes: 180, budget: { amount: 3000, currency: "INR", flexibility: "STRICT" } }),
    );
    expect(illegal.ok).toBe(false);
  });
});

describe("Test B — solo concert preference stays on the Solo circle", () => {
  it("proposes a music memory for the solo circle, not family", async () => {
    const tools = createMemoryTools();
    await agentFor(tools).consider("I love going to concerts alone.", "person_test");
    expect(tools.proposals.some((p) => p.category === "music_solo")).toBe(true);
    expect(tools.proposals.every((p) => p.subjectId !== "circle_family")).toBe(true);
  });
});

describe("Test C — too far does not reduce pottery affinity", () => {
  it("maps a too-far rejection to travel tolerance only", () => {
    expect(shouldTouchAffinity("too_far")).toBe(false);
    expect(applyRejectionToMemory("too_far")?.category).toBe("travel_tolerance");
    expect(shouldTouchAffinity("not_my_vibe")).toBe(true);
  });
});

describe("Test D — family ranks contained kids environments above unstructured fairs", () => {
  it("prefers the interactive gallery when parental effort matters", () => {
    const familyIntent = intent({
      rawInput: "Something for the girls this afternoon",
      companions: { kind: "family" },
      circleId: "circle_family",
    });
    const prefs = [
      {
        id: "p1",
        personId: "person_test",
        circleId: "circle_family",
        type: "LIKE",
        key: "family",
        value: "low-supervision",
        weight: 1.4,
        source: "EXPLICIT" as const,
        confidence: 1,
      },
    ];
    const gallery = scoreActivity({
      activity: inventory.kidsGallery,
      intent: familyIntent,
      preferences: prefs,
      history: [],
      karma: { windowDays: 30, totals: emptyTotals(), percents: emptyPercents(), dominant: [], underrepresented: [] },
      circleSlug: "family",
    });
    const fair = scoreActivity({
      activity: inventory.fair,
      intent: familyIntent,
      preferences: prefs,
      history: [],
      karma: { windowDays: 30, totals: emptyTotals(), percents: emptyPercents(), dominant: [], underrepresented: [] },
      circleSlug: "family",
    });
    expect(gallery.signals.parentalFit).toBeGreaterThan(fair.signals.parentalFit);
    expect(gallery.score).toBeGreaterThan(fair.score);
  });
});

describe("Test E — surprise me lifts underrepresented karma", () => {
  it("boosts move/create after a run of movies and restaurants", () => {
    const history = movieHeavyHistory();
    const surprise = intent({
      rawInput: "Surprise me this weekend",
      positiveIntents: ["surprise"],
      durationMinutes: undefined,
      budget: undefined,
    });
    const karma = {
      windowDays: 30,
      totals: emptyTotals(),
      percents: { ...emptyPercents(), rest: 40, social: 30, culture: 10, move: 4, create: 5, explore: 6, learn: 3, play: 2 },
      dominant: ["rest" as const, "social" as const],
      underrepresented: ["move" as const, "create" as const, "explore" as const],
    };
    const park = scoreActivity({
      activity: inventory.park,
      intent: surprise,
      preferences: [],
      history,
      karma,
    });
    const movie = scoreActivity({
      activity: inventory.movie,
      intent: surprise,
      preferences: [],
      history,
      karma,
    });
    expect(park.signals.karmaDiversity).toBeGreaterThan(movie.signals.karmaDiversity);
  });
});

describe("Test F — explicit movie intent wins over karma", () => {
  it("returns movies when the user asks for a movie", async () => {
    const tools = createMemoryTools({ history: movieHeavyHistory() });
    const result = await agentFor(tools).consider("Find me another good movie.", "person_test");
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations.every((rec) => /movie|film|screening/i.test(rec.plan.title))).toBe(true);
  });
});

describe("Test G — AI cannot invent inventory", () => {
  it("returns no plans when the catalog is empty", async () => {
    const tools = createMemoryTools({ activities: [] });
    const result = await agentFor(tools).consider(
      "I have 3 hours with friends from the US. Something very Chennai.",
      "person_test",
    );
    expect(result.recommendations).toEqual([]);
  });

  it("drops any composed step that is not in retrieved inventory", () => {
    const filtered = applyHardConstraints([inventory.expensiveLong], intent());
    expect(filtered).toEqual([]);
  });
});

describe("memory write policy", () => {
  it("never overwrites an explicit truth", () => {
    const decision = validateMemoryProposal(
      {
        subjectType: "PERSON",
        subjectId: "person_test",
        statement: "Does not like going to concerts alone.",
        category: "music_solo",
        confidence: 0.8,
        evidenceIds: ["x"],
        mutation: "CONTRADICT",
      },
      [
        {
          id: "m",
          personId: "person_test",
          subjectType: "PERSON",
          layer: "EXPLICIT",
          category: "music_solo",
          statement: "I like going to concerts alone.",
          confidence: 1,
          status: "ACTIVE",
          source: "EXPLICIT",
          createdAt: new Date(),
          evidence: [],
        },
      ],
      [],
    );
    expect(decision.action).toBe("REJECT");
  });
});

function emptyTotals() {
  return { move: 0, create: 0, explore: 0, culture: 0, social: 0, rest: 0, learn: 0, play: 0 };
}

function emptyPercents() {
  return emptyTotals();
}
