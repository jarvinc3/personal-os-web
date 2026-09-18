import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"
import { budgetsListQuery } from "./finance-query-options.ts"

const financeRoot = join(dirname(fileURLToPath(import.meta.url)), "..")

describe("budget list uses REST pagination, not chat Facade", () => {
  it("does not call list_budgets or FinanceFacade from the budgets screen", async () => {
    const files = [
      "hooks/use-budgets.ts",
      "lib/finance-query-options.ts",
      "components/planning/finance-planning.tsx",
      "components/budgets/finance-budgets-list.tsx",
    ]
    for (const relative of files) {
      const source = readFileSync(join(financeRoot, relative), "utf8")
      assert.equal(source.includes("list_budgets"), false, relative)
      assert.equal(source.includes("FinanceFacade"), false, relative)
    }

    const paths: string[] = []
    const query = budgetsListQuery(
      { page: 1, limit: 20 },
      async <T>(path: string): Promise<T> => {
        paths.push(path)
        return { items: [], pagination: {} } as T
      },
    )
    await query.queryFn()
    assert.deepEqual(paths, ["/finance/budgets?page=1&limit=20"])
  })
})
