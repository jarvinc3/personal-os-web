import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"

const financeRoot = join(dirname(fileURLToPath(import.meta.url)), "..")

describe("budget list uses REST pagination, not chat Facade", () => {
  it("does not call list_budgets or FinanceFacade from the budgets screen", () => {
    const files = [
      "hooks/use-budgets.ts",
      "pages/finance-budgets.tsx",
      "components/budgets/finance-budgets-list.tsx",
    ]
    for (const relative of files) {
      const source = readFileSync(join(financeRoot, relative), "utf8")
      assert.equal(source.includes("list_budgets"), false, relative)
      assert.equal(source.includes("FinanceFacade"), false, relative)
    }

    const hook = readFileSync(join(financeRoot, "hooks/use-budgets.ts"), "utf8")
    assert.equal(hook.includes("API_ENDPOINTS.FINANCE.BUDGETS"), true)
    assert.equal(hook.includes("buildBudgetsSearchParams"), true)
  })
})
