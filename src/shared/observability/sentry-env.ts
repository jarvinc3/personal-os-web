const DEFAULT_TRACES_SAMPLE_RATE = 0.1

/** Shared Sentry env resolution for the client, server, and edge runtimes. */
export function resolveSentryEnvironment(): string {
  return process.env.NEXT_PUBLIC_ENV ?? process.env.NODE_ENV ?? "development"
}

/** Positive fraction in 0..1; anything else falls back to the default. */
export function resolveSentryTracesSampleRate(raw?: string): number {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return DEFAULT_TRACES_SAMPLE_RATE
  }
  return parsed
}

export function resolveSentryDsn(): string | undefined {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()
  return dsn || undefined
}
