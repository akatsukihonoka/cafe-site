import { describe, expect, it, vi } from 'vitest';
import { FetchChannelMetricsUsecase } from '@/domain/usecases/FetchChannelMetrics';
import type { AccessTokenProvider } from '@/domain/ports/AccessTokenProvider';
import type { PlatformDataProvider } from '@/domain/ports/PlatformDataProvider';
import type { Channel } from '@/domain/entities/Channel';

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

describe('FetchChannelMetricsUsecase', () => {
  it('AccessTokenProviderからトークンを取得し、PlatformDataProviderへ渡す', async () => {
    const date = new Date('2026-07-22T00:00:00Z');
    const stats = {
      date,
      totalViews: 10,
      totalWatchTimeMinutes: 5,
      subscribersGained: 0,
      subscribersLost: 0,
      videos: [],
    };

    const tokenProvider: AccessTokenProvider = {
      getValidAccessToken: vi.fn().mockResolvedValue('plain-access-token'),
    };
    const dataProvider: PlatformDataProvider = {
      getChannelProfile: vi.fn(),
      getDailyStats: vi.fn().mockResolvedValue(stats),
    };

    const usecase = new FetchChannelMetricsUsecase(dataProvider, tokenProvider);
    const result = await usecase.execute(channel, date);

    expect(tokenProvider.getValidAccessToken).toHaveBeenCalledWith(channel);
    expect(dataProvider.getDailyStats).toHaveBeenCalledWith('plain-access-token', 'yt_123', date);
    expect(result).toBe(stats);
  });
});
