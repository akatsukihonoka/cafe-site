import { z } from "zod";
import { requirementSchema } from "@/core/types/requirement";

export const interviewMessageSchema = z.object({
  role: z.enum(["user", "interviewer"]),
  content: z.string(),
});

export const interviewerInputSchema = z.object({
  history: z.array(interviewMessageSchema).min(1),
});

export const interviewerOutputSchema = z
  .object({
    status: z.enum(["question", "complete"]),
    message: z.string().min(1),
    requirement: requirementSchema.optional(),
  })
  .refine((v) => v.status !== "complete" || v.requirement !== undefined, {
    message: "requirement is required when status is 'complete'",
    path: ["requirement"],
  });

export type InterviewerInput = z.infer<typeof interviewerInputSchema>;
export type InterviewerOutput = z.infer<typeof interviewerOutputSchema>;
