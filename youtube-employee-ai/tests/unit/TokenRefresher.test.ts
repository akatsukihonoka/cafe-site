import { describe, expect, it, vi, afterEach } from 'vitest';
import { TokenRefresher } from '@/infrastructure/platforms/youtube/TokenRefresher';
import { encryptToken } from '@/lib/crypto';
import type { ChannelRepository } from '@/domain/ports/ChannelRepository';
import type { Channel } from '@/domain/entities/Channel';

const SECRET = '01234567890123456789012345678901';

function createChannel(overrides: Partial<Channel> = {}): Channel {
  return {
    id: 'chan_1',
    userId: 'user_1',
    platformType: 'YOUTUBE',
    externalChannelId: 'yt_123',
    displayName: 'テストチャンネル',
    accessTokenEnc: encryptToken('current-access-token', SECRET),
    refreshTokenEnc: encryptToken('current-refresh-token', SECRET),
    tokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
    isActive: true,
    status: 'CONNECTED',
    connectedAt: new Date(),
    ...overrides,
  };
}

describe('TokenRefresher', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('有効期限に余裕があれば復号したアクセストークンをそのまま返す(リフレッシュしない)', async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const channelRepository: ChannelRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findActiveChannels: vi.fn(),
      upsertConnection: vi.fn(),
      updateStatus: vi.fn(),
      updateTokens: vi.fn(),
      disconnect: vi.fn(),
    };

    const refresher = new TokenRefresher(
      channelRepository,
      { clientId: 'id', clientSecret: 'secret' },
      SECRET,
    );

    const token = await refresher.getValidAccessToken(createChannel());

    expect(token).toBe('current-access-token');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('期限切れが近い場合はリフレッシュし、新しいトークンをDBへ保存する', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'new-access-token', expires_in: 3600 }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const channelRepository: ChannelRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findActiveChannels: vi.fn(),
      upsertConnection: vi.fn(),
      updateStatus: vi.fn(),
      updateTokens: vi.fn(),
      disconnect: vi.fn(),
    };

    const refresher = new TokenRefresher(
      channelRepository,
      { clientId: 'id', clientSecret: 'secret' },
      SECRET,
    );

    const expiringChannel = createChannel({ tokenExpiresAt: new Date(Date.now() - 1000) });
    const token = await refresher.getValidAccessToken(expiringChannel);

    expect(token).toBe('new-access-token');
    expect(channelRepository.updateTokens).toHaveBeenCalledTimes(1);
    const [channelId, tokens] = (channelRepository.updateTokens as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(channelId).toBe('chan_1');
    expect(tokens.refreshTokenEnc).toBe(expiringChannel.refreshTokenEnc);
  });

  it('リフレッシュが失敗した場合はstatusをREAUTH_REQUIREDへ更新してエラーを投げる', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'invalid_grant',
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const channelRepository: ChannelRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findActiveChannels: vi.fn(),
      upsertConnection: vi.fn(),
      updateStatus: vi.fn(),
      updateTokens: vi.fn(),
      disconnect: vi.fn(),
    };

    const refresher = new TokenRefresher(
      channelRepository,
      { clientId: 'id', clientSecret: 'secret' },
      SECRET,
    );

    const expiringChannel = createChannel({ tokenExpiresAt: new Date(Date.now() - 1000) });

    await expect(refresher.getValidAccessToken(expiringChannel)).rejects.toThrow();
    expect(channelRepository.updateStatus).toHaveBeenCalledWith('chan_1', 'REAUTH_REQUIRED');
  });
});
