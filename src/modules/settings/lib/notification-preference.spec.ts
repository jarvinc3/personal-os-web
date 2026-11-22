import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  channelPreferenceChange,
  quietHoursPreferenceChange,
} from "./notification-preference.ts"

describe("channelPreferenceChange", () => {
  it("changes only the chosen channel and keeps its message", () => {
    assert.deepEqual(channelPreferenceChange("push", false), {
      patch: { notifications: { channels: { push: false } } },
      successMessage: "Preferencia de push actualizada.",
    })
    assert.deepEqual(channelPreferenceChange("email", true), {
      patch: { notifications: { channels: { email: true } } },
      successMessage: "Preferencia de email actualizada.",
    })
    assert.deepEqual(channelPreferenceChange("inApp", true), {
      patch: { notifications: { channels: { inApp: true } } },
      successMessage: "Preferencia in-app actualizada.",
    })
  })
})

describe("quietHoursPreferenceChange", () => {
  it("toggles quiet hours without touching the channels", () => {
    assert.deepEqual(quietHoursPreferenceChange(true), {
      patch: { notifications: { quietHours: { enabled: true } } },
      successMessage: "Horario silencioso actualizado.",
    })
  })
})
