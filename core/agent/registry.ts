import type { PipelineStage } from "../workflow/stages";
import type { AgentRunner } from "../types/agent";

export type RegisteredAgentName = "interviewer" | PipelineStage | "reviewer" | "qa" | "editor";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAgentRunner = AgentRunner<any, any>;

const registry = new Map<RegisteredAgentName, AnyAgentRunner>();

/** Phase6で各エージェントを登録する。すでに登録済みの名前は上書きする(テストでのモック差し替え用)。 */
export function registerAgent(name: RegisteredAgentName, runner: AnyAgentRunner): void {
  registry.set(name, runner);
}

/** Workflow Engineから呼ばれる。未登録の場合はまだ実装されていないことを明示するエラーを投げる。 */
export function getAgent(name: RegisteredAgentName): AnyAgentRunner {
  const runner = registry.get(name);
  if (!runner) {
    throw new Error(`Agent "${name}" is not registered yet.`);
  }
  return runner;
}

/** テスト用: レジストリを空にする。 */
export function clearAgentRegistry(): void {
  registry.clear();
}
