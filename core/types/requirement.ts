import { z } from "zod";

/**
 * Interviewer Agentが確定する要件JSON。Director以降の全エージェントの起点になる。
 */
export const requirementSchema = z.object({
  siteType: z.string().describe("例: カフェ, ポートフォリオ, SaaSのLP"),
  goal: z.string().describe("このサイトで達成したいこと"),
  targetAudience: z.string(),
  mustHaveSections: z.array(z.string()).min(1),
  tone: z.string().describe("例: 落ち着いた, ポップ, 高級感"),
  brandNotes: z.string().optional(),
});

export type Requirement = z.infer<typeof requirementSchema>;
