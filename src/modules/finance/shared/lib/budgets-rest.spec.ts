import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"
import { budgetsInfiniteQuery } from "./finance-query-options.ts"

const financeRoot = join(dirname(fileURLToPath(import.meta.url)), "../..")

describe("budget list uses REST pagination, not chat Facade", () => {
  it("does not call list_budgets or FinanceFacade from the budgets screen", async () => {
    const files = [
      "shared/hooks/use-budgets.ts",
      "shared/lib/finance-query-options.ts",
      "planning/components/planning-list.tsx",
      "budgets/components/budgets-list.tsx",
    ]
    for (const relative of files) {
      const source = readFileSync(join(financeRoot, relative), "utf8")
      assert.equal(source.includes("list_budgets"), false, relative)
      assert.equal(source.includes("FinanceFacade"), false, relative)
    }

    const paths: string[] = []
    const query = budgetsInfiniteQuery(
      { limit: 20 },
      async <T>(path: string): Promise<T> => {
        paths.push(path)
        return { items: [], nextCursor: null, hasMore: false } as T
      }
    )
    await query.queryFn({ pageParam: undefined })
    assert.deepEqual(paths, ["/finance/budgets?limit=20"])
  })
})
