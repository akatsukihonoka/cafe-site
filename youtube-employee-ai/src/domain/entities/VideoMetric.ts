export interface VideoMetric {
  videoId: string;
  date: Date;
  views: number;
  likes: number;
  comments: number;
  watchTimeMinutes: number;
  impressions: number | null;
  ctr: number | null;
}

// 動画単位の内訳に加え、AI分析へ渡すチャンネル全体の日次集計。
export interface ChannelDailyStats {
  date: Date;
  totalViews: number;
  totalWatchTimeMinutes: number;
  subscribersGained: number;
  subscribersLost: number;
  videos: VideoMetric[];
}
