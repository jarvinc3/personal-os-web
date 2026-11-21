import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveChatLinkTarget } from "./chat-link-target.ts"

describe("resolveChatLinkTarget", () => {
  it("keeps a route of the app", () => {
    assert.deepEqual(resolveChatLinkTarget("/finance/transactions"), {
      kind: "app",
      href: "/finance/transactions",
    })
  })

  it("rejects a route that leaves the app", () => {
    assert.deepEqual(resolveChatLinkTarget("//otro-dominio.test"), {
      kind: "text",
    })
    assert.deepEqual(resolveChatLinkTarget("/\\otro-dominio.test"), {
      kind: "text",
    })
  })

  it("accepts http and https", () => {
    assert.deepEqual(resolveChatLinkTarget("https://ejemplo.test/a"), {
      kind: "external",
      href: "https://ejemplo.test/a",
    })
    assert.deepEqual(resolveChatLinkTarget("HTTP://ejemplo.test"), {
      kind: "external",
      href: "HTTP://ejemplo.test",
    })
  })

  it("accepts mailto", () => {
    assert.deepEqual(resolveChatLinkTarget("mailto:alguien@ejemplo.test"), {
      kind: "mail",
      href: "mailto:alguien@ejemplo.test",
    })
  })

  it("rejects a script scheme", () => {
    assert.deepEqual(resolveChatLinkTarget("javascript:alert(1)"), {
      kind: "text",
    })
  })

  it("rejects a data url", () => {
    assert.deepEqual(resolveChatLinkTarget("data:text/html,<h1>x</h1>"), {
      kind: "text",
    })
  })

  it("rejects another protocol and plain text", () => {
    assert.deepEqual(resolveChatLinkTarget("ftp://ejemplo.test"), {
      kind: "text",
    })
    assert.deepEqual(resolveChatLinkTarget("sin enlace"), { kind: "text" })
  })
})
