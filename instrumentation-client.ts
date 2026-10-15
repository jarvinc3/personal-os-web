import * as Sentry from "@sentry/nextjs"
import {
  resolveSentryDsn,
  resolveSentryEnvironment,
  resolveSentryTracesSampleRate,
} from "./src/shared/observability/sentry-env"
import { scrubSentryEvent } from "./src/shared/observability/sentry-scrubber"

const dsn = resolveSentryDsn()

// The DSN is public, so the browser reads it at build time. No Session Replay.
if (dsn) {
  Sentry.init({
    dsn,
    environment: resolveSentryEnvironment(),
    release: process.env.NEXT_PUBLIC_APP_VERSION,
    tracesSampleRate: resolveSentryTracesSampleRate(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
    ),
    beforeSend: (event) => scrubSentryEvent(event),
    beforeSendTransaction: (event) => scrubSentryEvent(event),
  })
}
