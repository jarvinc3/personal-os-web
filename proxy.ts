import { updateSession } from '@/src/shared/config/supabase/proxy';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { type NextRequest, NextResponse } from 'next/server';

function isProtectedAppPath(pathname: string): boolean {
  return pathname === APP_ROUTES.app.home || pathname.startsWith(APP_ROUTES.app.settings);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  if (pathname === APP_ROUTES.auth.login && user) {
    const url = request.nextUrl.clone();
    url.pathname = APP_ROUTES.app.home;
    return NextResponse.redirect(url);
  }

  if (isProtectedAppPath(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = APP_ROUTES.auth.login;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
