import { createLazyAgent } from "@/core/agent/createAgent";
import type { AgentDefinition } from "@/core/types/agent";
import {
  reviewerInputSchema,
  reviewerOutputSchema,
  type ReviewerInput,
  type ReviewerOutput,
} from "./contract";
import { systemPrompt, buildPrompt } from "./prompt";

const definition: AgentDefinition<ReviewerInput, ReviewerOutput> = {
  name: "reviewer",
  inputSchema: reviewerInputSchema,
  outputSchema: reviewerOutputSchema,
  systemPrompt,
  buildPrompt,
};

export const runReviewer = createLazyAgent(definition);
