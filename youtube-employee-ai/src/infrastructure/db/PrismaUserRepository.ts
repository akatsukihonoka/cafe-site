import type { PrismaClient } from '@/generated/prisma/client';
import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/ports/UserRepository';

interface UserRecord {
  id: string;
  supabaseAuthId: string;
  email: string;
  createdAt: Date;
}

function toDomain(record: UserRecord): User {
  return {
    id: record.id,
    supabaseAuthId: record.supabaseAuthId,
    email: record.email,
    createdAt: record.createdAt,
  };
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySupabaseAuthId(supabaseAuthId: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { supabaseAuthId } });
    return record ? toDomain(record) : null;
  }

  async upsertFromAuth(input: { supabaseAuthId: string; email: string }): Promise<User> {
    const record = await this.prisma.user.upsert({
      where: { supabaseAuthId: input.supabaseAuthId },
      create: { supabaseAuthId: input.supabaseAuthId, email: input.email },
      update: { email: input.email },
    });
    return toDomain(record);
  }
}
