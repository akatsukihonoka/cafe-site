import { toExternalApiError } from '@/lib/errors';

const YOUTUBE_ANALYTICS_API_BASE = 'https://youtubeanalytics.googleapis.com/v2';

const METRICS = [
  'views',
  'estimatedMinutesWatched',
  'likes',
  'comments',
  'subscribersGained',
  'subscribersLost',
  'impressions',
  'impressionsClickThroughRate',
].join(',');

export interface YouTubeAnalyticsReportResponse {
  columnHeaders?: Array<{ name: string }>;
  rows?: Array<Array<string | number>>;
}

export interface YouTubeAnalyticsQuery {
  channelId: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
}

/** 動画別ディメンションで、対象期間のチャンネル指標を1クエリにまとめて取得する。 */
export async function fetchChannelDailyReport(
  accessToken: string,
  query: YouTubeAnalyticsQuery,
): Promise<YouTubeAnalyticsReportResponse> {
  const url = new URL(`${YOUTUBE_ANALYTICS_API_BASE}/reports`);
  url.searchParams.set('ids', `channel==${query.channelId}`);
  url.searchParams.set('startDate', query.startDate);
  url.searchParams.set('endDate', query.endDate);
  url.searchParams.set('dimensions', 'video');
  url.searchParams.set('metrics', METRICS);
  url.searchParams.set('sort', '-views');

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw await toExternalApiError(response, 'YouTube Analytics API error');
  }

  return response.json() as Promise<YouTubeAnalyticsReportResponse>;
}
