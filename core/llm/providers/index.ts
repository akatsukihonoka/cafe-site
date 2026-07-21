import type { LLMProvider } from "../provider.port";
import { createAnthropicProvider } from "./anthropic";
import { createGeminiProvider } from "./gemini";
import { createOpenAIProvider } from "./openai";

export type LLMProviderId = "openai" | "anthropic" | "gemini";

/**
 * LLM_PROVIDER環境変数で既定Providerを切り替えるためのファクトリ。
 * agents/配下はこの関数経由でProviderを取得し、ベンダーSDKには一切触れない。
 */
export function getLLMProvider(providerId?: LLMProviderId): LLMProvider {
  const resolved = providerId ?? (process.env.LLM_PROVIDER as LLMProviderId | undefined) ?? "openai";

  switch (resolved) {
    case "openai":
      return createOpenAIProvider();
    case "anthropic":
      return createAnthropicProvider();
    case "gemini":
      return createGeminiProvider();
    default:
      throw new Error(`Unknown LLM provider: ${resolved}`);
  }
}
