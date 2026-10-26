import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  allSelectableBranchesSelected,
  branchesOf,
  buildWipeSections,
  draggedBranchParents,
  expandWipeSelection,
  expectedBranchCounts,
  findAppBranches,
  formatBranchCount,
  selectableBranchIds,
  toggleAllBranchSelection,
  toggleBranchSelection,
} from "./wipe-branches.ts"
import type {
  DataAppBranches,
  DataBranch,
} from "@/src/modules/settings/types/wipe.types"

const FINANCE_BRANCHES: DataBranch[] = [
  {
    id: "finance.reconciliations",
    label: "Conciliaciones y descuadres",
    count: 4,
    includes: [],
  },
  {
    id: "finance.transactions",
    label: "Movimientos y transferencias",
    count: 12,
    includes: [{ id: "finance.reconciliations", count: 4 }],
  },
  {
    id: "finance.budgets",
    label: "Presupuestos",
    count: 2,
    includes: [],
  },
  {
    id: "finance.categories",
    label: "Categorías propias",
    count: 3,
    includes: [{ id: "finance.budgets", count: 2 }],
  },
  {
    id: "finance.merchants",
    label: "Comercios",
    count: 0,
    includes: [],
  },
]

const GROUPS: DataAppBranches[] = [
  { app: "finance", branches: FINANCE_BRANCHES },
  {
    app: "ai",
    branches: [
      {
        id: "ai.inferences",
        label: "Historial de uso de IA",
        count: 7,
        includes: [],
      },
    ],
  },
]

const NESTED_BRANCHES: DataBranch[] = [
  {
    id: "a",
    label: "A",
    count: 1,
    includes: [{ id: "b", count: 1 }],
  },
  {
    id: "b",
    label: "B",
    count: 1,
    includes: [{ id: "c", count: 1 }],
  },
  { id: "c", label: "C", count: 1, includes: [] },
]

describe("expandWipeSelection", () => {
  it("follows the includes the API sends, also when they chain", () => {
    assert.deepEqual(
      expandWipeSelection({ branches: NESTED_BRANCHES, selected: ["a"] }),
      ["a", "b", "c"]
    )
    assert.deepEqual(
      expandWipeSelection({
        branches: FINANCE_BRANCHES,
        selected: ["finance.transactions"],
      }),
      ["finance.reconciliations", "finance.transactions"]
    )
  })

  it("keeps every explicitly selected branch once", () => {
    assert.deepEqual(
      expandWipeSelection({
        branches: FINANCE_BRANCHES,
        selected: ["finance.categories", "finance.transactions"],
      }),
      [
        "finance.reconciliations",
        "finance.transactions",
        "finance.budgets",
        "finance.categories",
      ]
    )
  })
})

describe("toggleBranchSelection", () => {
  it("selects the branch without turning its dragged rows into choices", () => {
    const selected = toggleBranchSelection({
      branches: FINANCE_BRANCHES,
      selected: [],
      branchId: "finance.transactions",
      checked: true,
    })
    assert.deepEqual(selected, ["finance.transactions"])
  })

  it("unchecks the branches that need the unchecked one", () => {
    assert.deepEqual(
      toggleBranchSelection({
        branches: FINANCE_BRANCHES,
        selected: ["finance.categories", "finance.transactions"],
        branchId: "finance.budgets",
        checked: false,
      }),
      ["finance.transactions"]
    )
    assert.deepEqual(
      toggleBranchSelection({
        branches: FINANCE_BRANCHES,
        selected: ["finance.reconciliations", "finance.transactions"],
        branchId: "finance.transactions",
        checked: false,
      }),
      ["finance.reconciliations"]
    )
  })
})

describe("branch counts", () => {
  it("names the rows the user would lose and hides empty branches", () => {
    assert.equal(
      formatBranchCount({
        branchId: "finance.transactions",
        count: 12,
        locale: "es",
      }),
      "12 movimientos"
    )
    assert.equal(
      formatBranchCount({
        branchId: "finance.transactions",
        count: 1,
        locale: "es",
      }),
      "1 movimiento"
    )
    assert.equal(
      formatBranchCount({
        branchId: "finance.merchants",
        count: 0,
        locale: "es",
      }),
      "Sin datos"
    )
    assert.equal(
      formatBranchCount({
        branchId: "new.branch",
        count: 5,
        locale: "es",
      }),
      "5 filas"
    )
  })

  it("only lets branches with data be chosen", () => {
    assert.deepEqual(selectableBranchIds(FINANCE_BRANCHES), [
      "finance.reconciliations",
      "finance.transactions",
      "finance.budgets",
      "finance.categories",
    ])
    assert.equal(
      allSelectableBranchesSelected({
        branches: FINANCE_BRANCHES,
        selected: selectableBranchIds(FINANCE_BRANCHES),
      }),
      true
    )
    assert.equal(
      allSelectableBranchesSelected({
        branches: FINANCE_BRANCHES,
        selected: ["finance.merchants"],
      }),
      false
    )
  })
})

