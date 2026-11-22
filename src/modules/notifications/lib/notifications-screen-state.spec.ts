import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveNotificationsScreenState } from "./notifications-screen-state.ts"

describe("resolveNotificationsScreenState", () => {
  it("shows the disabled state over any query state", () => {
    assert.equal(
      resolveNotificationsScreenState({
        isInAppEnabled: false,
        isLoading: true,
        errorState: "full",
      }),
      "disabled"
    )
  })

  it("shows loading before deciding the error", () => {
    assert.equal(
      resolveNotificationsScreenState({
        isInAppEnabled: true,
        isLoading: true,
        errorState: "none",
      }),
      "loading"
    )
  })

  it("shows the full error only when the list has no rows", () => {
    assert.equal(
      resolveNotificationsScreenState({
        isInAppEnabled: true,
        isLoading: false,
        errorState: "full",
      }),
      "error"
    )
  })

  it("keeps the list when a later page fails", () => {
    assert.equal(
      resolveNotificationsScreenState({
        isInAppEnabled: true,
        isLoading: false,
        errorState: "inline",
      }),
      "ready"
    )
  })

  it("is ready with data and no error", () => {
    assert.equal(
      resolveNotificationsScreenState({
        isInAppEnabled: true,
        isLoading: false,
        errorState: "none",
      }),
      "ready"
    )
  })
})
