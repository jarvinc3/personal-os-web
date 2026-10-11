import { createBrowserClient } from "@supabase/ssr"

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error(
      "Faltan variables de entorno de Supabase. Usa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    )
  }

  return createBrowserClient(url, key)
}

let browserClient: ReturnType<typeof createSupabaseBrowserClient> | undefined

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error(
      "getSupabaseBrowserClient() solo está disponible en el cliente."
    )
  }
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient()
  }
  return browserClient
}
