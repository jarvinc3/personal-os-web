import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildMessagesPath,
  normalizeMessagesFilter,
} from "./messages-request.ts"

const BASE = "/intelligence/messages"

describe("normalizeMessagesFilter", () => {
  it("recorta el texto y conserva el estado", () => {
    assert.deepEqual(
      normalizeMessagesFilter({ query: "  banco  ", status: "FAILED" }),
      { query: "banco", status: "FAILED" }
    )
  })
})

describe("buildMessagesPath", () => {
  it("sin filtros pide solo la primera tanda", () => {
    assert.equal(
      buildMessagesPath({ query: "", status: "ALL" }),
      `${BASE}?limit=50`
    )
  })

  it("manda el texto recortado", () => {
    assert.match(
      buildMessagesPath({ query: "  banco  ", status: "ALL" }),
      /q=banco(&|$)/
    )
    assert.doesNotMatch(
      buildMessagesPath({ query: "  banco  ", status: "ALL" }),
      /q=%20/
    )
  })

  it("omite el texto vacío", () => {
    assert.doesNotMatch(
      buildMessagesPath({ query: "   ", status: "ALL" }),
      /q=/
    )
  })

  it("manda el estado elegido y omite ALL", () => {
    assert.match(
      buildMessagesPath({ query: "", status: "REVIEW_REQUIRED" }),
      /status=REVIEW_REQUIRED/
    )
    assert.doesNotMatch(
      buildMessagesPath({ query: "", status: "ALL" }),
      /status=/
    )
  })

  it("combina texto, estado y cursor", () => {
    const path = buildMessagesPath({
      query: "bhd",
      status: "PROCESSED",
      cursor: "abc",
    })

    assert.match(path, /q=bhd/)
    assert.match(path, /status=PROCESSED/)
    assert.match(path, /cursor=abc/)
  })
})
