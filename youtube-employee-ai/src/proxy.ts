import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseProxyClient } from '@/infrastructure/auth/supabaseProxyClient';

const PUBLIC_PATHS = ['/login', '/callback'];
// CRON_SECRET等、ユーザーセッション以外の方法で認可するルート。ここではセッションチェックを行わない。
const AUTH_BYPASS_PATHS = ['/api/cron'];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (matchesPrefix(pathname, AUTH_BYPASS_PATHS)) {
    return NextResponse.next();
  }

  const { supabase, getResponse } = createSupabaseProxyClient(request);
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = data?.claims != null;

  if (!isAuthenticated && !matchesPrefix(pathname, PUBLIC_PATHS)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return getResponse();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
