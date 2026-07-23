import type { Channel } from '@/domain/entities/Channel';
import type { Briefing } from '@/domain/entities/Briefing';
import type { AIAnalyzer } from '@/domain/ports/AIAnalyzer';
import type { BriefingRepository } from '@/domain/ports/BriefingRepository';
import type { FetchChannelMetricsUsecase } from './FetchChannelMetrics';

export class GenerateDailyBriefingUsecase {
  constructor(
    private readonly fetchChannelMetrics: FetchChannelMetricsUsecase,
    private readonly aiAnalyzer: AIAnalyzer,
    private readonly briefingRepository: BriefingRepository,
    private readonly aiModel: string,
  ) {}

  /** (channelId, targetDate)で冪等。既にCOMPLETEDなブリーフィングがあれば再生成しない。 */
  async execute(channel: Channel, targetDate: Date): Promise<Briefing> {
    const existing = await this.briefingRepository.findByChannelAndDate(channel.id, targetDate);
    if (existing?.status === 'COMPLETED') {
      return existing;
    }

    try {
      const stats = await this.fetchChannelMetrics.execute(channel, targetDate);
      const content = await this.aiAnalyzer.generateBriefing({
        channelDisplayName: channel.displayName,
        targetDate,
        stats,
      });

      return await this.briefingRepository.upsert({
        channelId: channel.id,
        targetDate,
        status: 'COMPLETED',
        content,
        // DateはJSON非対応のためISO文字列へシリアライズしてから保存する。
        rawMetrics: JSON.parse(JSON.stringify(stats)) as Record<string, unknown>,
        aiModel: this.aiModel,
        generatedAt: new Date(),
      });
    } catch (error) {
      return this.briefingRepository.upsert({
        channelId: channel.id,
        targetDate,
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
