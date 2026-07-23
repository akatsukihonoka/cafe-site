import type { PlatformChannelProfile } from '@/domain/ports/PlatformDataProvider';
import type { ChannelDailyStats, VideoMetric } from '@/domain/entities/VideoMetric';
import type { YouTubeAnalyticsReportResponse } from './youtubeAnalyticsApiClient';
import type { YouTubeChannelListResponse } from './youtubeDataApiClient';

export function mapChannelProfile(response: YouTubeChannelListResponse): PlatformChannelProfile {
  const item = response.items?.[0];
  if (!item) {
    throw new Error('YouTube channel not found for the authenticated account');
  }
  return {
    externalChannelId: item.id,
    displayName: item.snippet?.title ?? '(no title)',
  };
}

export function mapDailyStats(
  response: YouTubeAnalyticsReportResponse,
  date: Date,
): ChannelDailyStats {
  const headers = response.columnHeaders?.map((header) => header.name) ?? [];
  const rows = response.rows ?? [];
  const records = rows.map((row) => toRecord(headers, row));

  const videos: VideoMetric[] = records.map((record) => ({
    videoId: String(record.video ?? ''),
    date,
    views: toNumber(record.views),
    likes: toNumber(record.likes),
    comments: toNumber(record.comments),
    watchTimeMinutes: toNumber(record.estimatedMinutesWatched),
    impressions: record.impressions == null ? null : toNumber(record.impressions),
    ctr:
      record.impressionsClickThroughRate == null
        ? null
        : toNumber(record.impressionsClickThroughRate),
  }));

  return {
    date,
    totalViews: sum(videos.map((video) => video.views)),
    totalWatchTimeMinutes: sum(videos.map((video) => video.watchTimeMinutes)),
    subscribersGained: sum(records.map((record) => toNumber(record.subscribersGained))),
    subscribersLost: sum(records.map((record) => toNumber(record.subscribersLost))),
    videos,
  };
}

function toRecord(
  headers: string[],
  row: Array<string | number>,
): Record<string, string | number | undefined> {
  const record: Record<string, string | number | undefined> = {};
  headers.forEach((header, index) => {
    record[header] = row[index];
  });
  return record;
}

function toNumber(value: string | number | undefined): number {
  if (value == null) return 0;
  return typeof value === 'number' ? value : Number(value);
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
