const TAB_SWIPE_THRESHOLD_PX = 56

type TabSwipeMovement = {
  deltaX: number
  deltaY: number
}

export function getTabSwipeDirection({
  deltaX,
  deltaY,
}: TabSwipeMovement): -1 | 1 | null {
  if (
    Math.abs(deltaX) < TAB_SWIPE_THRESHOLD_PX ||
    Math.abs(deltaX) < Math.abs(deltaY)
  ) {
    return null
  }
  return deltaX < 0 ? 1 : -1
}
