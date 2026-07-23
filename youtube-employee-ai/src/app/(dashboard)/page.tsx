import { getMyTodayBriefing } from '@/application/services/briefingService';
import { ChannelConnectCard } from '@/components/channel/ChannelConnectCard';
import { ReauthRequiredBanner } from '@/components/channel/ReauthRequiredBanner';
import { BriefingHeader } from '@/components/briefing/BriefingHeader';
import { YesterdaySummaryCard } from '@/components/briefing/YesterdaySummaryCard';
import { TodayTodoList } from '@/components/briefing/TodayTodoList';
import { ImprovementSuggestionList } from '@/components/briefing/ImprovementSuggestionList';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

export default async function DashboardPage() {
  const result = await getMyTodayBriefing();

  if (!result) {
    return <ChannelConnectCard />;
  }

  const { channel, targetDate, briefing } = result;

  return (
    <div className="flex flex-col gap-6">
      {channel.status === 'REAUTH_REQUIRED' && <ReauthRequiredBanner />}

      <BriefingHeader channel={channel} targetDate={targetDate} />

      {!briefing && (
        <EmptyState message="本日分の分析はまだ生成されていません。毎朝のバッチで自動生成されます。" />
      )}

      {briefing?.status === 'FAILED' && (
        <ErrorState message={briefing.errorMessage ?? '不明なエラーです'} />
      )}

      {briefing?.status === 'COMPLETED' && briefing.content && (
        <>
          <YesterdaySummaryCard summary={briefing.content.yesterdaySummary} />
          <TodayTodoList todos={briefing.content.todos} />
          <ImprovementSuggestionList suggestions={briefing.content.suggestions} />
        </>
      )}
    </div>
  );
}
