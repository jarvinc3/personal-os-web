import { createSupabaseServerClient } from '@/src/shared/config/supabase/server';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? APP_ROUTES.app.home;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}${APP_ROUTES.auth.login}`);
}
