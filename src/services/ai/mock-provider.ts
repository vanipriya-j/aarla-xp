import type { LeisureIntent } from "@/domains/types";
import type { AIProvider, GenerateTextInput } from "@/services/ai/provider";

export class MockAIProvider implements AIProvider {
  readonly id = "mock";

  async generateText(input: GenerateTextInput): Promise<string> {
    if (input.purpose === "follow-up") {
      return "How far are you willing to travel for this one?";
    }
    if (input.purpose === "pattern") {
      return "You seem to choose music when you're on your own, but experiences with a strong local story when you're hosting people.";
    }
    return "I found a few ways to spend this time that still feel like you.";
  }

  async generateStructured<T>(input: GenerateTextInput & { fallback: T }): Promise<T> {
    if (input.purpose === "intent") {
      return interpretIntent(input.prompt, input.fallback) as T;
    }
    if (input.purpose === "circles") {
      return inferCircles(input.prompt) as T;
    }
    return input.fallback;
  }
}

export function interpretIntent(raw: string, fallback: unknown): LeisureIntent {
  const text = raw.toLowerCase();
  const hours = matchNumber(text, /(\d+(?:\.\d+)?)\s*(?:hours|hrs|hr)\b/);
  const minutes = matchNumber(text, /(\d+)\s*(?:minutes|mins|min)\b/);
  const budget = matchNumber(text.replace(",", ""), /(?:₹|rs\.?|inr|budget(?: around| of)?)\s*(\d+(?:\.\d+)?)\s*(k)?/)
    ?? matchNumber(text, /(\d+(?:\.\d+)?)\s*k\b/);

  const durationMinutes = minutes ?? (hours != null ? Math.round(hours * 60) : undefined);
  const amount = budget != null ? (text.includes("k") && budget < 100 ? budget * 1000 : budget) : undefined;

  const positive: string[] = [];
  const negative: string[] = [];
  if (/chennai|local|lived|authentic|south/.test(text)) positive.push("very Chennai", "local", "authentic");
  if (/surprise/.test(text)) positive.push("surprise");
  if (/movie|film/.test(text)) positive.push("movie");
  if (/concert|music/.test(text)) positive.push("music");
  if (/quiz|game|puzzle/.test(text)) positive.push("playful-intellectual");
  if (/kids|children|daughters|family/.test(text)) positive.push("family-friendly", "low-supervision");
  if (/low energy|gentle|slow/.test(text)) positive.push("gentle");
  if (/not (too )?touristy|not touristy|avoid tourist/.test(text)) negative.push("touristy");
  if (/not too loud/.test(text)) negative.push("loud");

  let circleHint: string | undefined;
  if (/alone|solo|just me|on my own/.test(text)) circleHint = "just-me";
  else if (/kids|children|daughters|husband|family/.test(text)) circleHint = "family";
  else if (/nerd|quiz|gaming|puzzles/.test(text) && /friend/.test(text)) circleHint = "nerd-gang";
  else if (/us|visiting|from the us|visitors|host/.test(text) || (/friends/.test(text) && /chennai/.test(text))) {
    circleHint = "us-friends";
  } else if (/friends/.test(text)) circleHint = "nerd-gang";

  const energy = /low energy|tired|gentle/.test(text) ? "low" : /high energy|active/.test(text) ? "high" : undefined;

  const base = (typeof fallback === "object" && fallback ? fallback : {}) as LeisureIntent;

  return {
    ...base,
    rawInput: raw,
    durationMinutes: durationMinutes ?? base.durationMinutes,
    budget:
      amount != null
        ? {
            amount,
            currency: "INR",
            scope: /each|per person/.test(text) ? "PER_PERSON" : "TOTAL",
            flexibility: /maximum|max|strict|only/.test(text) ? "STRICT" : "APPROXIMATE",
          }
        : base.budget,
    companions: {
      kind: circleHint === "family" ? "family" : circleHint ? "friends" : undefined,
      visitors: /us|visiting|visitors/.test(text),
      origin: /us|united states/.test(text) ? "US" : undefined,
      count: matchNumber(text, /(\d+)\s+(?:friends|people|of us)/) ?? undefined,
    },
    energy,
    mood: /surprise/.test(text) ? ["open"] : /date/.test(text) ? ["romantic"] : [],
    positiveIntents: unique([...(base.positiveIntents ?? []), ...positive]),
    negativeIntents: unique([...(base.negativeIntents ?? []), ...negative]),
    visitorContext: /us|visiting/.test(text) ? "friends visiting from the US" : base.visitorContext,
    occasion: /date/.test(text) ? "date night" : /weekend/.test(text) ? "weekend" : base.occasion,
    hardConstraints: [
      ...(durationMinutes != null
        ? [{ kind: "duration", value: durationMinutes, flexibility: "APPROXIMATE" as const }]
        : []),
      ...(amount != null
        ? [
            {
              kind: "budget",
              value: amount,
              flexibility: /maximum|max|strict|only/.test(text) ? ("STRICT" as const) : ("APPROXIMATE" as const),
            },
          ]
        : []),
    ],
    softPreferences: positive.map((value) => ({ key: "intent", value, weight: 1 })),
    inferredContext: { circleHint, source: "mock-ai" },
  };
}

export function inferCircles(narrative: string) {
  const text = narrative.toLowerCase();
  const circles: { slug: string; name: string; reason: string }[] = [];
  if (/alone|solo|concerts? alone|on my own/.test(text)) {
    circles.push({ slug: "just-me", name: "Just me", reason: "Music and concerts appear as a solo leisure mode." });
  }
  if (/husband|daughters|kids|children|family/.test(text)) {
    circles.push({
      slug: "family",
      name: "Family",
      reason: "Outings with partner and children form a distinct family mode.",
    });
  }
  if (/nerd|gaming|quiz|puzzles|friends group/.test(text)) {
    circles.push({ slug: "nerd-gang", name: "Nerd gang", reason: "A friend circle organised around games and quizzes." });
  }
  return { circles, reflection: "Sounds like you have a few pretty distinct leisure modes." };
}

function matchNumber(text: string, regex: RegExp) {
  const match = text.match(regex);
  if (!match) return undefined;
  return Number(match[1]);
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function createAIProvider(): AIProvider {
  const requested = process.env.AARLA_AI_PROVIDER?.trim();
  if (requested && requested !== "mock") {
    // Real providers are swapped in without changing product contracts.
    // Until credentials exist, fall back to the deterministic mock.
  }
  return new MockAIProvider();
}
