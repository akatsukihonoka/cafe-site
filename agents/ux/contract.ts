import { z } from "zod";
import { requirementSchema } from "@/core/types/requirement";
import { sectionKindSchema } from "@/core/types/section";
import { directorOutputSchema } from "@/agents/director/contract";
import { marketingOutputSchema } from "@/agents/marketing/contract";

export const uxInputSchema = z.object({
  requirement: requirementSchema,
  director: directorOutputSchema,
  marketing: marketingOutputSchema,
});

export const uxOutputSchema = z.object({
  sections: z
    .array(
      z.object({
        kind: sectionKindSchema,
        purpose: z.string().min(1),
      })
    )
    .min(1)
    .describe("配列の並び順がそのままページ上の掲載順になる"),
});

export type UxInput = z.infer<typeof uxInputSchema>;
export type UxOutput = z.infer<typeof uxOutputSchema>;
