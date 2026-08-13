import { z } from "zod";
import { requirementSchema } from "@/core/types/requirement";

export const directorInputSchema = z.object({
  requirement: requirementSchema,
});

export const directorOutputSchema = z.object({
  overview: z.string().min(1),
  pages: z.array(z.string()).min(1),
  priorities: z.array(z.string()).min(1),
});

export type DirectorInput = z.infer<typeof directorInputSchema>;
export type DirectorOutput = z.infer<typeof directorOutputSchema>;
