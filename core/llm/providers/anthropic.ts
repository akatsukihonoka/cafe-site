import type { LLMProvider } from "../provider.port";

/**
 * 将来対応: Anthropic (Claude) をLLMProviderとして差し込むためのプレースホルダー。
 * 実装時は @ai-sdk/anthropic を追加し、openai.ts と同じ形でgenerateObjectを実装する。
 */
export function createAnthropicProvider(_model?: string): LLMProvider {
  throw new Error("Anthropic provider is not implemented yet.");
}
