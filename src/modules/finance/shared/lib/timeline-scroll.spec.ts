import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  findActiveMonthKey,
  pickLandingDayKey,
  shouldFollowScroll,
} from "./timeline-scroll.ts"

describe("shouldFollowScroll", () => {
  it("ignores layout scroll until the user takes over", () => {
    assert.equal(
      shouldFollowScroll({ isProgrammatic: false, userTookOver: false }),
      false
    )
  })

  it("ignores scroll events fired by a programmatic landing", () => {
    assert.equal(
      shouldFollowScroll({ isProgrammatic: true, userTookOver: true }),
      false
    )
  })

  it("follows the marker after the user scrolls on their own", () => {
    assert.equal(
      shouldFollowScroll({ isProgrammatic: false, userTookOver: true }),
      true
    )
  })
})

describe("pickLandingDayKey", () => {
  it("lands on today when that day has movements", () => {
    assert.equal(
      pickLandingDayKey(
        ["2026-10-01", "2026-10-15", "2026-10-20"],
        "2026-10-15"
      ),
      "2026-10-15"
    )
  })

  it("lands on the latest day already passed when today is empty", () => {
    assert.equal(
      pickLandingDayKey(
        ["2026-10-02", "2026-10-14", "2026-10-18"],
        "2026-10-15"
      ),
      "2026-10-14"
    )
  })

  it("lands on the first day when every movement is still ahead", () => {
    assert.equal(
      pickLandingDayKey(["2026-10-20", "2026-10-21"], "2026-10-15"),
      "2026-10-20"
    )
  })

  it("returns null when the month has no days yet", () => {
    assert.equal(pickLandingDayKey([], "2026-10-15"), null)
  })
})

describe("findActiveMonthKey", () => {
  it("keeps the current month while the next banner is still below the marker", () => {
    assert.equal(
      findActiveMonthKey(
        [
          { key: "2026-09", top: -40 },
          { key: "2026-10", top: 120 },
        ],
        8
      ),
      "2026-09"
    )
  })

  it("counts a banner that lands a fraction below the marker", () => {
    assert.equal(
      findActiveMonthKey(
        [
          { key: "2026-08", top: -200 },
          { key: "2026-09", top: 8.4 },
        ],
        8
      ),
      "2026-09"
    )
  })

  it("switches when the next banner top equals the marker", () => {
    assert.equal(
      findActiveMonthKey(
        [
          { key: "2026-09", top: -160 },
          { key: "2026-10", top: 8 },
        ],
        8
      ),
      "2026-10"
    )
  })

  it("returns null for an empty list", () => {
    assert.equal(findActiveMonthKey([], 8), null)
  })

  it("returns the first month when all sections are below the marker", () => {
    assert.equal(
      findActiveMonthKey(
        [
          { key: "2026-09", top: 80 },
          { key: "2026-10", top: 400 },
        ],
        8
      ),
      "2026-09"
    )
  })

  it("returns the last month when all sections are above the marker", () => {
    assert.equal(
      findActiveMonthKey(
        [
          { key: "2026-08", top: -400 },
          { key: "2026-09", top: -200 },
        ],
        8
      ),
      "2026-09"
    )
  })
})
