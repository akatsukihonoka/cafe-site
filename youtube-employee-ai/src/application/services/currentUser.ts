import { createSupabaseServerClient } from '@/infrastructure/auth/supabaseServerClient';
import { getUserRepository } from '@/lib/di/container';
import type { User } from '@/domain/entities/User';

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const supabaseAuthId = data?.claims?.sub;

  if (!supabaseAuthId) {
    return null;
  }

  return getUserRepository().findBySupabaseAuthId(supabaseAuthId);
}
