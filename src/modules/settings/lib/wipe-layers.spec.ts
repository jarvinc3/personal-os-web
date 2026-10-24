import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  applyWipeLayerToggle,
  expandWipeLayerSelection,
  sortWipeLayers,
  toggleWipeGroupLayers,
  WIPE_LAYERS,
  wipeGroupChecked,
} from "./wipe-layers.ts"

describe("expandWipeLayerSelection", () => {
  it("adds the ledger when the catalog is selected", () => {
    assert.deepEqual(expandWipeLayerSelection([WIPE_LAYERS.FINANCE_CATALOG]), [
      WIPE_LAYERS.FINANCE_LEDGER,
      WIPE_LAYERS.FINANCE_CATALOG,
    ])
  })

  it("adds planning when categories are selected", () => {
    assert.deepEqual(
      expandWipeLayerSelection([WIPE_LAYERS.FINANCE_CATEGORIES]),
      [WIPE_LAYERS.FINANCE_PLANNING, WIPE_LAYERS.FINANCE_CATEGORIES]
    )
  })

  it("deduplicates and keeps independent layers", () => {
    assert.deepEqual(
      expandWipeLayerSelection([
        WIPE_LAYERS.FINANCE_BALANCES,
        WIPE_LAYERS.NOTIFICATIONS,
      ]),
      [WIPE_LAYERS.FINANCE_BALANCES, WIPE_LAYERS.NOTIFICATIONS]
    )
  })
})

describe("applyWipeLayerToggle", () => {
  it("auto-selects the ledger when turning on the catalog", () => {
    assert.deepEqual(
      applyWipeLayerToggle([], WIPE_LAYERS.FINANCE_CATALOG, true),
      [WIPE_LAYERS.FINANCE_LEDGER, WIPE_LAYERS.FINANCE_CATALOG]
    )
  })

  it("drops the catalog when the ledger is turned off", () => {
    assert.deepEqual(
      applyWipeLayerToggle(
        [WIPE_LAYERS.FINANCE_LEDGER, WIPE_LAYERS.FINANCE_CATALOG],
        WIPE_LAYERS.FINANCE_LEDGER,
        false
      ),
      []
    )
  })

  it("drops categories when planning is turned off", () => {
    assert.deepEqual(
      applyWipeLayerToggle(
        [WIPE_LAYERS.FINANCE_PLANNING, WIPE_LAYERS.FINANCE_CATEGORIES],
        WIPE_LAYERS.FINANCE_PLANNING,
        false
      ),
      []
    )
  })
})

describe("sortWipeLayers", () => {
  it("orders by the server execution order", () => {
    assert.deepEqual(
      sortWipeLayers([
        WIPE_LAYERS.SETTINGS_DEFAULTS,
        WIPE_LAYERS.FINANCE_CATALOG,
        WIPE_LAYERS.FINANCE_LEDGER,
      ]),
      [
        WIPE_LAYERS.FINANCE_LEDGER,
        WIPE_LAYERS.FINANCE_CATALOG,
        WIPE_LAYERS.SETTINGS_DEFAULTS,
      ]
    )
  })
})

describe("wipeGroupChecked", () => {
  const layers = [WIPE_LAYERS.FINANCE_LEDGER, WIPE_LAYERS.FINANCE_CATALOG]

  it("reflects none, all and in between", () => {
    assert.equal(wipeGroupChecked(layers, []), false)
    assert.equal(wipeGroupChecked(layers, layers), true)
    assert.equal(
      wipeGroupChecked(layers, [WIPE_LAYERS.FINANCE_LEDGER]),
      "indeterminate"
    )
  })
})

describe("toggleWipeGroupLayers", () => {
  it("selects every layer of the group with its dependencies", () => {
    const next = toggleWipeGroupLayers([], [WIPE_LAYERS.FINANCE_CATALOG], true)

    assert.ok(next.includes(WIPE_LAYERS.FINANCE_CATALOG))
    assert.ok(next.includes(WIPE_LAYERS.FINANCE_LEDGER))
  })

  it("clears the group and its dependents", () => {
    const selected = expandWipeLayerSelection([WIPE_LAYERS.FINANCE_CATALOG])
    const next = toggleWipeGroupLayers(
      selected,
      [WIPE_LAYERS.FINANCE_LEDGER],
      false
    )

    assert.deepEqual(next, [])
  })
})
