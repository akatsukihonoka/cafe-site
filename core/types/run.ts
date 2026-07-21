import type { PipelineStage } from "../workflow/stages";

export type RunStageName = "interview" | PipelineStage | "review_qa" | "deploy";

export type StageRecordStatus = "pending" | "running" | "succeeded" | "failed";

export interface StageRecord {
  stage: RunStageName;
  status: StageRecordStatus;
  attempt: number;
  output?: unknown;
  score?: number;
}

export type RunStatus =
  | "interviewing"
  | "planning"
  | "reviewing"
  | "deploying"
  | "completed"
  | "needs_attention";

export interface RunState {
  runId: string;
  projectId: string;
  status: RunStatus;
  finalScore?: number;
  deployUrl?: string;
}
