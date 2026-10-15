import * as Sentry from "@sentry/nextjs"
import { sentryBaseOptions } from "./src/shared/observability/sentry-env"
import { scrubSentryEvent } from "./src/shared/observability/sentry-scrubber"

// The DSN is public, so the browser reads it at build time. No Session Replay.
const options = sentryBaseOptions(
  process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
)

if (options) {
  Sentry.init({
    ...options,
    beforeSend: (event) => scrubSentryEvent(event),
    beforeSendTransaction: (event) => scrubSentryEvent(event),
  })
}
