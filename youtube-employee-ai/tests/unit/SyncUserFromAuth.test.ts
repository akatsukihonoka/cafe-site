import { describe, expect, it, vi } from 'vitest';
import { SyncUserFromAuthUsecase } from '@/domain/usecases/SyncUserFromAuth';
import type { UserRepository } from '@/domain/ports/UserRepository';

describe('SyncUserFromAuthUsecase', () => {
  it('UserRepository.upsertFromAuthへ委譲し、結果を返す', async () => {
    const upsertFromAuth = vi.fn().mockResolvedValue({
      id: 'user_1',
      supabaseAuthId: 'auth_1',
      email: 'a@example.com',
      createdAt: new Date('2026-07-01T00:00:00Z'),
    });
    const userRepository: UserRepository = {
      findBySupabaseAuthId: vi.fn(),
      upsertFromAuth,
    };

    const usecase = new SyncUserFromAuthUsecase(userRepository);
    const result = await usecase.execute({ supabaseAuthId: 'auth_1', email: 'a@example.com' });

    expect(upsertFromAuth).toHaveBeenCalledWith({
      supabaseAuthId: 'auth_1',
      email: 'a@example.com',
    });
    expect(result.email).toBe('a@example.com');
  });
});
