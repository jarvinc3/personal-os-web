/** How long a press must last to count as a long press. */
export const LONG_PRESS_MS = 500

/** Movement that turns a press into a scroll or a drag, and cancels it. */
export const LONG_PRESS_MOVE_SLOP_PX = 8

type Point = {
  x: number
  y: number
}

export function hasMovedBeyondLongPressSlop(
  start: Point,
  next: Point
): boolean {
  return (
    Math.abs(next.x - start.x) > LONG_PRESS_MOVE_SLOP_PX ||
    Math.abs(next.y - start.y) > LONG_PRESS_MOVE_SLOP_PX
  )
}
