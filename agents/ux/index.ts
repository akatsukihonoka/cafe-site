import { createLazyAgent } from "@/core/agent/createAgent";
import type { AgentDefinition } from "@/core/types/agent";
import { uxInputSchema, uxOutputSchema, type UxInput, type UxOutput } from "./contract";
import { systemPrompt, buildPrompt } from "./prompt";

const definition: AgentDefinition<UxInput, UxOutput> = {
  name: "ux",
  inputSchema: uxInputSchema,
  outputSchema: uxOutputSchema,
  systemPrompt,
  buildPrompt,
};

export const runUx = createLazyAgent(definition);
