import { prisma } from '@/infrastructure/db/prismaClient';
import { PrismaUserRepository } from '@/infrastructure/db/PrismaUserRepository';
import { PrismaChannelRepository } from '@/infrastructure/db/PrismaChannelRepository';
import { PrismaBriefingRepository } from '@/infrastructure/db/PrismaBriefingRepository';
import { SyncUserFromAuthUsecase } from '@/domain/usecases/SyncUserFromAuth';

// 実DB接続(Prisma)が初めて必要になるのはこれらのfactoryが呼ばれた時点。
// import自体ではDATABASE_URL等の検証は走らない。
export function getUserRepository() {
  return new PrismaUserRepository(prisma);
}

export function getChannelRepository() {
  return new PrismaChannelRepository(prisma);
}

export function getBriefingRepository() {
  return new PrismaBriefingRepository(prisma);
}

export function getSyncUserFromAuthUsecase() {
  return new SyncUserFromAuthUsecase(getUserRepository());
}
