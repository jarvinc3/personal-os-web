import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { buildUpcomingCardCycle } from "./card-statement-cycle.ts"

function cycleOn(
  closingDay: number | null,
  dueDay: number | null,
  now: string
) {
  return buildUpcomingCardCycle({
    closingDay,
    dueDay,
    now: new Date(`${now}T00:00:00.000Z`),
  })
}

describe("buildUpcomingCardCycle", () => {
  it("keeps the closing day of the month that is still ahead", () => {
    assert.deepEqual(cycleOn(15, 30, "2026-03-05"), {
      cycleEnd: "2026-03-15",
      dueDate: "2026-03-30",
    })
  })

  it("counts today as the closing day", () => {
    assert.deepEqual(cycleOn(15, 30, "2026-03-15"), {
      cycleEnd: "2026-03-15",
      dueDate: "2026-03-30",
    })
  })

  it("moves to the next month once the closing day passed", () => {
    assert.deepEqual(cycleOn(15, 30, "2026-03-20"), {
      cycleEnd: "2026-04-15",
      dueDate: "2026-04-30",
    })
  })

  it("clamps the closing day to the last day of a short month", () => {
    assert.equal(cycleOn(31, 5, "2026-02-01")?.cycleEnd, "2026-02-28")
    assert.equal(cycleOn(31, 5, "2028-02-01")?.cycleEnd, "2028-02-29")
  })

  it("moves a due day that falls on the closing day to the next month", () => {
    assert.deepEqual(cycleOn(15, 15, "2026-03-01"), {
      cycleEnd: "2026-03-15",
      dueDate: "2026-04-15",
    })
  })

  it("leaves the due date empty when the card has no due day", () => {
    assert.deepEqual(cycleOn(15, null, "2026-03-01"), {
      cycleEnd: "2026-03-15",
      dueDate: null,
    })
  })

  it("has no cycle when the card has no closing day", () => {
    assert.equal(cycleOn(null, 30, "2026-03-01"), null)
  })
})
