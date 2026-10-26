import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  REVIEW_SHORTCUT_HELP,
  resolveReviewShortcut,
} from "@/src/modules/intelligence/review-shortcuts"

const freeTarget = {
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  isBlockedTarget: false,
}

describe("atajos del modo foco", () => {
  it("asigna una acción a cada tecla", () => {
    assert.equal(resolveReviewShortcut({ ...freeTarget, key: "c" }), "confirm")
    assert.equal(resolveReviewShortcut({ ...freeTarget, key: "E" }), "correct")
    assert.equal(resolveReviewShortcut({ ...freeTarget, key: "r" }), "reject")
    assert.equal(resolveReviewShortcut({ ...freeTarget, key: "j" }), "next")
    assert.equal(
      resolveReviewShortcut({ ...freeTarget, key: "ArrowRight" }),
      "next"
    )
    assert.equal(resolveReviewShortcut({ ...freeTarget, key: "k" }), "previous")
    assert.equal(
      resolveReviewShortcut({ ...freeTarget, key: "ArrowLeft" }),
      "previous"
    )
  })

  it("no actúa al escribir en un campo ni al pulsar un selector", () => {
    assert.equal(
      resolveReviewShortcut({
        ...freeTarget,
        isBlockedTarget: true,
        key: "c",
      }),
      null
    )
  })

  it("deja pasar los atajos con modificador o teclas ajenas", () => {
    assert.equal(
      resolveReviewShortcut({ ...freeTarget, ctrlKey: true, key: "c" }),
      null
    )
    assert.equal(
      resolveReviewShortcut({ ...freeTarget, metaKey: true, key: "r" }),
      null
    )
    assert.equal(
      resolveReviewShortcut({ ...freeTarget, altKey: true, key: "j" }),
      null
    )
    assert.equal(resolveReviewShortcut({ ...freeTarget, key: "x" }), null)
  })

  it("publica la ayuda de cada atajo con su tecla", () => {
    assert.deepEqual(
      REVIEW_SHORTCUT_HELP.map((shortcut) => shortcut.key),
      ["C", "E", "R", "J", "K", "Esc"]
    )
  })
})