describe("selection payload", () => {
  it("sends the counts of the applied branches", () => {
    const applied = expandWipeSelection({
      branches: FINANCE_BRANCHES,
      selected: ["finance.categories"],
    })
    assert.deepEqual(
      expectedBranchCounts({ branches: FINANCE_BRANCHES, selected: applied }),
      { "finance.budgets": 2, "finance.categories": 3 }
    )
  })

  it("select-all picks only branches with data", () => {
    assert.deepEqual(
      toggleAllBranchSelection({
        branches: FINANCE_BRANCHES,
        selected: [],
        checked: true,
      }),
      [
        "finance.reconciliations",
        "finance.transactions",
        "finance.budgets",
        "finance.categories",
      ]
    )
    assert.deepEqual(
      toggleAllBranchSelection({
        branches: FINANCE_BRANCHES,
        selected: ["finance.transactions"],
        checked: false,
      }),
      []
    )
  })

  it("finds the selected branch that drags each locked row", () => {
    const parents = draggedBranchParents({
      branches: FINANCE_BRANCHES,
      selected: ["finance.transactions", "finance.categories"],
    })
    assert.deepEqual(
      [...parents.entries()],
      [
        ["finance.reconciliations", "finance.transactions"],
        ["finance.budgets", "finance.categories"],
      ]
    )
  })
})

describe("buildWipeSections", () => {
  it("groups the finance scope by theme, in the fixed order", () => {
    const sections = buildWipeSections({
      groups: GROUPS,
      selected: [],
      locale: "es",
      app: "finance",
    })
    assert.deepEqual(
      sections.map((section) => section.title),
      ["Movimientos y saldos", "Planificación", "Comercios y categorías"]
    )
    assert.deepEqual(
      sections[0].rows.map((row) => row.branch.id),
      ["finance.reconciliations", "finance.transactions"]
    )
  })

  it("groups every app in the global scope and marks dragged rows", () => {
    const sections = buildWipeSections({
      groups: GROUPS,
      selected: ["finance.transactions"],
      locale: "es",
    })
    assert.deepEqual(
      sections.map((section) => section.title),
      ["Finanzas", "Asistente IA"]
    )
    const financeRows = sections[0].rows
    const reconciliations = financeRows.find(
      (row) => row.branch.id === "finance.reconciliations"
    )
    assert.equal(reconciliations?.checked, true)
    assert.equal(reconciliations?.locked, true)
    assert.equal(
      reconciliations?.draggedByLabel,
      "Movimientos y transferencias"
    )
    assert.equal(reconciliations?.heading?.label, "Movimientos y saldos")
    assert.equal(
      financeRows.find((row) => row.branch.id === "finance.merchants")
        ?.selectable,
      false
    )
    assert.equal(
      financeRows.find((row) => row.branch.id === "finance.budgets")?.heading
        ?.label,
      "Planificación"
    )
    assert.equal(sections[1].rows[0].heading, undefined)
    assert.equal(sections[1].rows[0].countLabel, "7 inferencias")
  })

  it("keeps an unknown branch visible under its own theme", () => {
    const sections = buildWipeSections({
      groups: [
        {
          app: "finance",
          branches: [
            {
              id: "finance.receipts",
              label: "Recibos",
              count: 2,
              includes: [],
            },
          ],
        },
      ],
      selected: [],
      locale: "es",
      app: "finance",
    })
    assert.equal(sections[0].title, "Otras ramas")
    assert.equal(sections[0].rows[0].label, "Recibos")
    assert.equal(sections[0].rows[0].countLabel, "2 filas")
  })
})

describe("group helpers", () => {
  it("flattens only the requested app and finds its branches", () => {
    assert.deepEqual(
      branchesOf(GROUPS, "finance").map((branch) => branch.id),
      FINANCE_BRANCHES.map((branch) => branch.id)
    )
    assert.deepEqual(findAppBranches(GROUPS, "ai"), GROUPS[1].branches)
    assert.deepEqual(findAppBranches(undefined, "finance"), [])
  })
})
