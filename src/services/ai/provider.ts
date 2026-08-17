export interface GenerateTextInput {
  system?: string;
  prompt: string;
  purpose:
    | "intent"
    | "circles"
    | "plan-compose"
    | "explain"
    | "pattern"
    | "memory"
    | "follow-up";
}

export interface AIProvider {
  readonly id: string;
  generateText(input: GenerateTextInput): Promise<string>;
  generateStructured<T>(input: GenerateTextInput & { fallback: T }): Promise<T>;
}

export function getAIProviderId() {
  return process.env.AARLA_AI_PROVIDER?.trim() || "mock";
}
