import { updateSession } from "@/src/config/supabase/proxy"
import { resolveRouteRedirect } from "@/src/shared/lib/proxy-routes"
import { type NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { response, user } = await updateSession(request)

  const targetPath = resolveRouteRedirect(pathname, Boolean(user))
  if (!targetPath) {
    return response
  }

  const url = request.nextUrl.clone()
  url.pathname = targetPath

  const redirect = NextResponse.redirect(url)
  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie)
  }
  return redirect
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
