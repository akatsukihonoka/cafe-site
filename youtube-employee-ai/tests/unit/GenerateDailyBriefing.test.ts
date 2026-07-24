import { describe, expect, it, vi } from 'vitest';
import { GenerateDailyBriefingUsecase } from '@/domain/usecases/GenerateDailyBriefing';
import type { FetchChannelMetricsUsecase } from '@/domain/usecases/FetchChannelMetrics';
import type { AIAnalyzer } from '@/domain/ports/AIAnalyzer';
import type { BriefingRepository } from '@/domain/ports/BriefingRepository';
import type { Channel } from '@/domain/entities/Channel';
import type { Briefing } from '@/domain/entities/Briefing';

const channel: Channel = {
  id: 'chan_1',
  userId: 'user_1',
  platformType: 'YOUTUBE',
  externalChannelId: 'yt_123',
  displayName: 'テストチャンネル',
  accessTokenEnc: 'enc',
  refreshTokenEnc: 'enc',
  tokenExpiresAt: new Date(),
  isActive: true,
  status: 'CONNECTED',
  connectedAt: new Date(),
};

const targetDate = new Date('2026-07-22T00:00:00Z');

const stats = {
  date: targetDate,
  totalViews: 100,
  totalWatchTimeMinutes: 50,
  subscribersGained: 2,
  subscribersLost: 0,
  videos: [],
};

function createRepositories() {
  const briefingRepository: BriefingRepository = {
    findByChannelAndDate: vi.fn(),
    upsert: vi
      .fn()
      .mockImplementation(async (input) => ({ ...input, id: 'briefing_1' }) as Briefing),
    listByChannel: vi.fn(),
  };
  return briefingRepository;
}

describe('GenerateDailyBriefingUsecase', () => {
  it('未生成なら、メトリクス取得→AI分析→COMPLETEDで保存する', async () => {
    const briefingRepository = createRepositories();
    (briefingRepository.findByChannelAndDate as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const fetchChannelMetrics = {
      execute: vi.fn().mockResolvedValue(stats),
    } as unknown as FetchChannelMetricsUsecase;
    const aiAnalyzer: AIAnalyzer = {
      generateBriefing: vi.fn().mockResolvedValue({
        yesterdaySummary: { totalViews: 100 },
        todos: ['サムネイルを見直す'],
        suggestions: [{ title: '投稿頻度', description: '週3本', priority: 'HIGH' }],
      }),
    };

    const usecase = new GenerateDailyBriefingUsecase(
      fetchChannelMetrics,
      aiAnalyzer,
      briefingRepository,
      'gpt-test',
    );

    const result = await usecase.execute(channel, targetDate);

    expect(fetchChannelMetrics.execute).toHaveBeenCalledWith(channel, targetDate);
    expect(aiAnalyzer.generateBriefing).toHaveBeenCalledWith(
      expect.objectContaining({ channelDisplayName: 'テストチャンネル', targetDate }),
    );
    expect(briefingRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ channelId: 'chan_1', targetDate, status: 'COMPLETED' }),
    );
    expect((result as { status: string }).status).toBe('COMPLETED');
  });

  it('既にCOMPLETEDなブリーフィングがあれば再生成せずそのまま返す(冪等性)', async () => {
    const briefingRepository = createRepositories();
    const existing: Briefing = {
      id: 'briefing_1',
      channelId: 'chan_1',
      targetDate,
      status: 'COMPLETED',
      content: { yesterdaySummary: {}, todos: ['既存'], suggestions: [] },
      rawMetrics: null,
      aiModel: 'gpt-test',
      generatedAt: targetDate,
      errorMessage: null,
    };
    (briefingRepository.findByChannelAndDate as ReturnType<typeof vi.fn>).mockResolvedValue(
      existing,
    );

    const fetchChannelMetrics = { execute: vi.fn() } as unknown as FetchChannelMetricsUsecase;
    const aiAnalyzer: AIAnalyzer = { generateBriefing: vi.fn() };

    const usecase = new GenerateDailyBriefingUsecase(
      fetchChannelMetrics,
      aiAnalyzer,
      briefingRepository,
      'gpt-test',
    );

    const result = await usecase.execute(channel, targetDate);

    expect(fetchChannelMetrics.execute).not.toHaveBeenCalled();
    expect(aiAnalyzer.generateBriefing).not.toHaveBeenCalled();
    expect(briefingRepository.upsert).not.toHaveBeenCalled();
    expect(result).toBe(existing);
  });

  it('メトリクス取得やAI分析が失敗した場合はFAILEDとして保存し、例外を外へ投げない', async () => {
    const briefingRepository = createRepositories();
    (briefingRepository.findByChannelAndDate as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const fetchChannelMetrics = {
      execute: vi.fn().mockRejectedValue(new Error('YouTube API error')),
    } as unknown as FetchChannelMetricsUsecase;
    const aiAnalyzer: AIAnalyzer = { generateBriefing: vi.fn() };

    const usecase = new GenerateDailyBriefingUsecase(
      fetchChannelMetrics,
      aiAnalyzer,
      briefingRepository,
      'gpt-test',
    );

    const result = await usecase.execute(channel, targetDate);

    expect(briefingRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        channelId: 'chan_1',
        targetDate,
        status: 'FAILED',
        errorMessage: 'YouTube API error',
      }),
    );
    expect((result as { status: string }).status).toBe('FAILED');
  });
});
