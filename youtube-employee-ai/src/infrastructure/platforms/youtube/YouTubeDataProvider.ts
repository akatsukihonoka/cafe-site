import type {
  PlatformChannelProfile,
  PlatformDataProvider,
} from '@/domain/ports/PlatformDataProvider';
import type { ChannelDailyStats } from '@/domain/entities/VideoMetric';
import { fetchMyChannel } from './youtubeDataApiClient';
import { fetchChannelDailyReport } from './youtubeAnalyticsApiClient';
import { mapChannelProfile, mapDailyStats } from './mappers';

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export class YouTubeDataProvider implements PlatformDataProvider {
  async getChannelProfile(accessToken: string): Promise<PlatformChannelProfile> {
    const response = await fetchMyChannel(accessToken);
    return mapChannelProfile(response);
  }

  async getDailyStats(
    accessToken: string,
    externalChannelId: string,
    date: Date,
  ): Promise<ChannelDailyStats> {
    const dateString = toDateString(date);
    const response = await fetchChannelDailyReport(accessToken, {
      channelId: externalChannelId,
      startDate: dateString,
      endDate: dateString,
    });
    return mapDailyStats(response, date);
  }
}
