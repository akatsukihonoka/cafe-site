import { describe, expect, it, vi } from 'vitest';
import { ConnectChannelUsecase } from '@/domain/usecases/ConnectChannel';
import { decryptToken } from '@/lib/crypto';
import type { ChannelRepository } from '@/domain/ports/ChannelRepository';

const SECRET = '01234567890123456789012345678901';

describe('ConnectChannelUsecase', () => {
  it('トークンを暗号化してからChannelRepository.upsertConnectionへ渡す', async () => {
    const upsertConnection = vi.fn().mockImplementation(async (input) => ({
      id: 'chan_1',
      userId: input.userId,
      platformType: input.platformType,
      externalChannelId: input.externalChannelId,
      displayName: input.displayName,
      accessTokenEnc: input.accessTokenEnc,
      refreshTokenEnc: input.refreshTokenEnc,
      tokenExpiresAt: input.tokenExpiresAt,
      isActive: true,
      status: 'CONNECTED',
      connectedAt: new Date(),
    }));

    const channelRepository: ChannelRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findActiveChannels: vi.fn(),
      upsertConnection,
      updateStatus: vi.fn(),
      updateTokens: vi.fn(),
      disconnect: vi.fn(),
    };

    const usecase = new ConnectChannelUsecase(channelRepository, SECRET);
    const tokenExpiresAt = new Date('2026-08-01T00:00:00Z');

    const result = await usecase.execute({
      userId: 'user_1',
      platformType: 'YOUTUBE',
      externalChannelId: 'yt_123',
      displayName: 'テストチャンネル',
      accessToken: 'plain-access-token',
      refreshToken: 'plain-refresh-token',
      tokenExpiresAt,
    });

    expect(result.accessTokenEnc).not.toBe('plain-access-token');
    expect(decryptToken(result.accessTokenEnc, SECRET)).toBe('plain-access-token');
    expect(decryptToken(result.refreshTokenEnc, SECRET)).toBe('plain-refresh-token');
  });
});
