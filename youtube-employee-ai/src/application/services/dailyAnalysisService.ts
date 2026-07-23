import { yesterdayInJST } from '@/lib/dates';
import { logger } from '@/lib/logger';
import {
  getChannelRepository,
  getGenerateDailyBriefingUsecase,
  getJobRunRepository,
} from '@/lib/di/container';

const JOB_TYPE = 'daily-analysis';

export interface DailyAnalysisSummary {
  succeeded: number;
  failed: number;
  errors: Array<{ channelId: string; message: string }>;
}

/**
 * 毎朝バッチのエントリポイント。isActive=true(=CONNECTED)な全チャンネルを走査し、
 * GenerateDailyBriefingUsecaseを1件ずつ実行する。1チャンネルの失敗が他へ波及しないよう
 * 各チャンネルをtry/catchで分離し、ジョブ全体としては例外を投げず常にサマリを返す。
 */
export async function runDailyAnalysisForAllChannels(): Promise<DailyAnalysisSummary> {
  const channelRepository = getChannelRepository();
  const jobRunRepository = getJobRunRepository();
  const generateDailyBriefing = getGenerateDailyBriefingUsecase();

  const channels = await channelRepository.findActiveChannels();
  const targetDate = yesterdayInJST();
  const summary: DailyAnalysisSummary = { succeeded: 0, failed: 0, errors: [] };

  logger.info('daily-analysis batch started', { jobType: JOB_TYPE, channelCount: channels.length });

  for (const channel of channels) {
    const jobRun = await jobRunRepository.start({ jobType: JOB_TYPE, channelId: channel.id });

    try {
      const briefing = await generateDailyBriefing.execute(channel, targetDate);

      if (briefing.status === 'COMPLETED') {
        summary.succeeded += 1;
        await jobRunRepository.finish(jobRun.id, { status: 'SUCCESS' });
      } else {
        const message = briefing.errorMessage ?? 'unknown error';
        summary.failed += 1;
        summary.errors.push({ channelId: channel.id, message });
        await jobRunRepository.finish(jobRun.id, { status: 'FAILED', errorMessage: message });
        logger.warn('daily-analysis briefing failed', { channelId: channel.id, message });
      }
    } catch (error) {
      // GenerateDailyBriefingUsecase自体はFAILEDを返す設計だが、Repository層など
      // usecaseの外側で予期しない例外が出た場合にも他チャンネルの処理を止めない。
      const message = error instanceof Error ? error.message : String(error);
      summary.failed += 1;
      summary.errors.push({ channelId: channel.id, message });
      await jobRunRepository.finish(jobRun.id, { status: 'FAILED', errorMessage: message });
      logger.error('daily-analysis unexpected error', { channelId: channel.id, message });
    }
  }

  logger.info('daily-analysis batch finished', {
    jobType: JOB_TYPE,
    succeeded: summary.succeeded,
    failed: summary.failed,
  });

  return summary;
}
