'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DisconnectChannelButton({ channelId }: { channelId: string }) {
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    await fetch(`/api/channels/${channelId}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleDisconnect}
      disabled={isDisconnecting}
      className="text-sm text-red-600 transition-colors hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
    >
      {isDisconnecting ? '解除中…' : '連携を解除'}
    </button>
  );
}
