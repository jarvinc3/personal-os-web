import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { isProtectedAppPath, resolveRouteRedirect } from "./proxy-routes.ts"

describe("resolveRouteRedirect", () => {
  it("sends the root to login without a session", () => {
    assert.equal(resolveRouteRedirect("/", false), "/login")
  })

  it("sends the root to home with a session", () => {
    assert.equal(resolveRouteRedirect("/", true), "/home")
  })

  it("bounces the login screen to home when a session exists", () => {
    assert.equal(resolveRouteRedirect("/login", true), "/home")
    assert.equal(resolveRouteRedirect("/login", false), null)
  })

  it("sends protected routes to login without a session", () => {
    assert.equal(resolveRouteRedirect("/home", false), "/login")
    assert.equal(resolveRouteRedirect("/finance/transactions", false), "/login")
    assert.equal(resolveRouteRedirect("/settings/profile", false), "/login")
    assert.equal(resolveRouteRedirect("/agenda", false), "/login")
  })

  it("leaves protected routes and public routes untouched", () => {
    assert.equal(resolveRouteRedirect("/home", true), null)
    assert.equal(resolveRouteRedirect("/verify-email", false), null)
    assert.equal(resolveRouteRedirect("/verify-email", true), null)
    assert.equal(resolveRouteRedirect("/unknown", false), null)
  })
})

describe("isProtectedAppPath", () => {
  it("covers the app sections and their subpaths", () => {
    assert.equal(isProtectedAppPath("/home"), true)
    assert.equal(isProtectedAppPath("/settings"), true)
    assert.equal(isProtectedAppPath("/notifications"), true)
    assert.equal(isProtectedAppPath("/keep-awake"), true)
    assert.equal(isProtectedAppPath("/finance"), true)
    assert.equal(isProtectedAppPath("/finance/cash/abc"), true)
    assert.equal(isProtectedAppPath("/agenda"), true)
    assert.equal(isProtectedAppPath("/projects"), true)
    assert.equal(isProtectedAppPath("/health"), true)
    assert.equal(isProtectedAppPath("/dev"), true)
    assert.equal(isProtectedAppPath("/dev/cards"), true)
    assert.equal(isProtectedAppPath("/dev/cards/cuenta"), true)
  })

  it("ignores the auth routes", () => {
    assert.equal(isProtectedAppPath("/login"), false)
    assert.equal(isProtectedAppPath("/verify-email"), false)
  })
})
