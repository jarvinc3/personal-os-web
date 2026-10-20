import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { APP_ROUTES } from "@/src/shared/constants/app-routes.ts"

import { shouldHydrateStoredSession } from "./auth-bootstrap-state.ts"

describe("shouldHydrateStoredSession", () => {
  it("skips hydration on the login route", () => {
    assert.equal(shouldHydrateStoredSession(APP_ROUTES.auth.login), false)
  })

  it("hydrates on app routes", () => {
    assert.equal(shouldHydrateStoredSession(APP_ROUTES.app.home), true)
    assert.equal(shouldHydrateStoredSession(APP_ROUTES.app.settings), true)
  })
})
