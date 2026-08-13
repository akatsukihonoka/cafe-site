import { z } from "zod";
import { requirementSchema } from "@/core/types/requirement";
import { sectionKindSchema } from "@/core/types/section";
import { uxOutputSchema } from "@/agents/ux/contract";
import { marketingOutputSchema } from "@/agents/marketing/contract";
import { designerOutputSchema } from "@/agents/designer/contract";

export const copywriterInputSchema = z.object({
  requirement: requirementSchema,
  ux: uxOutputSchema,
  marketing: marketingOutputSchema,
  designer: designerOutputSchema,
});

export const copywriterOutputSchema = z.object({
  sections: z
    .array(
      z.object({
        kind: sectionKindSchema,
        heading: z.string().min(1),
        body: z.string().min(1),
        cta: z.string().optional(),
      })
    )
    .min(1)
    .describe("uxが決めたsections配列と同じ並び・同じkindの集合であること"),
});

export type CopywriterInput = z.infer<typeof copywriterInputSchema>;
export type CopywriterOutput = z.infer<typeof copywriterOutputSchema>;
