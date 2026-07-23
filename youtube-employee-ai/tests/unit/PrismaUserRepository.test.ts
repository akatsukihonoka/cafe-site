import { describe, expect, it, vi } from 'vitest';
import { PrismaUserRepository } from '@/infrastructure/db/PrismaUserRepository';
import type { PrismaClient } from '@/generated/prisma/client';

function createMockPrisma() {
  return {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  } as unknown as PrismaClient;
}

describe('PrismaUserRepository', () => {
  it('findBySupabaseAuthId: レコードが存在すればドメイン型へ変換して返す', async () => {
    const prisma = createMockPrisma();
    const record = {
      id: 'user_1',
      supabaseAuthId: 'auth_1',
      email: 'a@example.com',
      createdAt: new Date('2026-07-01T00:00:00Z'),
    };
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(record);

    const repo = new PrismaUserRepository(prisma);
    const result = await repo.findBySupabaseAuthId('auth_1');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { supabaseAuthId: 'auth_1' },
    });
    expect(result).toEqual(record);
  });

  it('findBySupabaseAuthId: レコードが存在しなければnullを返す', async () => {
    const prisma = createMockPrisma();
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const repo = new PrismaUserRepository(prisma);
    const result = await repo.findBySupabaseAuthId('unknown');

    expect(result).toBeNull();
  });

  it('upsertFromAuth: supabaseAuthIdをキーにupsertする', async () => {
    const prisma = createMockPrisma();
    const record = {
      id: 'user_1',
      supabaseAuthId: 'auth_1',
      email: 'new@example.com',
      createdAt: new Date('2026-07-01T00:00:00Z'),
    };
    (prisma.user.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(record);

    const repo = new PrismaUserRepository(prisma);
    const result = await repo.upsertFromAuth({
      supabaseAuthId: 'auth_1',
      email: 'new@example.com',
    });

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { supabaseAuthId: 'auth_1' },
      create: { supabaseAuthId: 'auth_1', email: 'new@example.com' },
      update: { email: 'new@example.com' },
    });
    expect(result.email).toBe('new@example.com');
  });
});
