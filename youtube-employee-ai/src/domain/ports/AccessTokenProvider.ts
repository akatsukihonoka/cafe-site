import type { Channel } from '@/domain/entities/Channel';

/** 有効なアクセストークンを返すポート。期限切れなら実装側でリフレッシュする。 */
export interface AccessTokenProvider {
  getValidAccessToken(channel: Channel): Promise<string>;
}
