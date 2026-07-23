export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      <p className="font-medium">最新の分析に失敗しました</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}
