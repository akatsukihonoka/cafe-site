import { listMyChannels } from '@/application/services/channelService';
import { ChannelConnectCard } from '@/components/channel/ChannelConnectCard';
import { DisconnectChannelButton } from '@/components/channel/DisconnectChannelButton';
import type { ChannelStatus } from '@/domain/entities/Channel';

const STATUS_LABEL: Record<ChannelStatus, string> = {
  CONNECTED: '連携済み',
  REAUTH_REQUIRED: '再連携が必要です',
  DISCONNECTED: '未連携',
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const channels = await listMyChannels();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-lg font-semibold">設定</h1>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          チャンネル連携に失敗しました。もう一度お試しください。
        </p>
      )}

      {channels.length === 0 ? (
        <ChannelConnectCard />
      ) : (
        <ul className="flex flex-col gap-3">
          {channels.map((channel) => (
            <li
              key={channel.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <div>
                <p className="font-medium">{channel.displayName}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {STATUS_LABEL[channel.status]}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {channel.status === 'REAUTH_REQUIRED' && (
                  // eslint-disable-next-line @next/next/no-html-link-for-pages
                  <a
                    href="/api/channels/connect"
                    className="text-sm font-medium text-neutral-900 underline dark:text-neutral-100"
                  >
                    再連携する
                  </a>
                )}
                <DisconnectChannelButton channelId={channel.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
