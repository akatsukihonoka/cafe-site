import type { ChannelDailyStats } from '@/domain/entities/VideoMetric';
import type { BriefingContent } from '@/domain/entities/Briefing';

export interface AIAnalysisContext {
  channelDisplayName: string;
  targetDate: Date;
  stats: ChannelDailyStats;
}

/**
 * AI分析の抽象ポート。OpenAI以外のモデルや、将来のTikTok等
 * 他プラットフォームでも同じインターフェースを再利用する。
 */
export interface AIAnalyzer {
  generateBriefing(context: AIAnalysisContext): Promise<BriefingContent>;
}
