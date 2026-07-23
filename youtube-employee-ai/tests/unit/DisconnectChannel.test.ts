import { describe, expect, it, vi } from 'vitest';
import { DisconnectChannelUsecase } from '@/domain/usecases/DisconnectChannel';
import type { ChannelRepository } from '@/domain/ports/ChannelRepository';
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

function createChannelRepository(): ChannelRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findActiveChannels: vi.fn(),
    upsertConnection: vi.fn(),
    updateStatus: vi.fn(),
    updateTokens: vi.fn(),
    disconnect: vi.fn(),
  };
}

describe('DisconnectChannelUsecase', () => {
  it('本人のチャンネルであれば解除する', async () => {
    const channelRepository = createChannelRepository();
    (channelRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(channel);

    const usecase = new DisconnectChannelUsecase(channelRepository);
    await usecase.execute({ userId: 'user_1', channelId: 'chan_1' });

    expect(channelRepository.disconnect).toHaveBeenCalledWith('chan_1');
  });

  it('他ユーザーのチャンネルであれば例外を投げ、解除しない', async () => {
    const channelRepository = createChannelRepository();
    (channelRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(channel);

    const usecase = new DisconnectChannelUsecase(channelRepository);

    await expect(usecase.execute({ userId: 'other_user', channelId: 'chan_1' })).rejects.toThrow();
    expect(channelRepository.disconnect).not.toHaveBeenCalled();
  });

  it('存在しないチャンネルであれば例外を投げる', async () => {
    const channelRepository = createChannelRepository();
    (channelRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const usecase = new DisconnectChannelUsecase(channelRepository);

    await expect(usecase.execute({ userId: 'user_1', channelId: 'unknown' })).rejects.toThrow();
  });
});
