import { describe, expect, it } from 'vitest';
import { mapChannelProfile, mapDailyStats } from '@/infrastructure/platforms/youtube/mappers';

describe('mapChannelProfile', () => {
  it('channels.listのレスポンスからexternalChannelIdとdisplayNameを取り出す', () => {
    const result = mapChannelProfile({
      items: [{ id: 'UC_test123', snippet: { title: 'テストチャンネル' } }],
    });

    expect(result).toEqual({ externalChannelId: 'UC_test123', displayName: 'テストチャンネル' });
  });

  it('itemsが空の場合はエラーを投げる', () => {
    expect(() => mapChannelProfile({ items: [] })).toThrow();
  });
});

describe('mapDailyStats', () => {
  const date = new Date('2026-07-22T00:00:00Z');

  it('reports.queryのレスポンスを動画別メトリクスとチャンネル集計に変換する', () => {
    const response = {
      columnHeaders: [
        { name: 'video' },
        { name: 'views' },
        { name: 'estimatedMinutesWatched' },
        { name: 'likes' },
        { name: 'comments' },
        { name: 'subscribersGained' },
        { name: 'subscribersLost' },
        { name: 'impressions' },
        { name: 'impressionsClickThroughRate' },
      ],
      rows: [
        ['video_1', 100, 50, 10, 2, 3, 1, 500, 0.2],
        ['video_2', 50, 20, 5, 1, 1, 0, 200, 0.25],
      ],
    };

    const result = mapDailyStats(response, date);

    expect(result.totalViews).toBe(150);
    expect(result.totalWatchTimeMinutes).toBe(70);
    expect(result.subscribersGained).toBe(4);
    expect(result.subscribersLost).toBe(1);
    expect(result.videos).toHaveLength(2);
    expect(result.videos[0]).toEqual({
      videoId: 'video_1',
      date,
      views: 100,
      likes: 10,
      comments: 2,
      watchTimeMinutes: 50,
      impressions: 500,
      ctr: 0.2,
    });
  });

  it('rowsが空の場合は0埋めの集計を返す', () => {
    const result = mapDailyStats({ columnHeaders: [], rows: [] }, date);

    expect(result).toEqual({
      date,
      totalViews: 0,
      totalWatchTimeMinutes: 0,
      subscribersGained: 0,
      subscribersLost: 0,
      videos: [],
    });
  });
});
