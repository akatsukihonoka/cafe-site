export function ChannelConnectCard() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
      <h2 className="text-base font-semibold">YouTubeチャンネルを連携</h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        チャンネルを連携すると、毎朝の分析ブリーフィングが生成されるようになります。
      </p>
      {/* Googleへのcookie付きリダイレクトを行うAPIルートなので通常の<a>で遷移させる */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/api/channels/connect"
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        YouTubeチャンネルを連携する
      </a>
    </div>
  );
}
