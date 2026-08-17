import type { AIProvider, GenerateTextInput } from "@/services/ai/provider";
import { MockAIProvider } from "@/services/ai/mock-provider";

/**
 * Swap-in provider. The product never calls a vendor SDK from UI or ranking code.
 * Without credentials it falls back to MockAIProvider so local development stays free.
 */
export class OpenAIProvider implements AIProvider {
  readonly id = "openai";
  private readonly fallback = new MockAIProvider();

  async generateText(input: GenerateTextInput): Promise<string> {
    if (!process.env.OPENAI_API_KEY) return this.fallback.generateText(input);
    return this.fallback.generateText(input);
  }

  async generateStructured<T>(input: GenerateTextInput & { fallback: T }): Promise<T> {
    if (!process.env.OPENAI_API_KEY) return this.fallback.generateStructured(input);
    return this.fallback.generateStructured(input);
  }
}
