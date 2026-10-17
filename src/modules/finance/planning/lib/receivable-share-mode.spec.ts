import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceReceivable } from "@/src/modules/finance/shared/types/entities"

import {
  debtorSelectionIds,
  readShareMode,
  selectedReceivables,
  SHARE_MODE_QUERY_KEY,
  shareModeUrl,
  shareSelectionTitle,
  toggleShareSelection,
} from "./receivable-share-mode.ts"

function searchParams(query: string) {
  const params = new URLSearchParams(query)
  return { get: (name: string) => params.get(name) }
}

function receivable(id: string, debtorName: string): FinanceReceivable {
  return {
    id,
    debtorName,
    description: null,
    amount: "100.00",
    paidAmount: "0.00",
    creditBalance: "0.00",
    writtenOffAmount: "0.00",
    writtenOffAt: null,
    currency: "DOP",
    dueDate: null,
    status: "PENDING",
  }
}

describe("readShareMode", () => {
  it("is off without the param", () => {
    assert.deepEqual(readShareMode(searchParams("tab=cobros")), {
      active: false,
      selectedIds: [],
    })
  })

  it("is on with an empty param and nothing picked", () => {
    assert.deepEqual(readShareMode(searchParams("compartir=")), {
      active: true,
      selectedIds: [],
    })
  })

  it("reads the ids kept in the URL", () => {
    assert.deepEqual(readShareMode(searchParams("compartir=a,b")), {
      active: true,
      selectedIds: ["a", "b"],
    })
  })

  it("drops blank pieces", () => {
    assert.deepEqual(
      readShareMode(searchParams("compartir=a,,b,")).selectedIds,
      ["a", "b"]
    )
  })

  it("reads the documented key", () => {
    assert.equal(SHARE_MODE_QUERY_KEY, "compartir")
  })
})

describe("toggleShareSelection", () => {
  it("adds a cobro at the end", () => {
    assert.deepEqual(toggleShareSelection(["a"], "b"), ["a", "b"])
  })

  it("removes a cobro already chosen", () => {
    assert.deepEqual(toggleShareSelection(["a", "b"], "a"), ["b"])
  })

  it("returns a new array", () => {
    const selected = ["a"]

    assert.notEqual(toggleShareSelection(selected, "b"), selected)
  })
})

describe("shareModeUrl", () => {
  it("turns the mode on with a first cobro", () => {
    assert.equal(
      shareModeUrl({
        pathname: "/finance/planning",
        query: "",
        active: true,
        selectedIds: ["a", "b"],
      }),
      "/finance/planning?compartir=a%2Cb"
    )
  })

  it("turns the mode on with nothing picked yet", () => {
    assert.equal(
      shareModeUrl({
        pathname: "/finance/planning",
        query: "",
        active: true,
        selectedIds: [],
      }),
      "/finance/planning?compartir="
    )
  })

  it("keeps the other params", () => {
    assert.equal(
      shareModeUrl({
        pathname: "/finance/planning",
        query: "tab=cobros",
        active: true,
        selectedIds: ["a"],
      }),
      "/finance/planning?tab=cobros&compartir=a"
    )
  })

  it("removes the param when the mode is off", () => {
    assert.equal(
      shareModeUrl({
        pathname: "/finance/planning",
        query: "compartir=a",
        active: false,
        selectedIds: [],
      }),
      "/finance/planning"
    )
  })

  it("keeps the other params when the mode is off", () => {
    assert.equal(
      shareModeUrl({
        pathname: "/finance/planning",
        query: "tab=cobros&compartir=a",
        active: false,
        selectedIds: [],
      }),
      "/finance/planning?tab=cobros"
    )
  })

  it("does nothing when the URL already says the same", () => {
    assert.equal(
      shareModeUrl({
        pathname: "/finance/planning",
        query: "compartir=a",
        active: true,
        selectedIds: ["a"],
      }),
      null
    )
  })

  it("does nothing when both are off", () => {
    assert.equal(
      shareModeUrl({
        pathname: "/finance/planning",
        query: "",
        active: false,
        selectedIds: [],
      }),
      null
    )
  })
})

describe("selectedReceivables", () => {
  it("keeps the listed cobros that are selected", () => {
    const listed = [receivable("a", "Carlos"), receivable("b", "Ana")]

    assert.deepEqual(
      selectedReceivables(listed, ["b"]).map((item) => item.id),
      ["b"]
    )
  })

  it("ignores ids that are no longer listed", () => {
    assert.deepEqual(
      selectedReceivables([receivable("a", "Carlos")], ["gone"]),
      []
    )
  })
})

describe("shareSelectionTitle", () => {
  it("keeps the singular for one cobro", () => {
    assert.equal(shareSelectionTitle(1), "1 seleccionado")
    assert.equal(shareSelectionTitle(3), "3 seleccionados")
  })
})

describe("debtorSelectionIds", () => {
  it("returns every listed cobro of the selected debtor", () => {
    const listed = [
      receivable("a", "Carlos"),
      receivable("b", "Ana"),
      receivable("c", "Carlos"),
    ]

    assert.deepEqual(
      debtorSelectionIds({ receivables: listed, selectedIds: ["a"] }),
      ["a", "c"]
    )
  })

  it("is empty without a selection", () => {
    assert.deepEqual(
      debtorSelectionIds({
        receivables: [receivable("a", "Carlos")],
        selectedIds: [],
      }),
      []
    )
  })
})
