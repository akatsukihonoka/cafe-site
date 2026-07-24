import type { Channel, ChannelStatus } from '@/domain/entities/Channel';
import type { PlatformType } from '@/domain/entities/Platform';

export interface ChannelConnectionInput {
  userId: string;
  platformType: PlatformType;
  externalChannelId: string;
  displayName: string;
  accessTokenEnc: string;
  refreshTokenEnc: string;
  tokenExpiresAt: Date;
}

export interface ChannelTokens {
  accessTokenEnc: string;
  refreshTokenEnc: string;
  tokenExpiresAt: Date;
}

export interface ChannelRepository {
  findById(id: string): Promise<Channel | null>;
  findByUserId(userId: string): Promise<Channel[]>;
  /** 毎朝バッチが走査する対象。isActive=true かつ status=CONNECTED のチャンネル。 */
  findActiveChannels(): Promise<Channel[]>;
  /** 同一 (platformType, externalChannelId) の場合は既存レコードを更新する。 */
  upsertConnection(input: ChannelConnectionInput): Promise<Channel>;
  updateStatus(id: string, status: ChannelStatus): Promise<void>;
  updateTokens(id: string, tokens: ChannelTokens): Promise<void>;
  disconnect(id: string): Promise<void>;
}
