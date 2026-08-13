import { createLazyAgent } from "@/core/agent/createAgent";
import type { AgentDefinition } from "@/core/types/agent";
import {
  analyticsAdvisorInputSchema,
  analyticsAdvisorOutputSchema,
  type AnalyticsAdvisorInput,
  type AnalyticsAdvisorOutput,
} from "./contract";
import { systemPrompt, buildPrompt } from "./prompt";

const definition: AgentDefinition<AnalyticsAdvisorInput, AnalyticsAdvisorOutput> = {
  name: "analyticsAdvisor",
  inputSchema: analyticsAdvisorInputSchema,
  outputSchema: analyticsAdvisorOutputSchema,
  systemPrompt,
  buildPrompt,
};

export const runAnalyticsAdvisor = createLazyAgent(definition);
