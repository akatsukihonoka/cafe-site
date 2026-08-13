import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * ブラウザ側専用のSupabaseクライアント(anon key使用、Realtime購読用)。
 * infra/supabase/client.ts (service role, サーバー専用)とは別物。
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase env vars are not set (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }

  cachedClient = createClient(url, key);
  return cachedClient;
}
