import { getMyPrimaryChannel } from '@/application/services/channelService';
import { listMyBriefingHistory } from '@/application/services/briefingService';
import { BriefingHistoryItem } from '@/components/briefing/BriefingHistoryItem';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function HistoryPage() {
  const channel = await getMyPrimaryChannel();

  if (!channel) {
    return <EmptyState message="チャンネルが連携されていません。" />;
  }

  const briefings = await listMyBriefingHistory(channel.id);

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-lg font-semibold">過去の分析履歴</h1>
      {briefings.length === 0 ? (
        <EmptyState message="まだ分析履歴がありません。" />
      ) : (
        <ul className="flex flex-col gap-3">
          {briefings.map((briefing) => (
            <BriefingHistoryItem key={briefing.id} briefing={briefing} />
          ))}
        </ul>
      )}
    </div>
  );
}
