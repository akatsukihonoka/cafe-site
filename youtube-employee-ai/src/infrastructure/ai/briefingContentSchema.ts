import { z } from 'zod';

export const briefingSuggestionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
});

export const briefingContentSchema = z.object({
  yesterdaySummary: z.record(z.string(), z.unknown()),
  todos: z.array(z.string().min(1)).min(1),
  suggestions: z.array(briefingSuggestionSchema).min(1),
});
