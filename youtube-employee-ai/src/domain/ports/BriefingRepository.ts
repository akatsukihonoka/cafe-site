import type { Briefing, BriefingContent, BriefingStatus } from '@/domain/entities/Briefing';

export interface BriefingUpsertInput {
  channelId: string;
  targetDate: Date;
  status: BriefingStatus;
  content?: BriefingContent | null;
  rawMetrics?: Record<string, unknown> | null;
  aiModel?: string | null;
  generatedAt?: Date | null;
  errorMessage?: string | null;
}

export interface BriefingListOptions {
  cursor?: string;
  take?: number;
}

export interface BriefingRepository {
  findByChannelAndDate(channelId: string, targetDate: Date): Promise<Briefing | null>;
  /** (channelId, targetDate) の一意制約を利用した冪等なupsert。 */
  upsert(input: BriefingUpsertInput): Promise<Briefing>;
  listByChannel(channelId: string, options?: BriefingListOptions): Promise<Briefing[]>;
}
