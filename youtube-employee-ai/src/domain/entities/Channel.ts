import type { PlatformType } from './Platform';

export type ChannelStatus = 'CONNECTED' | 'REAUTH_REQUIRED' | 'DISCONNECTED';

export interface Channel {
  id: string;
  userId: string;
  platformType: PlatformType;
  externalChannelId: string;
  displayName: string;
  // 暗号化済み(平文トークンではない)。復号・API呼び出しはinfrastructure層の責務。
  accessTokenEnc: string;
  refreshTokenEnc: string;
  tokenExpiresAt: Date;
  isActive: boolean;
  status: ChannelStatus;
  connectedAt: Date;
}
