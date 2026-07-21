import type { LLMProvider } from "../llm/provider.port";
import type { AgentDefinition, AgentRunner } from "../types/agent";

/**
 * 全エージェント共通の実行基盤。
 *
 * - 入力をinputSchemaで検証する（不正な入力を渡すエージェントを早期に弾く）
 * - systemPrompt + buildPrompt(input) をLLMProviderに渡す
 * - 返ってきたオブジェクトをoutputSchemaで再検証する（LLMが契約を破った出力を返した場合に弾く）
 *
 * agents/配下の各エージェントは、AgentDefinitionを1つ渡してcreateAgentを呼ぶだけで、
 * 「入力/出力の厳密な分離」というルールを個別に実装しなくてよい。
 */
export function createAgent<TIn, TOut>(
  definition: AgentDefinition<TIn, TOut>,
  provider: LLMProvider
): AgentRunner<TIn, TOut> {
  return async (rawInput: TIn): Promise<TOut> => {
    const input = definition.inputSchema.parse(rawInput);

    const output = await provider.generateObject<TOut>({
      system: definition.systemPrompt,
      prompt: definition.buildPrompt(input),
      schema: definition.outputSchema,
    });

    return definition.outputSchema.parse(output);
  };
}
