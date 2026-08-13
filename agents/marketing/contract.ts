import { z } from "zod";
import { requirementSchema } from "@/core/types/requirement";
import { directorOutputSchema } from "@/agents/director/contract";

export const marketingInputSchema = z.object({
  requirement: requirementSchema,
  director: directorOutputSchema,
});

export const marketingOutputSchema = z.object({
  targetSegments: z.array(z.string()).min(1),
  valueProposition: z.string().min(1),
  ctaStrategy: z.string().min(1),
});

export type MarketingInput = z.infer<typeof marketingInputSchema>;
export type MarketingOutput = z.infer<typeof marketingOutputSchema>;
