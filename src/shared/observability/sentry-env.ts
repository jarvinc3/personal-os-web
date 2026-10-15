const DEFAULT_TRACES_SAMPLE_RATE = 0.1

export type SentryBaseOptions = {
  dsn: string
  environment: string
  release: string | undefined
  tracesSampleRate: number
}

/**
 * Common `Sentry.init` options for the client, server, and edge runtimes.
 * Returns null without a DSN, so callers skip `init` and the app stays a no-op.
 */
export function sentryBaseOptions(
  tracesSampleRate?: string
): SentryBaseOptions | null {
  const dsn = resolveSentryDsn()
  if (!dsn) {
    return null
  }
  return {
    dsn,
    environment: resolveSentryEnvironment(),
    release: process.env.NEXT_PUBLIC_APP_VERSION,
    tracesSampleRate: resolveSentryTracesSampleRate(tracesSampleRate),
  }
}

function resolveSentryEnvironment(): string {
  return process.env.NEXT_PUBLIC_ENV ?? process.env.NODE_ENV ?? "development"
}

/** Fraction in 0..1; anything else falls back to the default. */
function resolveSentryTracesSampleRate(raw?: string): number {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return DEFAULT_TRACES_SAMPLE_RATE
  }
  return parsed
}

function resolveSentryDsn(): string | undefined {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()
  return dsn || undefined
}
