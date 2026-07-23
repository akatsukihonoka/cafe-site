'use client';

import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/infrastructure/auth/supabaseBrowserClient';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
    >
      ログアウト
    </button>
  );
}
