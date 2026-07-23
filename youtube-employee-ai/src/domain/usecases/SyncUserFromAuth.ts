import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/ports/UserRepository';

export interface SyncUserFromAuthInput {
  supabaseAuthId: string;
  email: string;
}

export class SyncUserFromAuthUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: SyncUserFromAuthInput): Promise<User> {
    return this.userRepository.upsertFromAuth(input);
  }
}
