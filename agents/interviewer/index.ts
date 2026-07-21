import { createLazyAgent } from "@/core/agent/createAgent";
import type { AgentDefinition } from "@/core/types/agent";
import {
  interviewerInputSchema,
  interviewerOutputSchema,
  type InterviewerInput,
  type InterviewerOutput,
} from "./contract";
import { systemPrompt, buildPrompt } from "./prompt";

const definition: AgentDefinition<InterviewerInput, InterviewerOutput> = {
  name: "interviewer",
  inputSchema: interviewerInputSchema,
  outputSchema: interviewerOutputSchema,
  systemPrompt,
  buildPrompt,
};

export const runInterviewer = createLazyAgent(definition);
