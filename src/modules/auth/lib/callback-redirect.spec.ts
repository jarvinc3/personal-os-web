import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveCallbackRedirectTarget } from "./callback-redirect.ts"

const ORIGIN = "https://app.personal-os.test"

function resolve(next: string | null): string {
  return resolveCallbackRedirectTarget({ next, origin: ORIGIN })
}

describe("resolveCallbackRedirectTarget", () => {
  it("keeps a local path", () => {
    assert.equal(resolve("/finance/transactions"), "/finance/transactions")
  })

  it("keeps the query and the hash of a local path", () => {
    assert.equal(
      resolve("/finance/transactions?tab=week#hoy"),
      "/finance/transactions?tab=week#hoy"
    )
  })

  it("falls back to home without a target", () => {
    assert.equal(resolve(null), "/home")
    assert.equal(resolve(""), "/home")
  })

  it("rejects an absolute URL from another origin", () => {
    assert.equal(resolve("https://otro-dominio.test/login"), "/home")
    assert.equal(resolve("http://otro-dominio.test"), "/home")
  })

  it("rejects a protocol-relative target", () => {
    assert.equal(resolve("//otro-dominio.test"), "/home")
  })

  it("rejects userinfo that moves the host", () => {
    assert.equal(resolve("@otro-dominio.test"), "/home")
    assert.equal(resolve("/@otro-dominio.test"), "/@otro-dominio.test")
  })

  it("rejects a backslash path that the browser reads as protocol-relative", () => {
    assert.equal(resolve("/\\otro-dominio.test"), "/home")
    assert.equal(resolve("\\otro-dominio.test"), "/home")
  })

  it("rejects a path that normalizes to a protocol-relative one", () => {
    assert.equal(resolve("/..//otro-dominio.test"), "/home")
  })

  it("rejects a non-http scheme", () => {
    assert.equal(resolve("javascript:alert(1)"), "/home")
    assert.equal(resolve("data:text/html,<h1>x</h1>"), "/home")
  })
})
