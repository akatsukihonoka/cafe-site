import type { RunStageName, RunState, RunStatus, StageRecord } from "../types/run";

/**
 * ワークフローの進行状態を永続化するためのポート。
 * inngest/functions/はこのインターフェースにのみ依存し、Supabaseを直接importしない。
 * これによりテスト時はインメモリ実装に差し替えられる。
 */
export interface RunStore {
  /** 行が無ければ作成し、あれば何もしない(冪等)。チャットの各送信で呼んでも安全。 */
  ensureRun(runId: string, projectId: string): Promise<RunState>;
  updateRunStatus(runId: string, status: RunStatus): Promise<void>;
  setCurrentStage(runId: string, stage: RunStageName): Promise<void>;
  upsertStageRecord(runId: string, record: StageRecord): Promise<void>;
  completeRun(runId: string, finalScore: number, deployUrl?: string): Promise<void>;
}
