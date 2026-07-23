import type { Briefing } from '@/domain/entities/Briefing';
import type { Channel } from '@/domain/entities/Channel';
import { yesterdayInJST } from '@/lib/dates';
import {
  getBriefingRepository,
  getChannelRepository,
  getGenerateDailyBriefingUsecase,
} from '@/lib/di/container';
import { getCurrentUser } from './currentUser';
import { getMyPrimaryChannel } from './channelService';

const REGENERATE_COOLDOWN_MS = 60 * 60 * 1000;

export interface TodayBriefingResult {
  channel: Channel;
  targetDate: Date;
  briefing: Briefing | null;
}

/** ダッシュボードで表示する「今日のブリーフィング」。対象日はJSTの昨日。 */
export async function getMyTodayBriefing(): Promise<TodayBriefingResult | null> {
  const channel = await getMyPrimaryChannel();
  if (!channel) {
    return null;
  }

  const targetDate = yesterdayInJST();
  const briefing = await getBriefingRepository().findByChannelAndDate(channel.id, targetDate);

  return { channel, targetDate, briefing };
}

export async function listMyBriefingHistory(
  channelId: string,
  cursor?: string,
): Promise<Briefing[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const channel = await getChannelRepository().findById(channelId);
  if (!channel || channel.userId !== user.id) {
    return [];
  }

  return getBriefingRepository().listByChannel(channelId, { cursor });
}

export class BriefingNotAuthorizedError extends Error {}
export class RegenerateRateLimitedError extends Error {}

/** 手動再生成。1チャンネルにつき1時間に1回まで(REGENERATE_COOLDOWN_MS)。 */
export async function regenerateMyBriefing(channelId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new BriefingNotAuthorizedError('Unauthorized');
  }

  const channel = await getChannelRepository().findById(channelId);
  if (!channel || channel.userId !== user.id) {
    throw new BriefingNotAuthorizedError('Channel not found');
  }

  const targetDate = yesterdayInJST();
  const existing = await getBriefingRepository().findByChannelAndDate(channelId, targetDate);

  if (
    existing?.generatedAt &&
    Date.now() - existing.generatedAt.getTime() < REGENERATE_COOLDOWN_MS
  ) {
    throw new RegenerateRateLimitedError('Too many regenerate requests');
  }

  return getGenerateDailyBriefingUsecase().execute(channel, targetDate, { force: true });
}
