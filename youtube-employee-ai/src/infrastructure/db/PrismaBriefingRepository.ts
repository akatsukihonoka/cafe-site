import type { Prisma, PrismaClient } from '@/generated/prisma/client';
import type {
  Briefing,
  BriefingContent,
  BriefingStatus,
  BriefingSuggestion,
} from '@/domain/entities/Briefing';
import type {
  BriefingListOptions,
  BriefingRepository,
  BriefingUpsertInput,
} from '@/domain/ports/BriefingRepository';

interface BriefingRecord {
  id: string;
  channelId: string;
  targetDate: Date;
  status: string;
  yesterdaySummaryJson: unknown;
  todosJson: unknown;
  suggestionsJson: unknown;
  rawMetricsJson: unknown;
  aiModel: string | null;
  generatedAt: Date | null;
  errorMessage: string | null;
}

function toDomain(record: BriefingRecord): Briefing {
  const hasContent =
    record.yesterdaySummaryJson != null ||
    record.todosJson != null ||
    record.suggestionsJson != null;

  const content: BriefingContent | null = hasContent
    ? {
        yesterdaySummary: (record.yesterdaySummaryJson ?? {}) as Record<string, unknown>,
        todos: (record.todosJson ?? []) as string[],
        suggestions: (record.suggestionsJson ?? []) as BriefingSuggestion[],
      }
    : null;

  return {
    id: record.id,
    channelId: record.channelId,
    targetDate: record.targetDate,
    status: record.status as BriefingStatus,
    content,
    rawMetrics: (record.rawMetricsJson ?? null) as Record<string, unknown> | null,
    aiModel: record.aiModel,
    generatedAt: record.generatedAt,
    errorMessage: record.errorMessage,
  };
}

export class PrismaBriefingRepository implements BriefingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByChannelAndDate(channelId: string, targetDate: Date): Promise<Briefing | null> {
    const record = await this.prisma.briefing.findUnique({
      where: { channelId_targetDate: { channelId, targetDate } },
    });
    return record ? toDomain(record) : null;
  }

  async upsert(input: BriefingUpsertInput): Promise<Briefing> {
    const data = {
      status: input.status,
      yesterdaySummaryJson: input.content?.yesterdaySummary as Prisma.InputJsonValue | undefined,
      todosJson: input.content?.todos as Prisma.InputJsonValue | undefined,
      suggestionsJson: input.content?.suggestions as Prisma.InputJsonValue | undefined,
      rawMetricsJson: input.rawMetrics as Prisma.InputJsonValue | undefined,
      aiModel: input.aiModel ?? undefined,
      generatedAt: input.generatedAt ?? undefined,
      errorMessage: input.errorMessage ?? undefined,
    };

    const record = await this.prisma.briefing.upsert({
      where: { channelId_targetDate: { channelId: input.channelId, targetDate: input.targetDate } },
      create: { channelId: input.channelId, targetDate: input.targetDate, ...data },
      update: data,
    });
    return toDomain(record);
  }

  async listByChannel(channelId: string, options?: BriefingListOptions): Promise<Briefing[]> {
    const records = await this.prisma.briefing.findMany({
      where: { channelId },
      orderBy: { targetDate: 'desc' },
      take: options?.take ?? 30,
      ...(options?.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    });
    return records.map(toDomain);
  }
}
