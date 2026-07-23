import type { PrismaClient } from '@/generated/prisma/client';
import type {
  FinishJobRunInput,
  JobRunRecord,
  JobRunRepository,
  JobRunStatus,
  StartJobRunInput,
} from '@/domain/ports/JobRunRepository';

interface JobRunRow {
  id: string;
  channelId: string | null;
  jobType: string;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
  durationMs: number | null;
  errorMessage: string | null;
}

function toDomain(row: JobRunRow): JobRunRecord {
  return {
    id: row.id,
    channelId: row.channelId,
    jobType: row.jobType,
    status: row.status as JobRunStatus,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    durationMs: row.durationMs,
    errorMessage: row.errorMessage,
  };
}

export class PrismaJobRunRepository implements JobRunRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async start(input: StartJobRunInput): Promise<JobRunRecord> {
    const row = await this.prisma.jobRun.create({
      data: {
        jobType: input.jobType,
        channelId: input.channelId ?? undefined,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });
    return toDomain(row);
  }

  async finish(id: string, input: FinishJobRunInput): Promise<JobRunRecord> {
    const existing = await this.prisma.jobRun.findUniqueOrThrow({ where: { id } });
    const finishedAt = new Date();

    const row = await this.prisma.jobRun.update({
      where: { id },
      data: {
        status: input.status,
        finishedAt,
        durationMs: finishedAt.getTime() - existing.startedAt.getTime(),
        errorMessage: input.errorMessage ?? undefined,
      },
    });
    return toDomain(row);
  }
}
