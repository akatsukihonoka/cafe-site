import { z } from "zod";
import { reviewResultSchema } from "@/core/workflow/scoring";

export const qaInputSchema = z.object({
  requirement: z.unknown(),
  outputs: z.record(z.string(), z.unknown()),
});

export const qaOutputSchema = reviewResultSchema;

export type QaInput = z.infer<typeof qaInputSchema>;
export type QaOutput = z.infer<typeof qaOutputSchema>;
