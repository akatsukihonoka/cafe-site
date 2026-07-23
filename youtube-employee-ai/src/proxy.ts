import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseProxyClient } from '@/infrastructure/auth/supabaseProxyClient';

const PUBLIC_PATHS = ['/login', '/callback'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function proxy(request: NextRequest) {
  const { supabase, getResponse } = createSupabaseProxyClient(request);

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = data?.claims != null;

  if (!isAuthenticated && !isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return getResponse();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
