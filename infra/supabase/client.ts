import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * サーバー側専用のSupabaseクライアント(service role key使用)。
 * モジュール読み込み時ではなく、実際に呼ばれた時点で初めて環境変数を読む
 * (ビルド時に環境変数が無くても import だけでは失敗しないようにするため)。
 */
export function getSupabaseServiceClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase env vars are not set (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  cachedClient = createClient(url, key, { auth: { persistSession: false } });
  return cachedClient;
}
