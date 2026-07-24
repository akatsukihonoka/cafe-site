import type { Channel } from '@/domain/entities/Channel';
import { RegenerateBriefingButton } from './RegenerateBriefingButton';

export function BriefingHeader({ channel, targetDate }: { channel: Channel; targetDate: Date }) {
  const dateLabel = targetDate.toISOString().slice(0, 10);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold">{channel.displayName}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{dateLabel}の分析</p>
      </div>
      <RegenerateBriefingButton channelId={channel.id} />
    </div>
  );
}
