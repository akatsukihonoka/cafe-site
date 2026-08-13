import type { LLMProvider } from "../llm/provider.port";
import { getLLMProvider } from "../llm/providers";
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

/**
 * createAgentのProvider解決を遅延させたバージョン。
 * getLLMProvider()(= OPENAI_MODEL等の環境変数を読む)はモジュール読み込み時ではなく、
 * 実際にエージェントが呼ばれた瞬間に実行される。
 * これによりagents/配下のindex.tsをimportしただけでは環境変数の有無を問わず失敗しない
 * (next buildやルートのモジュール解決時に環境変数が未設定でも壊れない)。
 */
export function createLazyAgent<TIn, TOut>(
  definition: AgentDefinition<TIn, TOut>,
  resolveProvider: () => LLMProvider = getLLMProvider
): AgentRunner<TIn, TOut> {
  return (rawInput: TIn) => createAgent(definition, resolveProvider())(rawInput);
}
