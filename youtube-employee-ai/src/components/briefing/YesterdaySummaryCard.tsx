function formatValue(value: unknown): string {
  if (typeof value === 'number') return value.toLocaleString('ja-JP');
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

export function YesterdaySummaryCard({ summary }: { summary: Record<string, unknown> }) {
  const entries = Object.entries(summary);

  return (
    <section className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
      <h2 className="mb-3 text-base font-semibold">昨日どうだったか</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">サマリーがありません。</p>
      ) : (
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {entries.map(([key, value]) => (
            <div key={key}>
              <dt className="text-xs text-neutral-500 dark:text-neutral-400">{key}</dt>
              <dd className="text-lg font-medium">{formatValue(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
