import { createSupabaseServerClient } from "@/src/config/supabase/server"
import { resolveCallbackRedirectTarget } from "@/src/modules/auth/lib/callback-redirect"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next")

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const target = resolveCallbackRedirectTarget({ next, origin })
      return NextResponse.redirect(new URL(target, origin))
    }
  }

  return NextResponse.redirect(new URL(APP_ROUTES.auth.login, origin))
}
