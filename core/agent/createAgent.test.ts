import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { LLMProvider } from "../llm/provider.port";
import type { AgentDefinition } from "../types/agent";
import { createAgent } from "./createAgent";

const definition: AgentDefinition<{ topic: string }, { headline: string }> = {
  name: "test-agent",
  inputSchema: z.object({ topic: z.string().min(1) }),
  outputSchema: z.object({ headline: z.string().min(1) }),
  systemPrompt: "You write headlines.",
  buildPrompt: (input) => `Write a headline about: ${input.topic}`,
};

function mockProvider(response: unknown): LLMProvider {
  return {
    id: "mock",
    async generateObject() {
      return response as never;
    },
  };
}

describe("createAgent", () => {
  it("入力をスキーマで検証し、不正な入力は例外を投げる", async () => {
    const run = createAgent(definition, mockProvider({ headline: "ok" }));
    await expect(run({ topic: "" } as never)).rejects.toThrow();
  });

  it("Providerの出力をoutputSchemaで検証してから返す", async () => {
    const run = createAgent(definition, mockProvider({ headline: "Great Coffee" }));
    const result = await run({ topic: "cafe" });
    expect(result).toEqual({ headline: "Great Coffee" });
  });

  it("Providerが契約に反する出力を返した場合は例外を投げる", async () => {
    const run = createAgent(definition, mockProvider({ headline: "" }));
    await expect(run({ topic: "cafe" })).rejects.toThrow();
  });

  it("buildPromptに検証済みの入力を渡す", async () => {
    const seenPrompts: string[] = [];
    const provider: LLMProvider = {
      id: "mock",
      async generateObject({ prompt }) {
        seenPrompts.push(prompt);
        return { headline: "x" } as never;
      },
    };
    const run = createAgent(definition, provider);
    await run({ topic: "cafe" });
    expect(seenPrompts[0]).toBe("Write a headline about: cafe");
  });
});
