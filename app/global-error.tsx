"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

// The root layout is replaced by this file, so its global styles are not
// loaded here; the markup uses inline styles to stay self-contained.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 1.5rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          color: "#111827",
        }}
      >
        <main style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h1 style={{ fontSize: "1.875rem", margin: 0 }}>Algo salió mal</h1>
          <p style={{ maxWidth: "28rem", margin: 0, color: "#4b5563" }}>
            No pudimos cargar la aplicación. Vuelve a intentarlo; si el problema
            sigue, escríbenos a soporte.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              alignSelf: "center",
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              border: "2px solid #111827",
              borderRadius: "0.5rem",
              background: "#111827",
              color: "#ffffff",
              boxShadow: "4px 4px 0 0 #111827",
            }}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  )
}
