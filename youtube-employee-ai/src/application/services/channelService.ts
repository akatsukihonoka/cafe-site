import { randomUUID } from 'node:crypto';
import type { Channel } from '@/domain/entities/Channel';
import {
  buildYouTubeAuthUrl,
  exchangeCodeForTokens,
} from '@/infrastructure/platforms/youtube/googleOAuthClient';
import {
  getChannelRepository,
  getConnectChannelUsecase,
  getDisconnectChannelUsecase,
  getGoogleOAuthConfig,
  getYouTubeDataProvider,
} from '@/lib/di/container';
import { getCurrentUser } from './currentUser';

export async function listMyChannels(): Promise<Channel[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }
  return getChannelRepository().findByUserId(user.id);
}

export async function disconnectMyChannel(channelId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  await getDisconnectChannelUsecase().execute({ userId: user.id, channelId });
}

export function generateOAuthState(): string {
  return randomUUID();
}

export function buildChannelConnectAuthUrl(state: string): string {
  return buildYouTubeAuthUrl(getGoogleOAuthConfig(), state);
}

export async function completeChannelConnect(code: string): Promise<Channel> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const tokens = await exchangeCodeForTokens(getGoogleOAuthConfig(), code);
  const profile = await getYouTubeDataProvider().getChannelProfile(tokens.accessToken);

  return getConnectChannelUsecase().execute({
    userId: user.id,
    platformType: 'YOUTUBE',
    externalChannelId: profile.externalChannelId,
    displayName: profile.displayName,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenExpiresAt: new Date(Date.now() + tokens.expiresInSeconds * 1000),
  });
}
