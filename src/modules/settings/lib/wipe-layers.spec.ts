import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  applyWipeLayerToggle,
  expandWipeLayerSelection,
  sortWipeLayers,
  WIPE_LAYERS,
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
        WIPE_LAYERS.AI_SESSIONS,
        WIPE_LAYERS.AI_SESSIONS,
        WIPE_LAYERS.NOTIFICATIONS,
      ]),
      [WIPE_LAYERS.AI_SESSIONS, WIPE_LAYERS.NOTIFICATIONS]
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
