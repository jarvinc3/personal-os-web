import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { findActiveMonthKey, shouldFollowScroll } from "./timeline-scroll.ts";

describe("shouldFollowScroll", () => {
  it("ignores layout scroll until the user takes over", () => {
    assert.equal(
      shouldFollowScroll({ isProgrammatic: false, userTookOver: false }),
      false,
    )
  })

  it("ignores scroll events fired by a programmatic landing", () => {
    assert.equal(
      shouldFollowScroll({ isProgrammatic: true, userTookOver: true }),
      false,
    )
  })

  it("follows the marker after the user scrolls on their own", () => {
    assert.equal(
      shouldFollowScroll({ isProgrammatic: false, userTookOver: true }),
      true,
    )
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
