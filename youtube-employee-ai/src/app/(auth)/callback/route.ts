import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/infrastructure/auth/supabaseServerClient';
import { getSyncUserFromAuthUsecase } from '@/lib/di/container';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data } = await supabase.auth.getClaims();
      const email = typeof data?.claims?.email === 'string' ? data.claims.email : undefined;
      const supabaseAuthId = data?.claims?.sub;

      if (email && supabaseAuthId) {
        await getSyncUserFromAuthUsecase().execute({ supabaseAuthId, email });
      }

      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
