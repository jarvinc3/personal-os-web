import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { CATALOG_NONE } from "../constants/catalog.ts"
import { encodeLedgerTarget } from "./ledger-payloads.ts"
import {
  currencyForTarget,
  formatCalendarDate,
  formatFinanceDateTimeLabel,
  hasMoneyCentsInput,
  isLedgerTargetInput,
  isMoneyAmountInput,
  isPositiveAmountInput,
  isWithinMaxAmountInput,
  nowDateTimeInput,
  sliceDateInput,
  sliceDateTimeInput,
  todayDateInput,
  wallClockToIso,
} from "./ledger-form.ts"

describe("todayDateInput", () => {
  it("formats local YYYY-MM-DD", () => {
    assert.equal(todayDateInput(new Date(2026, 8, 11)), "2026-09-11")
  })
})

describe("sliceDateInput", () => {
  it("keeps the date part of an ISO timestamp", () => {
    assert.equal(sliceDateInput("2026-09-11T12:00:00.000Z"), "2026-09-11")
  })
})

describe("nowDateTimeInput", () => {
  it("formats the local wall clock to the minute", () => {
    assert.equal(
      nowDateTimeInput(new Date(2026, 8, 11, 14, 5)),
      "2026-09-11T14:05"
    )
    assert.equal(
      nowDateTimeInput(new Date(2026, 8, 11, 0, 0)),
      "2026-09-11T00:00"
    )
  })
})

describe("sliceDateTimeInput", () => {
  it("keeps the wall clock of a stored timestamp", () => {
    assert.equal(
      sliceDateTimeInput("2026-09-11T12:34:56.000Z"),
      "2026-09-11T12:34"
    )
  })

  it("treats a date without an hour as midnight", () => {
    assert.equal(sliceDateTimeInput("2026-09-11"), "2026-09-11T00:00")
  })

  it("falls back when the value is missing or unreadable", () => {
    assert.equal(
      sliceDateTimeInput(undefined, "2026-09-11T09:00"),
      "2026-09-11T09:00"
    )
    assert.equal(
      sliceDateTimeInput("ayer", "2026-09-11T09:00"),
      "2026-09-11T09:00"
    )
  })
})

describe("wallClockToIso", () => {
  it("turns the wall clock into the instant of the user's zone", () => {
    assert.equal(
      wallClockToIso("2026-09-11T14:05", "America/La_Paz"),
      "2026-09-11T18:05:00.000Z"
    )
    assert.equal(
      wallClockToIso("2026-09-11", "America/La_Paz"),
      "2026-09-11T04:00:00.000Z"
    )
  })
})

describe("formatFinanceDateTimeLabel", () => {
  const expectedDate = new Date(2026, 8, 18).toLocaleDateString("es", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  it("adds the hour to the date", () => {
    const expectedTime = new Date(2000, 0, 1, 14, 30).toLocaleTimeString("es", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    assert.equal(
      formatFinanceDateTimeLabel("2026-09-18T14:30:00.000Z"),
      `${expectedDate}, ${expectedTime}`
    )
  })

  it("shows just the date for midnight or a date without an hour", () => {
    assert.equal(
      formatFinanceDateTimeLabel("2026-09-18T00:00:00.000Z"),
      expectedDate
    )
    assert.equal(formatFinanceDateTimeLabel("2026-09-18"), expectedDate)
  })
})

describe("formatCalendarDate", () => {
  it("formats YYYY-MM-DD in local time, not the UTC day before", () => {
    const expected = new Date(2026, 8, 18).toLocaleDateString("es", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    assert.equal(formatCalendarDate("2026-09-18T00:00:00.000Z"), expected)
    assert.equal(formatCalendarDate("2026-09-18"), expected)
    assert.match(expected, /18/)
    assert.match(expected, /2026/)
  })

  it("returns the original string when the date slice is not YYYY-MM-DD", () => {
    assert.equal(formatCalendarDate("not-a-date"), "not-a-date")
  })
})

describe("currencyForTarget", () => {
  it("prefers the account or first card balance currency", () => {
    assert.equal(
      currencyForTarget(
        encodeLedgerTarget("account", "acc-1"),
        [{ id: "acc-1", currency: "USD" } as never],
        [],
        "DOP"
      ),
      "USD"
    )
    assert.equal(
      currencyForTarget(
        encodeLedgerTarget("card", "card-1"),
        [],
        [{ id: "card-1", balances: [{ currency: "EUR" }] } as never],
        "DOP"
      ),
      "EUR"
    )
  })
})

describe("isPositiveAmountInput", () => {
  it("rejects empty, zero and unusable amounts", () => {
    assert.equal(isPositiveAmountInput(""), false)
    assert.equal(isPositiveAmountInput("0"), false)
    assert.equal(isPositiveAmountInput("0.00"), false)
    assert.equal(isPositiveAmountInput("."), false)
  })

  it("accepts an amount greater than zero", () => {
    assert.equal(isPositiveAmountInput("12.5"), true)
    assert.equal(isPositiveAmountInput(" 1 "), true)
  })
})

describe("isLedgerTargetInput", () => {
  it("rejects the empty picker value", () => {
    assert.equal(isLedgerTargetInput(CATALOG_NONE), false)
    assert.equal(isLedgerTargetInput(""), false)
    assert.equal(isLedgerTargetInput("account:"), false)
  })

  it("accepts an encoded account or card", () => {
    assert.equal(
      isLedgerTargetInput(encodeLedgerTarget("account", "acc-1")),
      true
    )
    assert.equal(
      isLedgerTargetInput(encodeLedgerTarget("card", "card-1")),
      true
    )
  })
})

describe("hasMoneyCentsInput", () => {
  it("accepts whole amounts and up to two decimals", () => {
    assert.equal(hasMoneyCentsInput("10"), true)
    assert.equal(hasMoneyCentsInput("10.5"), true)
    assert.equal(hasMoneyCentsInput("10.05"), true)
  })

  it("rejects a third decimal", () => {
    assert.equal(hasMoneyCentsInput("10.005"), false)
  })
})

describe("isWithinMaxAmountInput", () => {
  it("accepts an amount on the ceiling and rejects the one above it", () => {
    assert.equal(isWithinMaxAmountInput("999999999.99"), true)
    assert.equal(isWithinMaxAmountInput("1000000000"), false)
  })
})

describe("isMoneyAmountInput", () => {
  it("requires cents, a positive value and the ceiling at once", () => {
    assert.equal(isMoneyAmountInput("10.05"), true)
    assert.equal(isMoneyAmountInput("10.005"), false)
    assert.equal(isMoneyAmountInput("0"), false)
    assert.equal(isMoneyAmountInput("99999999999"), false)
  })
})
