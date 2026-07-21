import { createLazyAgent } from "@/core/agent/createAgent";
import type { AgentDefinition } from "@/core/types/agent";
import {
  marketingInputSchema,
  marketingOutputSchema,
  type MarketingInput,
  type MarketingOutput,
} from "./contract";
import { systemPrompt, buildPrompt } from "./prompt";

const definition: AgentDefinition<MarketingInput, MarketingOutput> = {
  name: "marketing",
  inputSchema: marketingInputSchema,
  outputSchema: marketingOutputSchema,
  systemPrompt,
  buildPrompt,
};

export const runMarketing = createLazyAgent(definition);
