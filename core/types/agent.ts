import type { z } from "zod";

/**
 * 1つのAIエージェントの契約（入力/出力スキーマ・プロンプト）を定義する型。
 * agents/配下の各エージェントは、この形でdefinitionを1つ作るだけでよい。
 */
export interface AgentDefinition<TIn, TOut> {
  name: string;
  inputSchema: z.ZodType<TIn>;
  outputSchema: z.ZodType<TOut>;
  systemPrompt: string;
  buildPrompt: (input: TIn) => string;
}

export type AgentRunner<TIn, TOut> = (input: TIn) => Promise<TOut>;
