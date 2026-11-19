import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveSheetTitleFocus } from "./sheet-focus.ts"

describe("resolveSheetTitleFocus", () => {
  it("sin opt-in deja el foco de base-ui en el popup y el título no es enfocable", () => {
    const focus = resolveSheetTitleFocus(false)

    assert.equal(focus.focusesTitle, false)
    assert.equal(focus.titleTabIndex, undefined)
  })

  it("con opt-in enfoca el título y lo hace enfocable", () => {
    const focus = resolveSheetTitleFocus(true)

    assert.equal(focus.focusesTitle, true)
    assert.equal(focus.titleTabIndex, -1)
  })
})
