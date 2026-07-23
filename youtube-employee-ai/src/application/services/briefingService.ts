import { yesterdayInJST } from '@/lib/dates';
import {
  getBriefingRepository,
  getChannelRepository,
  getGenerateDailyBriefingUsecase,
} from '@/lib/di/container';
import { getCurrentUser } from './currentUser';

const REGENERATE_COOLDOWN_MS = 60 * 60 * 1000;

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
