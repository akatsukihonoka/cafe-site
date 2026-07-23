import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockGetCurrentUser = vi.fn();
const mockChannelRepository = { findById: vi.fn() };
const mockBriefingRepository = { findByChannelAndDate: vi.fn() };
const mockGenerateDailyBriefingUsecase = { execute: vi.fn() };

vi.mock('@/application/services/currentUser', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));
vi.mock('@/lib/di/container', () => ({
  getChannelRepository: () => mockChannelRepository,
  getBriefingRepository: () => mockBriefingRepository,
  getGenerateDailyBriefingUsecase: () => mockGenerateDailyBriefingUsecase,
}));

import {
  BriefingNotAuthorizedError,
  RegenerateRateLimitedError,
  regenerateMyBriefing,
} from '@/application/services/briefingService';

const channel = {
  id: 'chan_1',
  userId: 'user_1',
  platformType: 'YOUTUBE' as const,
  externalChannelId: 'yt_123',
  displayName: 'テストチャンネル',
  accessTokenEnc: 'enc',
  refreshTokenEnc: 'enc',
  tokenExpiresAt: new Date(),
  isActive: true,
  status: 'CONNECTED' as const,
  connectedAt: new Date(),
};

describe('regenerateMyBriefing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('未ログインの場合はBriefingNotAuthorizedErrorを投げる', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    await expect(regenerateMyBriefing('chan_1')).rejects.toBeInstanceOf(BriefingNotAuthorizedError);
  });

  it('他ユーザーのチャンネルの場合はBriefingNotAuthorizedErrorを投げる', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'other_user' });
    mockChannelRepository.findById.mockResolvedValue(channel);

    await expect(regenerateMyBriefing('chan_1')).rejects.toBeInstanceOf(BriefingNotAuthorizedError);
  });

  it('直近1時間以内に生成済みの場合はRegenerateRateLimitedErrorを投げる', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user_1' });
    mockChannelRepository.findById.mockResolvedValue(channel);
    mockBriefingRepository.findByChannelAndDate.mockResolvedValue({
      generatedAt: new Date(Date.now() - 5 * 60 * 1000),
    });

    await expect(regenerateMyBriefing('chan_1')).rejects.toBeInstanceOf(RegenerateRateLimitedError);
    expect(mockGenerateDailyBriefingUsecase.execute).not.toHaveBeenCalled();
  });

  it('クールダウンを過ぎていればforce=trueで再生成する', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user_1' });
    mockChannelRepository.findById.mockResolvedValue(channel);
    mockBriefingRepository.findByChannelAndDate.mockResolvedValue({
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    });
    mockGenerateDailyBriefingUsecase.execute.mockResolvedValue({ status: 'COMPLETED' });

    const result = await regenerateMyBriefing('chan_1');

    expect(mockGenerateDailyBriefingUsecase.execute).toHaveBeenCalledWith(
      channel,
      expect.any(Date),
      { force: true },
    );
    expect(result).toEqual({ status: 'COMPLETED' });
  });
});
