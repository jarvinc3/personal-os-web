import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  cycleOffsetForFrontKey,
  readFrontItemKey,
  stackItemKey,
  WALLET_FRONT_ITEM_STORAGE_KEY,
  writeFrontItemKey,
} from "./wallet-front-persistence.ts";

const items = [
  { kind: "institution" as const, id: "bank-a" },
  { kind: "institution" as const, id: "bank-b" },
  { kind: "cash" as const, id: "cash-1" },
]

describe("wallet-front-persistence", () => {
  it("builds a stable kind:id key", () => {
    assert.equal(stackItemKey(items[0]!), "institution:bank-a")
    assert.equal(stackItemKey(items[2]!), "cash:cash-1")
  })

  it("resolves offset for an existing front key", () => {
    assert.equal(cycleOffsetForFrontKey(items, "institution:bank-b"), 1)
    assert.equal(cycleOffsetForFrontKey(items, "cash:cash-1"), 2)
  })

  it("falls back to 0 when the key is missing or null", () => {
    assert.equal(cycleOffsetForFrontKey(items, "institution:gone"), 0)
    assert.equal(cycleOffsetForFrontKey(items, null), 0)
    assert.equal(cycleOffsetForFrontKey([], "institution:bank-a"), 0)
  })

  it("reads and writes the front key through storage", () => {
    const store = new Map<string, string>()
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
    }

    assert.equal(readFrontItemKey(storage), null)
    writeFrontItemKey("cash:cash-1", storage)
    assert.equal(store.get(WALLET_FRONT_ITEM_STORAGE_KEY), "cash:cash-1")
    assert.equal(readFrontItemKey(storage), "cash:cash-1")
  })
})
