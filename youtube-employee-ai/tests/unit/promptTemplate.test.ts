import { describe, expect, it } from 'vitest';
import { buildUserPrompt } from '@/infrastructure/ai/promptTemplate';
import type { AIAnalysisContext } from '@/domain/ports/AIAnalyzer';

const context: AIAnalysisContext = {
  channelDisplayName: 'テストチャンネル',
  targetDate: new Date('2026-07-22T00:00:00Z'),
  stats: {
    date: new Date('2026-07-22T00:00:00Z'),
    totalViews: 150,
    totalWatchTimeMinutes: 70,
    subscribersGained: 4,
    subscribersLost: 1,
    videos: [
      {
        videoId: 'video_2',
        date: new Date('2026-07-22T00:00:00Z'),
        views: 50,
        likes: 5,
        comments: 1,
        watchTimeMinutes: 20,
        impressions: 200,
        ctr: 0.25,
      },
      {
        videoId: 'video_1',
        date: new Date('2026-07-22T00:00:00Z'),
        views: 100,
        likes: 10,
        comments: 2,
        watchTimeMinutes: 50,
        impressions: 500,
        ctr: 0.2,
      },
    ],
  },
};

describe('buildUserPrompt', () => {
  it('チャンネル名・対象日・集計値を含むJSON文字列を生成する', () => {
    const prompt = buildUserPrompt(context);
    const payload = JSON.parse(prompt);

    expect(payload.channelDisplayName).toBe('テストチャンネル');
    expect(payload.targetDate).toBe('2026-07-22');
    expect(payload.todayStats.totalViews).toBe(150);
    expect(payload.todayStats.subscribersGained).toBe(4);
  });

  it('動画を再生回数の降順に並べ替える', () => {
    const prompt = buildUserPrompt(context);
    const payload = JSON.parse(prompt);

    expect(payload.todayStats.topVideos.map((v: { videoId: string }) => v.videoId)).toEqual([
      'video_1',
      'video_2',
    ]);
  });
});
