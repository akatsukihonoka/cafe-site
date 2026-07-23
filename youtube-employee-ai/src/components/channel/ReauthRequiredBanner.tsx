export function ReauthRequiredBanner() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
      <span>YouTubeとの連携が切れています。再連携してください。</span>
      {/* Googleへのcookie付きリダイレクトを行うAPIルートなので通常の<a>で遷移させる */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/api/channels/connect" className="font-medium underline">
        再連携する
      </a>
    </div>
  );
}
