import assert from "node:assert/strict"
import { describe, it } from "node:test"

import Link from "next/link"

import { RelativeParent } from "@/src/shared/lib/fixtures/tsx-loader/relative-parent"

describe("loader de TSX", () => {
  it("resuelve los subpaths de next/*", () => {
    assert.ok(Link)
  })

  it("resuelve relativos sin extensión", () => {
    assert.equal(typeof RelativeParent, "function")
  })

  it("stubea los css que importa un componente", async () => {
    const styles =
      await import("@/src/shared/lib/fixtures/tsx-loader/fixture.css")

    assert.ok(styles)
  })
})
