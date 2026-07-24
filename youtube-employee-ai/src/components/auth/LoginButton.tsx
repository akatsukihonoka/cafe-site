'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/infrastructure/auth/supabaseBrowserClient';

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={isLoading}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
    >
      {isLoading ? 'リダイレクト中…' : 'Googleでログイン'}
    </button>
  );
}
