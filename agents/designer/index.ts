import { createLazyAgent } from "@/core/agent/createAgent";
import type { AgentDefinition } from "@/core/types/agent";
import {
  designerInputSchema,
  designerOutputSchema,
  type DesignerInput,
  type DesignerOutput,
} from "./contract";
import { systemPrompt, buildPrompt } from "./prompt";

const definition: AgentDefinition<DesignerInput, DesignerOutput> = {
  name: "designer",
  inputSchema: designerInputSchema,
  outputSchema: designerOutputSchema,
  systemPrompt,
  buildPrompt,
};

export const runDesigner = createLazyAgent(definition);
