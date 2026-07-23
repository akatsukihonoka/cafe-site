import { createBrowserClient } from '@supabase/ssr';
import { getPublicEnv } from '@/lib/env';

// クライアントコンポーネント専用。next/headers等サーバー専用APIに依存しない。
export function createSupabaseBrowserClient() {
  const env = getPublicEnv();
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
