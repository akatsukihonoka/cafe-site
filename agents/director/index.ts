import { createLazyAgent } from "@/core/agent/createAgent";
import type { AgentDefinition } from "@/core/types/agent";
import {
  directorInputSchema,
  directorOutputSchema,
  type DirectorInput,
  type DirectorOutput,
} from "./contract";
import { systemPrompt, buildPrompt } from "./prompt";

const definition: AgentDefinition<DirectorInput, DirectorOutput> = {
  name: "director",
  inputSchema: directorInputSchema,
  outputSchema: directorOutputSchema,
  systemPrompt,
  buildPrompt,
};

export const runDirector = createLazyAgent(definition);
