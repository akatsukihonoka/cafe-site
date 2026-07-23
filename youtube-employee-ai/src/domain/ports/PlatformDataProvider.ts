import type { ChannelDailyStats } from '@/domain/entities/VideoMetric';

export interface PlatformChannelProfile {
  externalChannelId: string;
  displayName: string;
}

/**
 * YouTube/TikTok等、各SNSプラットフォームのデータ取得を抽象化するポート。
 * 実装は infrastructure/platforms/<platform> に置く。
 */
export interface PlatformDataProvider {
  getChannelProfile(accessToken: string): Promise<PlatformChannelProfile>;
  getDailyStats(
    accessToken: string,
    externalChannelId: string,
    date: Date,
  ): Promise<ChannelDailyStats>;
}
