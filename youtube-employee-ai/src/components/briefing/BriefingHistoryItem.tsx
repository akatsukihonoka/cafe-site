import type { Briefing, BriefingStatus } from '@/domain/entities/Briefing';

const STATUS_LABEL: Record<BriefingStatus, string> = {
  PENDING: '生成待ち',
  COMPLETED: '完了',
  FAILED: '失敗',
};

export function BriefingHistoryItem({ briefing }: { briefing: Briefing }) {
  const dateLabel = briefing.targetDate.toISOString().slice(0, 10);

  return (
    <li className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <span className="font-medium">{dateLabel}</span>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {STATUS_LABEL[briefing.status]}
        </span>
      </div>
      {briefing.status === 'COMPLETED' && briefing.content && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          TODO: {briefing.content.todos.length}件 / 改善案: {briefing.content.suggestions.length}件
        </p>
      )}
      {briefing.status === 'FAILED' && briefing.errorMessage && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{briefing.errorMessage}</p>
      )}
    </li>
  );
}
