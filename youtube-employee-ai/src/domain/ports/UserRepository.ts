import type { User } from '@/domain/entities/User';

export interface UserRepository {
  findBySupabaseAuthId(supabaseAuthId: string): Promise<User | null>;
  upsertFromAuth(input: { supabaseAuthId: string; email: string }): Promise<User>;
}
