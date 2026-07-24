import { describe, expect, it, vi } from 'vitest';
import { PrismaBriefingRepository } from '@/infrastructure/db/PrismaBriefingRepository';
import type { PrismaClient } from '@/generated/prisma/client';

function createMockPrisma() {
  return {
    briefing: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
  } as unknown as PrismaClient;
}

const targetDate = new Date('2026-07-22T00:00:00Z');

describe('PrismaBriefingRepository', () => {
  it('upsert: (channelId, targetDate)の複合キーで冪等に保存する', async () => {
    const prisma = createMockPrisma();
    (prisma.briefing.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'briefing_1',
      channelId: 'chan_1',
      targetDate,
      status: 'COMPLETED',
      yesterdaySummaryJson: { views: 100 },
      todosJson: ['サムネイルを見直す'],
      suggestionsJson: [
        { title: '投稿頻度を上げる', description: '週3本を目標に', priority: 'HIGH' },
      ],
      rawMetricsJson: { raw: true },
      aiModel: 'gpt-test',
      generatedAt: targetDate,
      errorMessage: null,
    });

    const repo = new PrismaBriefingRepository(prisma);
    const result = await repo.upsert({
      channelId: 'chan_1',
      targetDate,
      status: 'COMPLETED',
      content: {
        yesterdaySummary: { views: 100 },
        todos: ['サムネイルを見直す'],
        suggestions: [
          { title: '投稿頻度を上げる', description: '週3本を目標に', priority: 'HIGH' },
        ],
      },
      rawMetrics: { raw: true },
      aiModel: 'gpt-test',
      generatedAt: targetDate,
    });

    expect(prisma.briefing.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { channelId_targetDate: { channelId: 'chan_1', targetDate } },
      }),
    );
    expect(result.content?.todos).toEqual(['サムネイルを見直す']);
    expect(result.status).toBe('COMPLETED');
  });

  it('findByChannelAndDate: 未生成の場合はnullを返す', async () => {
    const prisma = createMockPrisma();
    (prisma.briefing.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const repo = new PrismaBriefingRepository(prisma);
    const result = await repo.findByChannelAndDate('chan_1', targetDate);

    expect(result).toBeNull();
  });

  it('findByChannelAndDate: yesterdaySummaryJson等が全てnullの場合はcontent=nullとして返す(FAILED状態を表す)', async () => {
    const prisma = createMockPrisma();
    (prisma.briefing.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'briefing_1',
      channelId: 'chan_1',
      targetDate,
      status: 'FAILED',
      yesterdaySummaryJson: null,
      todosJson: null,
      suggestionsJson: null,
      rawMetricsJson: null,
      aiModel: null,
      generatedAt: null,
      errorMessage: 'OpenAI timeout',
    });

    const repo = new PrismaBriefingRepository(prisma);
    const result = await repo.findByChannelAndDate('chan_1', targetDate);

    expect(result?.content).toBeNull();
    expect(result?.errorMessage).toBe('OpenAI timeout');
  });

  it('listByChannel: 対象日の新しい順に取得する', async () => {
    const prisma = createMockPrisma();
    (prisma.briefing.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const repo = new PrismaBriefingRepository(prisma);
    await repo.listByChannel('chan_1');

    expect(prisma.briefing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { channelId: 'chan_1' },
        orderBy: { targetDate: 'desc' },
        take: 30,
      }),
    );
  });
});
