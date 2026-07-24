import type { BriefingSuggestion, SuggestionPriority } from '@/domain/entities/Briefing';

const PRIORITY_LABEL: Record<SuggestionPriority, string> = {
  HIGH: '優先度: 高',
  MEDIUM: '優先度: 中',
  LOW: '優先度: 低',
};

const PRIORITY_STYLE: Record<SuggestionPriority, string> = {
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  LOW: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
};

const PRIORITY_ORDER: Record<SuggestionPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function ImprovementSuggestionList({ suggestions }: { suggestions: BriefingSuggestion[] }) {
  const sorted = [...suggestions].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );

  return (
    <section className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
      <h2 className="mb-3 text-base font-semibold">改善案</h2>
      {sorted.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">改善案がありません。</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((suggestion, index) => (
            <li key={index} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${PRIORITY_STYLE[suggestion.priority]}`}
                >
                  {PRIORITY_LABEL[suggestion.priority]}
                </span>
                <span className="text-sm font-medium">{suggestion.title}</span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {suggestion.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
