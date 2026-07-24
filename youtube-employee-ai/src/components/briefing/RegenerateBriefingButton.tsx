'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function RegenerateBriefingButton({ channelId }: { channelId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    const response = await fetch(`/api/briefings/${channelId}/regenerate`, { method: 'POST' });
    setIsLoading(false);

    if (!response.ok) {
      setError(response.status === 429 ? '再生成は1時間に1回までです' : '再生成に失敗しました');
      return;
    }

    router.refresh();
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        {isLoading ? '再生成中…' : '再生成'}
      </button>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
