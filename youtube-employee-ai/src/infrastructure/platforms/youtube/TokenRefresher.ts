import type { Channel } from '@/domain/entities/Channel';
import type { AccessTokenProvider } from '@/domain/ports/AccessTokenProvider';
import type { ChannelRepository } from '@/domain/ports/ChannelRepository';
import { decryptToken, encryptToken } from '@/lib/crypto';
import { refreshAccessToken, type GoogleOAuthConfig } from './googleOAuthClient';

const EXPIRY_BUFFER_MS = 60_000;

export class TokenRefresher implements AccessTokenProvider {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly oauthConfig: Pick<GoogleOAuthConfig, 'clientId' | 'clientSecret'>,
    private readonly encryptionSecret: string,
  ) {}

  /** 有効なアクセストークン(平文)を返す。期限切れが近ければ自動でリフレッシュしDBへ反映する。 */
  async getValidAccessToken(channel: Channel): Promise<string> {
    const isExpiringSoon = channel.tokenExpiresAt.getTime() - Date.now() < EXPIRY_BUFFER_MS;

    if (!isExpiringSoon) {
      return decryptToken(channel.accessTokenEnc, this.encryptionSecret);
    }

    const refreshToken = decryptToken(channel.refreshTokenEnc, this.encryptionSecret);

    try {
      const refreshed = await refreshAccessToken(this.oauthConfig, refreshToken);
      const tokenExpiresAt = new Date(Date.now() + refreshed.expiresInSeconds * 1000);

      await this.channelRepository.updateTokens(channel.id, {
        accessTokenEnc: encryptToken(refreshed.accessToken, this.encryptionSecret),
        refreshTokenEnc: channel.refreshTokenEnc,
        tokenExpiresAt,
      });

      return refreshed.accessToken;
    } catch (error) {
      await this.channelRepository.updateStatus(channel.id, 'REAUTH_REQUIRED');
      throw error;
    }
  }
}
