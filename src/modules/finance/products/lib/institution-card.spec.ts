import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { buildInstitutionStackItems } from "@/src/modules/finance/shared/lib/institution-stack"
import type { FinanceInstitution } from "@/src/modules/finance/shared/types/entities"

import { buildInstitutionCard } from "./institution-card.ts"

const institution: FinanceInstitution = {
  id: "inst-1",
  name: "Banco",
  color: "#1B4332",
  logoUrl: null,
  country: "DO",
  isActive: true,
}

const display = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
  locale: "en-US",
}

describe("buildInstitutionCard", () => {
  it("does not show native totals when a credit limit is missing", () => {
    const [item] = buildInstitutionStackItems({
      institutions: [institution],
      accounts: [],
      cards: [],
      loans: [],
      positions: [
        {
          institutionId: "inst-1",
          status: "INCOMPLETE",
          netWorth: null,
          totalAssets: "0",
          totalLiabilities: null,
          byCurrency: [
            {
              currency: "DOP",
              assets: "100",
              available: "100",
              receivables: "0",
              liabilities: "0",
              netWorth: "100",
            },
          ],
          issues: [
            {
              code: "MISSING_CREDIT_LIMIT",
              cardId: "card-1",
              currency: "DOP",
            },
          ],
        },
      ],
    })

    const card = buildInstitutionCard(item!, display)

    assert.deepEqual(card.balanceLines, [])
    assert.equal(card.balanceAmount, "Balance incompleto")
  })

  it("shows one native balance line per currency", () => {
    const [item] = buildInstitutionStackItems({
      institutions: [institution],
      accounts: [],
      cards: [],
      loans: [],
      positions: [
        {
          institutionId: "inst-1",
          status: "COMPLETE",
          netWorth: "3400",
          totalAssets: "3500",
          totalLiabilities: "100",
          byCurrency: [
            {
              currency: "DOP",
              assets: "3000",
              available: "3000",
              receivables: "0",
              liabilities: "100",
              netWorth: "2900",
            },
            {
              currency: "USD",
              assets: "10",
              available: "10",
              receivables: "0",
              liabilities: "0",
              netWorth: "10",
            },
          ],
          issues: [],
        },
      ],
    })

    const card = buildInstitutionCard(item!, display)

    assert.equal(card.balanceLabel, "Patrimonio por moneda")
    assert.deepEqual(
      card.balanceLines.map((line) => line.currency),
      ["DOP", "USD"]
    )
    assert.match(card.balanceLines[0]?.amount ?? "", /2,900\.00/)
    assert.match(card.balanceLines[1]?.amount ?? "", /10\.00/)
  })
})
