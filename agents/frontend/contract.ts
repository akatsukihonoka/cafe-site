import { z } from "zod";
import { requirementSchema } from "@/core/types/requirement";
import { sectionKindSchema } from "@/core/types/section";
import { uxOutputSchema } from "@/agents/ux/contract";
import { designerOutputSchema } from "@/agents/designer/contract";
import { copywriterOutputSchema } from "@/agents/copywriter/contract";

export const frontendInputSchema = z.object({
  requirement: requirementSchema,
  ux: uxOutputSchema,
  designer: designerOutputSchema,
  copywriter: copywriterOutputSchema,
});

/** Phase7のコード生成が実コンポーネントを選ぶ際に使うレイアウトの変化形。 */
export const layoutVariantSchema = z.enum(["a", "b", "c"]);

export const frontendOutputSchema = z.object({
  pageTitle: z.string().min(1),
  sections: z
    .array(
      z.object({
        kind: sectionKindSchema,
        layoutVariant: layoutVariantSchema,
        heading: z.string().min(1),
        body: z.string().min(1),
        cta: z.string().optional(),
      })
    )
    .min(1),
});

export type FrontendInput = z.infer<typeof frontendInputSchema>;
export type FrontendOutput = z.infer<typeof frontendOutputSchema>;
