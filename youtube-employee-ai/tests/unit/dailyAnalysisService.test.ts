import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockChannelRepository = {
  findActiveChannels: vi.fn(),
};
const mockJobRunRepository = {
  start: vi.fn(),
  finish: vi.fn(),
};
const mockGenerateDailyBriefingUsecase = {
  execute: vi.fn(),
};

vi.mock('@/lib/di/container', () => ({
  getChannelRepository: () => mockChannelRepository,
  getJobRunRepository: () => mockJobRunRepository,
  getGenerateDailyBriefingUsecase: () => mockGenerateDailyBriefingUsecase,
}));

import { runDailyAnalysisForAllChannels } from '@/application/services/dailyAnalysisService';
import type { Channel } from '@/domain/entities/Channel';

function createChannel(id: string): Channel {
  return {
    id,
    userId: 'user_1',
    platformType: 'YOUTUBE',
    externalChannelId: `yt_${id}`,
    displayName: `チャンネル${id}`,
    accessTokenEnc: 'enc',
    refreshTokenEnc: 'enc',
    tokenExpiresAt: new Date(),
    isActive: true,
    status: 'CONNECTED',
    connectedAt: new Date(),
  };
}

describe('runDailyAnalysisForAllChannels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJobRunRepository.start.mockImplementation(async ({ channelId }) => ({
      id: `job_${channelId}`,
      channelId,
      jobType: 'daily-analysis',
      status: 'RUNNING',
      startedAt: new Date(),
      finishedAt: null,
      durationMs: null,
      errorMessage: null,
    }));
  });

  it('全チャンネルを処理し、成功/失敗件数を集計する', async () => {
    mockChannelRepository.findActiveChannels.mockResolvedValue([
      createChannel('a'),
      createChannel('b'),
    ]);
    mockGenerateDailyBriefingUsecase.execute
      .mockResolvedValueOnce({ status: 'COMPLETED' })
      .mockResolvedValueOnce({ status: 'FAILED', errorMessage: 'AI error' });

    const summary = await runDailyAnalysisForAllChannels();

    expect(summary.succeeded).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.errors).toEqual([{ channelId: 'b', message: 'AI error' }]);
    expect(mockJobRunRepository.finish).toHaveBeenCalledWith('job_a', { status: 'SUCCESS' });
    expect(mockJobRunRepository.finish).toHaveBeenCalledWith('job_b', {
      status: 'FAILED',
      errorMessage: 'AI error',
    });
  });

  it('1チャンネルで予期しない例外が起きても、残りのチャンネルの処理を継続する', async () => {
    mockChannelRepository.findActiveChannels.mockResolvedValue([
      createChannel('a'),
      createChannel('b'),
    ]);
    mockGenerateDailyBriefingUsecase.execute
      .mockRejectedValueOnce(new Error('unexpected db error'))
      .mockResolvedValueOnce({ status: 'COMPLETED' });

    const summary = await runDailyAnalysisForAllChannels();

    expect(summary.succeeded).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.errors).toEqual([{ channelId: 'a', message: 'unexpected db error' }]);
  });

  it('対象チャンネルが0件でも例外を投げず空のサマリを返す', async () => {
    mockChannelRepository.findActiveChannels.mockResolvedValue([]);

    const summary = await runDailyAnalysisForAllChannels();

    expect(summary).toEqual({ succeeded: 0, failed: 0, errors: [] });
    expect(mockGenerateDailyBriefingUsecase.execute).not.toHaveBeenCalled();
  });
});
