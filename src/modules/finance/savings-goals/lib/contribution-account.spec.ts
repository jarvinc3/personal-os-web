import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceAccount } from "@/src/modules/finance/shared/types/entities.ts"
import { defaultContributionAccountId } from "./contribution-account.ts"

function account(
  partial: Partial<FinanceAccount> & Pick<FinanceAccount, "id">
): FinanceAccount {
  return {
    institutionId: null,
    institutionName: null,
    name: "Cuenta",
    type: "SAVINGS",
    currency: "DOP",
    accountNumberLast4: null,
    balance: "0",
    freeBalance: "0",
    earmarkedAmount: "0",
    color: null,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  } as FinanceAccount
}

describe("defaultContributionAccountId", () => {
  it("keeps the goal account while it has free balance", () => {
    const id = defaultContributionAccountId({
      accounts: [
        account({ id: "goal", freeBalance: "250" }),
        account({ id: "other", freeBalance: "900" }),
      ],
      goalAccountId: "goal",
    })
    assert.equal(id, "goal")
  })

  it("skips a goal account without free balance", () => {
    const id = defaultContributionAccountId({
      accounts: [
        account({ id: "goal", freeBalance: "0" }),
        account({ id: "other", freeBalance: "900" }),
      ],
      goalAccountId: "goal",
    })
    assert.equal(id, "other")
  })

  it("falls back to the first account when none has free balance", () => {
    const id = defaultContributionAccountId({
      accounts: [account({ id: "first" }), account({ id: "second" })],
      goalAccountId: "goal",
    })
    assert.equal(id, "first")
  })

  it("returns nothing without accounts", () => {
    assert.equal(
      defaultContributionAccountId({ accounts: [], goalAccountId: null }),
      ""
    )
  })
})
