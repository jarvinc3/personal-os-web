import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  hasSidebarSwipeBacktracked,
  opensSidebarOnRelease,
  resolveSidebarSwipeDecision,
  SIDEBAR_EDGE_ZONE_PX,
  SIDEBAR_SWIPE_DECISION_PX,
  SIDEBAR_SWIPE_FLING_MIN_DISTANCE_PX,
  SIDEBAR_SWIPE_OPEN_DISTANCE_PX,
  startsInsideSidebarEdge,
} from "./sidebar-edge-swipe.ts"

describe("startsInsideSidebarEdge", () => {
  it("accepts the strip glued to the left edge", () => {
    assert.equal(startsInsideSidebarEdge(0), true)
    assert.equal(startsInsideSidebarEdge(12), true)
    assert.equal(startsInsideSidebarEdge(SIDEBAR_EDGE_ZONE_PX), true)
  })

  it("rejects the rest of the screen", () => {
    assert.equal(startsInsideSidebarEdge(-1), false)
    assert.equal(startsInsideSidebarEdge(SIDEBAR_EDGE_ZONE_PX + 1), false)
    assert.equal(startsInsideSidebarEdge(200), false)
  })
})

describe("resolveSidebarSwipeDecision", () => {
  it("waits while the finger stays inside the decision slop", () => {
    assert.equal(resolveSidebarSwipeDecision(0, 0), "pending")
    assert.equal(resolveSidebarSwipeDecision(4, 6), "pending")
    assert.equal(
      resolveSidebarSwipeDecision(
        SIDEBAR_SWIPE_DECISION_PX - 1,
        SIDEBAR_SWIPE_DECISION_PX - 1
      ),
      "pending"
    )
  })

  it("accepts a rightward drag within 30° of the horizontal", () => {
    assert.equal(resolveSidebarSwipeDecision(10, 0), "swipe")
    assert.equal(resolveSidebarSwipeDecision(50, 28), "swipe")
    assert.equal(resolveSidebarSwipeDecision(120, -30), "swipe")
  })

  it("rejects a drag that leaves the 30° cone", () => {
    assert.equal(resolveSidebarSwipeDecision(50, 30), "reject")
    assert.equal(resolveSidebarSwipeDecision(100, 60), "reject")
    assert.equal(resolveSidebarSwipeDecision(10, 20), "reject")
    assert.equal(resolveSidebarSwipeDecision(30, 300), "reject")
  })

  it("rejects a vertical start so the page can scroll", () => {
    assert.equal(
      resolveSidebarSwipeDecision(0, SIDEBAR_SWIPE_DECISION_PX),
      "reject"
    )
    assert.equal(resolveSidebarSwipeDecision(2, 40), "reject")
  })

  it("rejects a drag that goes left", () => {
    assert.equal(resolveSidebarSwipeDecision(-10, 0), "reject")
    assert.equal(resolveSidebarSwipeDecision(-80, 10), "reject")
  })
})

describe("hasSidebarSwipeBacktracked", () => {
  it("keeps the gesture while the finger moves forward", () => {
    assert.equal(hasSidebarSwipeBacktracked(0, 0), false)
    assert.equal(hasSidebarSwipeBacktracked(50, 60), false)
  })

  it("cancels a small retreat within the tolerance", () => {
    assert.equal(hasSidebarSwipeBacktracked(60, 48), false)
    assert.equal(hasSidebarSwipeBacktracked(60, 60), false)
  })

  it("cancels a retreat larger than the tolerance", () => {
    assert.equal(hasSidebarSwipeBacktracked(60, 47), true)
    assert.equal(hasSidebarSwipeBacktracked(60, 0), true)
  })
})

describe("opensSidebarOnRelease", () => {
  it("opens with a long drag even when it was slow", () => {
    assert.equal(
      opensSidebarOnRelease({
        offsetX: SIDEBAR_SWIPE_OPEN_DISTANCE_PX,
        elapsedMs: 1200,
      }),
      true
    )
    assert.equal(opensSidebarOnRelease({ offsetX: 120, elapsedMs: 900 }), true)
  })

  it("opens with a short fast flick", () => {
    assert.equal(
      opensSidebarOnRelease({
        offsetX: SIDEBAR_SWIPE_FLING_MIN_DISTANCE_PX,
        elapsedMs: 60,
      }),
      true
    )
    assert.equal(opensSidebarOnRelease({ offsetX: 40, elapsedMs: 50 }), true)
  })

  it("stays closed when the drag is short and slow", () => {
    assert.equal(opensSidebarOnRelease({ offsetX: 40, elapsedMs: 800 }), false)
    assert.equal(opensSidebarOnRelease({ offsetX: 20, elapsedMs: 20 }), false)
    assert.equal(opensSidebarOnRelease({ offsetX: 0, elapsedMs: 10 }), false)
  })

  it("stays closed without elapsed time to measure a flick", () => {
    assert.equal(opensSidebarOnRelease({ offsetX: 30, elapsedMs: 0 }), false)
  })
})
