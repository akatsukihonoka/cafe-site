import { prisma } from '@/infrastructure/db/prismaClient';
import { PrismaUserRepository } from '@/infrastructure/db/PrismaUserRepository';
import { PrismaChannelRepository } from '@/infrastructure/db/PrismaChannelRepository';
import { PrismaBriefingRepository } from '@/infrastructure/db/PrismaBriefingRepository';
import { SyncUserFromAuthUsecase } from '@/domain/usecases/SyncUserFromAuth';
import { ConnectChannelUsecase } from '@/domain/usecases/ConnectChannel';
import { DisconnectChannelUsecase } from '@/domain/usecases/DisconnectChannel';
import { YouTubeDataProvider } from '@/infrastructure/platforms/youtube/YouTubeDataProvider';
import { TokenRefresher } from '@/infrastructure/platforms/youtube/TokenRefresher';
import { getServerEnv } from '@/lib/env';

// 実DB接続(Prisma)や外部APIクライアントが初めて必要になるのはこれらのfactoryが呼ばれた時点。
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

export function getConnectChannelUsecase() {
  return new ConnectChannelUsecase(getChannelRepository(), getServerEnv().TOKEN_ENCRYPTION_KEY);
}

export function getDisconnectChannelUsecase() {
  return new DisconnectChannelUsecase(getChannelRepository());
}

export function getYouTubeDataProvider() {
  return new YouTubeDataProvider();
}

export function getGoogleOAuthConfig() {
  const env = getServerEnv();
  return {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.YOUTUBE_OAUTH_REDIRECT_URI,
  };
}

export function getTokenRefresher() {
  const env = getServerEnv();
  return new TokenRefresher(
    getChannelRepository(),
    { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    env.TOKEN_ENCRYPTION_KEY,
  );
}
