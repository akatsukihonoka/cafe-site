import { createLazyAgent } from "@/core/agent/createAgent";
import type { AgentDefinition } from "@/core/types/agent";
import {
  copywriterInputSchema,
  copywriterOutputSchema,
  type CopywriterInput,
  type CopywriterOutput,
} from "./contract";
import { systemPrompt, buildPrompt } from "./prompt";

const definition: AgentDefinition<CopywriterInput, CopywriterOutput> = {
  name: "copywriter",
  inputSchema: copywriterInputSchema,
  outputSchema: copywriterOutputSchema,
  systemPrompt,
  buildPrompt,
};

export const runCopywriter = createLazyAgent(definition);
