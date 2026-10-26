/** Strip glued to the left edge where a rightward drag can open the menu. */
export const SIDEBAR_EDGE_ZONE_PX = 32

/** Travel that decides whether the drag is horizontal or belongs to the page. */
export const SIDEBAR_SWIPE_DECISION_PX = 10

/** Vertical travel allowed against the horizontal one: 30° from the horizontal. */
export const SIDEBAR_SWIPE_MAX_VERTICAL_RATIO = 0.58

/** Retreat from the furthest point that cancels the gesture. */
export const SIDEBAR_SWIPE_BACKTRACK_PX = 12

/** Horizontal travel that opens the menu on its own. */
export const SIDEBAR_SWIPE_OPEN_DISTANCE_PX = 48

/** Speed of a flick, in CSS pixels per millisecond. */
export const SIDEBAR_SWIPE_FLING_VELOCITY_PX_PER_MS = 0.4

/** Travel a flick needs before it counts. */
export const SIDEBAR_SWIPE_FLING_MIN_DISTANCE_PX = 24

export type SidebarSwipeDecision = "pending" | "swipe" | "reject"

export function startsInsideSidebarEdge(clientX: number): boolean {
  return clientX >= 0 && clientX <= SIDEBAR_EDGE_ZONE_PX
}

/**
 * The gesture is decided once the finger leaves the slop: horizontal and to the
 * right becomes a swipe, anything else leaves the move to the page.
 */
export function resolveSidebarSwipeDecision(
  offsetX: number,
  offsetY: number
): SidebarSwipeDecision {
  const horizontalTravel = Math.abs(offsetX)
  if (horizontalTravel < SIDEBAR_SWIPE_DECISION_PX) {
    const verticalTravel = Math.abs(offsetY)
    return verticalTravel < SIDEBAR_SWIPE_DECISION_PX ? "pending" : "reject"
  }
  if (offsetX <= 0) {
    return "reject"
  }
  if (Math.abs(offsetY) > horizontalTravel * SIDEBAR_SWIPE_MAX_VERTICAL_RATIO) {
    return "reject"
  }
  return "swipe"
}

export function hasSidebarSwipeBacktracked(
  furthestOffsetX: number,
  offsetX: number
): boolean {
  return furthestOffsetX - offsetX > SIDEBAR_SWIPE_BACKTRACK_PX
}

/**
 * A long drag opens the menu outright; a short one needs the average speed of a
 * flick, which is the only speed the pointer events give us at release.
 */
export function opensSidebarOnRelease({
  offsetX,
  elapsedMs,
}: {
  offsetX: number
  elapsedMs: number
}): boolean {
  if (offsetX >= SIDEBAR_SWIPE_OPEN_DISTANCE_PX) {
    return true
  }
  if (offsetX < SIDEBAR_SWIPE_FLING_MIN_DISTANCE_PX) {
    return false
  }
  if (elapsedMs <= 0) {
    return false
  }
  return offsetX / elapsedMs >= SIDEBAR_SWIPE_FLING_VELOCITY_PX_PER_MS
}
