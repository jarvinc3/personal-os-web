import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { registerWebPushTokenWithApi } from "./register-web-push-token.ts"

describe("registerWebPushTokenWithApi", () => {
  it("no registra nada donde el navegador no ofrece push", async () => {
    assert.deepEqual(await registerWebPushTokenWithApi(), {
      ok: false,
      reason: "unsupported",
    })
  })
})
