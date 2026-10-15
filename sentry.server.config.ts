import * as Sentry from "@sentry/nextjs"
import { sentryBaseOptions } from "./src/shared/observability/sentry-env"
import { scrubSentryEvent } from "./src/shared/observability/sentry-scrubber"

const options = sentryBaseOptions(process.env.SENTRY_TRACES_SAMPLE_RATE)

// Without a DSN the SDK is never initialized, so local runs and CI stay no-op.
if (options) {
  Sentry.init({
    ...options,
    beforeSend: (event) => scrubSentryEvent(event),
    beforeSendTransaction: (event) => scrubSentryEvent(event),
  })
}
