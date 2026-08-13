import { z } from "zod";
import { requirementSchema } from "@/core/types/requirement";

export const analyticsSummarySchema = z.object({
  pageviews: z.number().int().min(0),
  totalCtaClicks: z.number().int().min(0),
  ctaClicksByKind: z.record(z.string(), z.number().int().min(0)),
});

export const analyticsAdvisorInputSchema = z.object({
  requirement: requirementSchema,
  summary: analyticsSummarySchema,
});

export const analyticsAdvisorOutputSchema = z.object({
  headline: z.string().min(1).describe("現状を一言でまとめたもの"),
  recommendations: z
    .array(z.string().min(1))
    .min(1)
    .max(5)
    .describe("優先順位順の具体的な改善提案"),
});

export type AnalyticsAdvisorInput = z.infer<typeof analyticsAdvisorInputSchema>;
export type AnalyticsAdvisorOutput = z.infer<typeof analyticsAdvisorOutputSchema>;
