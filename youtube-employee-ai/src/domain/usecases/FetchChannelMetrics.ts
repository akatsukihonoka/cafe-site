import type { Channel } from '@/domain/entities/Channel';
import type { ChannelDailyStats } from '@/domain/entities/VideoMetric';
import type { AccessTokenProvider } from '@/domain/ports/AccessTokenProvider';
import type { PlatformDataProvider } from '@/domain/ports/PlatformDataProvider';

export class FetchChannelMetricsUsecase {
  constructor(
    private readonly dataProvider: PlatformDataProvider,
    private readonly tokenProvider: AccessTokenProvider,
  ) {}

  async execute(channel: Channel, date: Date): Promise<ChannelDailyStats> {
    const accessToken = await this.tokenProvider.getValidAccessToken(channel);
    return this.dataProvider.getDailyStats(accessToken, channel.externalChannelId, date);
  }
}
