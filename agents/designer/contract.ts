import { z } from "zod";
import { requirementSchema } from "@/core/types/requirement";
import { uxOutputSchema } from "@/agents/ux/contract";

export const designerInputSchema = z.object({
  requirement: requirementSchema,
  ux: uxOutputSchema,
});

export const designerOutputSchema = z.object({
  colorPalette: z.object({
    primary: z.string().min(1),
    secondary: z.string().min(1),
    accent: z.string().min(1),
    background: z.string().min(1),
    text: z.string().min(1),
  }),
  typography: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
  }),
  moodKeywords: z.array(z.string()).min(1),
});

export type DesignerInput = z.infer<typeof designerInputSchema>;
export type DesignerOutput = z.infer<typeof designerOutputSchema>;
