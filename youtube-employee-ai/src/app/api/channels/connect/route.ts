import { NextResponse } from 'next/server';
import {
  buildChannelConnectAuthUrl,
  generateOAuthState,
} from '@/application/services/channelService';

const STATE_COOKIE_NAME = 'yt_oauth_state';

export async function GET() {
  const state = generateOAuthState();
  const authUrl = buildChannelConnectAuthUrl(state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
