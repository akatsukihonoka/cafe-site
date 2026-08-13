import { createLazyAgent } from "@/core/agent/createAgent";
import type { AgentDefinition } from "@/core/types/agent";
import {
  editorInputSchema,
  editorOutputSchema,
  type EditorInput,
  type EditorOutput,
} from "./contract";
import { systemPrompt, buildPrompt } from "./prompt";

const definition: AgentDefinition<EditorInput, EditorOutput> = {
  name: "editor",
  inputSchema: editorInputSchema,
  outputSchema: editorOutputSchema,
  systemPrompt,
  buildPrompt,
};

export const runEditor = createLazyAgent(definition);
