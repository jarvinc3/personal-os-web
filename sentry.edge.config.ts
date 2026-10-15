import * as Sentry from "@sentry/nextjs"
import {
  resolveSentryDsn,
  resolveSentryEnvironment,
  resolveSentryTracesSampleRate,
} from "./src/shared/observability/sentry-env"
import { scrubSentryEvent } from "./src/shared/observability/sentry-scrubber"

const dsn = resolveSentryDsn()

if (dsn) {
  Sentry.init({
    dsn,
    environment: resolveSentryEnvironment(),
    release: process.env.NEXT_PUBLIC_APP_VERSION,
    tracesSampleRate: resolveSentryTracesSampleRate(
      process.env.SENTRY_TRACES_SAMPLE_RATE
    ),
    beforeSend: (event) => scrubSentryEvent(event),
    beforeSendTransaction: (event) => scrubSentryEvent(event),
  })
}
