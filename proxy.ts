import { updateSession } from "@/src/config/supabase/proxy"
import { resolveRouteRedirect } from "@/src/shared/lib/proxy-routes"
import {
  CONTENT_SECURITY_POLICY_HEADER,
  CSP_NONCE_HEADER,
  contentSecurityPolicy,
  createNonce,
} from "@/src/config/security-headers.mjs"
import { type NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  const nonce = createNonce()
  const policy = contentSecurityPolicy({
    nonce,
    isDevelopment: process.env.NODE_ENV !== "production",
    isVercelPreview: process.env.VERCEL_ENV === "preview",
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  })

  // Next.js lee el nonce de esta cabecera de la petición y lo pone en los
  // scripts que renderiza. La respuesta lleva la política que aplica el
  // navegador; el resto de cabeceras van en `next.config.mjs`.
  request.headers.set(CSP_NONCE_HEADER, nonce)
  request.headers.set(CONTENT_SECURITY_POLICY_HEADER, policy)

  const { pathname } = request.nextUrl
  const { response, claims } = await updateSession(request)
  response.headers.set(CONTENT_SECURITY_POLICY_HEADER, policy)

  const targetPath = resolveRouteRedirect(pathname, Boolean(claims))
  if (!targetPath) {
    return response
  }

  const url = request.nextUrl.clone()
  url.pathname = targetPath

  const redirect = NextResponse.redirect(url)
  redirect.headers.set(CONTENT_SECURITY_POLICY_HEADER, policy)
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
