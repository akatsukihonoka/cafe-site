import type { Channel } from '@/domain/entities/Channel';
import type { PlatformType } from '@/domain/entities/Platform';
import type { ChannelRepository } from '@/domain/ports/ChannelRepository';
import { encryptToken } from '@/lib/crypto';

export interface ConnectChannelInput {
  userId: string;
  platformType: PlatformType;
  externalChannelId: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
}

export class ConnectChannelUsecase {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly encryptionSecret: string,
  ) {}

  async execute(input: ConnectChannelInput): Promise<Channel> {
    return this.channelRepository.upsertConnection({
      userId: input.userId,
      platformType: input.platformType,
      externalChannelId: input.externalChannelId,
      displayName: input.displayName,
      accessTokenEnc: encryptToken(input.accessToken, this.encryptionSecret),
      refreshTokenEnc: encryptToken(input.refreshToken, this.encryptionSecret),
      tokenExpiresAt: input.tokenExpiresAt,
    });
  }
}
