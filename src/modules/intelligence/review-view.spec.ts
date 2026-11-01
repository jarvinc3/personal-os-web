import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { readReviewView } from "@/src/modules/intelligence/review-view"

describe("vista de revisión", () => {
  it("abre los grupos cuando la URL no dice otra cosa", () => {
    assert.equal(readReviewView(null), "groups")
    assert.equal(readReviewView(""), "groups")
    assert.equal(readReviewView("desconocida"), "groups")
  })

  it("abre la cola por correo cuando la URL la pide", () => {
    assert.equal(readReviewView("messages"), "messages")
  })
})
