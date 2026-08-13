import { z } from "zod";
import { reviewResultSchema } from "@/core/workflow/scoring";

/**
 * Reviewerは各ステージの成果物を横断的に見るため、入力の形はステージごとに違う。
 * 個々のエージェント出力スキーマを全てimportして結合するとReviewerが全エージェントに
 * 密結合してしまうため、ここでは意図的に緩い型(unknown)を使う。
 */
export const reviewerInputSchema = z.object({
  requirement: z.unknown(),
  outputs: z.record(z.string(), z.unknown()),
});

export const reviewerOutputSchema = reviewResultSchema;

export type ReviewerInput = z.infer<typeof reviewerInputSchema>;
export type ReviewerOutput = z.infer<typeof reviewerOutputSchema>;
