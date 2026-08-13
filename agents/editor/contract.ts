import { z } from "zod";
import { frontendOutputSchema } from "@/agents/frontend/contract";
import { designerOutputSchema } from "@/agents/designer/contract";

export const editorInputSchema = z.object({
  instruction: z.string().min(1),
  frontend: frontendOutputSchema,
  designer: designerOutputSchema,
});

export const editorOutputSchema = z.object({
  frontend: frontendOutputSchema,
  designer: designerOutputSchema,
  summary: z.string().min(1).describe("何を変更したか(または、なぜ変更しなかったか)を日本語1文で"),
});

export type EditorInput = z.infer<typeof editorInputSchema>;
export type EditorOutput = z.infer<typeof editorOutputSchema>;
