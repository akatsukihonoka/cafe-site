import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { completeChannelConnect } from '@/application/services/channelService';

const STATE_COOKIE_NAME = 'yt_oauth_state';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE_NAME)?.value;
  const isValidState = Boolean(code && state && expectedState && state === expectedState);

  if (!isValidState) {
    return NextResponse.redirect(`${origin}/settings?error=invalid_oauth_state`);
  }

  try {
    await completeChannelConnect(code as string);
    const response = NextResponse.redirect(`${origin}/settings`);
    response.cookies.delete(STATE_COOKIE_NAME);
    return response;
  } catch {
    const response = NextResponse.redirect(`${origin}/settings?error=connect_failed`);
    response.cookies.delete(STATE_COOKIE_NAME);
    return response;
  }
}
