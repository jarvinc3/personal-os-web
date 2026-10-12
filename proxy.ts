import { updateSession } from "@/src/config/supabase/proxy"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { type NextRequest, NextResponse } from "next/server"

function isProtectedAppPath(pathname: string): boolean {
  return (
    pathname === APP_ROUTES.app.home ||
    pathname.startsWith(APP_ROUTES.app.settings) ||
    pathname.startsWith(APP_ROUTES.app.chat) ||
    pathname.startsWith(APP_ROUTES.app.notifications) ||
    pathname.startsWith(APP_ROUTES.app.keepAwake) ||
    pathname.startsWith(APP_ROUTES.app.finance)
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { response, user } = await updateSession(request)

  if (pathname === APP_ROUTES.root) {
    const url = request.nextUrl.clone()
    url.pathname = user ? APP_ROUTES.app.home : APP_ROUTES.marketing.landing
    return NextResponse.redirect(url)
  }

  if (pathname === APP_ROUTES.auth.login && user) {
    const url = request.nextUrl.clone()
    url.pathname = APP_ROUTES.app.home
    return NextResponse.redirect(url)
  }

  if (isProtectedAppPath(pathname) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = APP_ROUTES.auth.login
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
