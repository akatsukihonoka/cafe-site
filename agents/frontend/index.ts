import { createLazyAgent } from "@/core/agent/createAgent";
import type { AgentDefinition } from "@/core/types/agent";
import {
  frontendInputSchema,
  frontendOutputSchema,
  type FrontendInput,
  type FrontendOutput,
} from "./contract";
import { systemPrompt, buildPrompt } from "./prompt";

const definition: AgentDefinition<FrontendInput, FrontendOutput> = {
  name: "frontend",
  inputSchema: frontendInputSchema,
  outputSchema: frontendOutputSchema,
  systemPrompt,
  buildPrompt,
};

export const runFrontend = createLazyAgent(definition);
