export type JobRunStatus = 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';

export interface JobRunRecord {
  id: string;
  channelId: string | null;
  jobType: string;
  status: JobRunStatus;
  startedAt: Date;
  finishedAt: Date | null;
  durationMs: number | null;
  errorMessage: string | null;
}

export interface StartJobRunInput {
  jobType: string;
  channelId?: string | null;
}

export interface FinishJobRunInput {
  status: JobRunStatus;
  errorMessage?: string | null;
}

export interface JobRunRepository {
  start(input: StartJobRunInput): Promise<JobRunRecord>;
  finish(id: string, input: FinishJobRunInput): Promise<JobRunRecord>;
}
