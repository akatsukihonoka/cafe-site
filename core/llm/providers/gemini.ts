import type { LLMProvider } from "../provider.port";

/**
 * 将来対応: Google Gemini をLLMProviderとして差し込むためのプレースホルダー。
 * 実装時は @ai-sdk/google を追加し、openai.ts と同じ形でgenerateObjectを実装する。
 */
export function createGeminiProvider(_model?: string): LLMProvider {
  throw new Error("Gemini provider is not implemented yet.");
}
