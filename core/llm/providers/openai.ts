import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import type { GenerateObjectParams, LLMProvider } from "../provider.port";

export function createOpenAIProvider(model?: string): LLMProvider {
  const resolvedModel = model ?? process.env.OPENAI_MODEL;
  if (!resolvedModel) {
    throw new Error(
      "OpenAI provider: model is not set. Pass a model explicitly or set OPENAI_MODEL in the environment."
    );
  }

  return {
    id: `openai:${resolvedModel}`,
    async generateObject<T>({ system, prompt, schema }: GenerateObjectParams<T>) {
      const { object } = await generateObject({
        model: openai(resolvedModel),
        system,
        prompt,
        schema,
      });
      return object;
    },
  };
}
