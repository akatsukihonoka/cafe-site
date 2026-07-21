import type { z } from "zod";

export interface GenerateObjectParams<T> {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
}

/**
 * すべてのLLMベンダー（OpenAI/Anthropic/Gemini等）が実装する共通インターフェース。
 * agents/配下やcore/agent/はこのインターフェースにのみ依存し、
 * 個別ベンダーのSDKを直接importしない。
 */
export interface LLMProvider {
  readonly id: string;
  generateObject<T>(params: GenerateObjectParams<T>): Promise<T>;
}
