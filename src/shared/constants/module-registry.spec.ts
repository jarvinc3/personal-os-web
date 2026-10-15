import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { MODULE_REGISTRY } from "./module-registry.ts"

describe("MODULE_REGISTRY", () => {
  it("no longer lists subscriptions as its own module", () => {
    assert.equal("subscriptions" in MODULE_REGISTRY, false)
  })
})
