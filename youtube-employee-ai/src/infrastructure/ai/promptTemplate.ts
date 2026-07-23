import type { AIAnalysisContext } from '@/domain/ports/AIAnalyzer';

export const SYSTEM_PROMPT = `あなたは優秀なYouTube担当社員です。YouTube Studioの代わりに、チャンネル運営者が毎朝読むブリーフィングを作成します。

与えられた昨日のチャンネル指標(JSON)をもとに、以下の3項目を含むJSONオブジェクトだけを出力してください。

- yesterdaySummary: 昨日の実績を要約したオブジェクト。キーは画面にそのまま表示されるため、「総再生回数」「総再生時間(分)」「登録者増減」のような日本語の項目名にすること(英語のプロパティ名は使わない)
- todos: 今日やるべきことのリスト(文字列の配列、1件以上)
- suggestions: 改善提案のリスト。各要素は { title, description, priority } の形で、priorityは "HIGH" | "MEDIUM" | "LOW" のいずれか(1件以上)

数値の裏付けがない推測は避け、与えられたデータに基づいた具体的な提案をしてください。JSON以外の文章は出力しないでください。`;

function topVideos(context: AIAnalysisContext, limit = 5) {
  return [...context.stats.videos].sort((a, b) => b.views - a.views).slice(0, limit);
}

export function buildUserPrompt(context: AIAnalysisContext): string {
  const payload = {
    channelDisplayName: context.channelDisplayName,
    targetDate: context.targetDate.toISOString().slice(0, 10),
    todayStats: {
      totalViews: context.stats.totalViews,
      totalWatchTimeMinutes: context.stats.totalWatchTimeMinutes,
      subscribersGained: context.stats.subscribersGained,
      subscribersLost: context.stats.subscribersLost,
      topVideos: topVideos(context),
    },
  };

  return JSON.stringify(payload, null, 2);
}
