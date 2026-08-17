import type { LeisureIntent, MemoryProposal } from "@/domains/types";
import { inferCircles, interpretIntent } from "@/services/ai/mock-provider";
import type { AIProvider } from "@/services/ai/provider";

export class IntentInterpreter {
  constructor(private readonly ai: AIProvider) {}

  async interpret(raw: string, personId: string): Promise<LeisureIntent> {
    return this.ai.generateStructured({
      purpose: "intent",
      prompt: raw,
      fallback: interpretIntent(raw, {
        id: "draft",
        rawInput: raw,
        personId,
        positiveIntents: [],
        negativeIntents: [],
        hardConstraints: [],
        softPreferences: [],
        inferredContext: {},
        createdAt: new Date(),
      }),
    });
  }
}

export class CircleInterpreter {
  constructor(private readonly ai: AIProvider) {}

  async interpret(narrative: string) {
    return this.ai.generateStructured({
      purpose: "circles",
      prompt: narrative,
      fallback: inferCircles(narrative),
    });
  }
}

export class RecommendationExplainer {
  constructor(private readonly ai: AIProvider) {}

  async explain(prompt: string) {
    return this.ai.generateText({ purpose: "explain", prompt });
  }
}

export class LeisurePatternInterpreter {
  constructor(private readonly ai: AIProvider) {}

  async observe(prompt: string) {
    return this.ai.generateText({ purpose: "pattern", prompt });
  }
}

export class MemoryProposalGenerator {
  constructor(private readonly ai: AIProvider) {}

  async propose(prompt: string, fallback: MemoryProposal[]): Promise<MemoryProposal[]> {
    return this.ai.generateStructured({
      purpose: "memory",
      prompt,
      fallback,
    });
  }
}

export class PlanComposer {
  constructor(private readonly ai: AIProvider) {}

  async compose(prompt: string) {
    return this.ai.generateText({ purpose: "plan-compose", prompt });
  }
}
