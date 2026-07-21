import { createLazyAgent } from "@/core/agent/createAgent";
import type { AgentDefinition } from "@/core/types/agent";
import { qaInputSchema, qaOutputSchema, type QaInput, type QaOutput } from "./contract";
import { systemPrompt, buildPrompt } from "./prompt";

const definition: AgentDefinition<QaInput, QaOutput> = {
  name: "qa",
  inputSchema: qaInputSchema,
  outputSchema: qaOutputSchema,
  systemPrompt,
  buildPrompt,
};

export const runQa = createLazyAgent(definition);
