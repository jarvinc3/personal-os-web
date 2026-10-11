/**
 * Scroll landing and subpixel layout can leave a banner a fraction below the
 * marker. Without this slack the previous month stays selected.
 */
export const TIMELINE_MARKER_SLACK_PX = 1

export function shouldFollowScroll(input: {
  isProgrammatic: boolean
  userTookOver: boolean
}): boolean {
  return input.userTookOver && !input.isProgrammatic
}

export function findActiveMonthKey(
  sections: ReadonlyArray<{ key: string; top: number }>,
  marker: number
): string | null {
  if (sections.length === 0) {
    return null
  }
  const line = marker + TIMELINE_MARKER_SLACK_PX
  let active: string | null = null
  for (const section of sections) {
    if (section.top <= line) {
      active = section.key
    }
  }
  return active ?? sections[0]?.key ?? null
}

export function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null
  while (current) {
    const overflowY = getComputedStyle(current).overflowY
    if (overflowY === "auto" || overflowY === "scroll") {
      return current
    }
    current = current.parentElement
  }
  return (
    (document.scrollingElement as HTMLElement | null) ??
    document.documentElement
  )
}

function sectionScrollTarget(section: HTMLElement, offset: number) {
  const parent = getScrollParent(section)
  if (!parent) {
    return null
  }
  const parentTop =
    parent === document.documentElement || parent === document.body
      ? 0
      : parent.getBoundingClientRect().top
  const delta = section.getBoundingClientRect().top - parentTop - offset
  return { parent, top: parent.scrollTop + delta + TIMELINE_MARKER_SLACK_PX }
}

export function scrollSectionIntoView(
  section: HTMLElement,
  offset: number,
  behavior: ScrollBehavior = "smooth"
) {
  const target = sectionScrollTarget(section, offset)
  if (!target) {
    section.scrollIntoView({ block: "start", behavior })
    return
  }
  target.parent.scrollTo({ top: target.top, behavior })
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

export function animateScrollSectionIntoView(
  section: HTMLElement,
  offset: number,
  onComplete?: () => void
): () => void {
  const target = sectionScrollTarget(section, offset)
  if (!target) {
    onComplete?.()
    return () => {}
  }
  const parent = target.parent
  const endTop = target.top
  const start = parent.scrollTop
  const delta = endTop - start
  if (Math.abs(delta) < 2) {
    parent.scrollTop = endTop
    onComplete?.()
    return () => {}
  }
  const durationMs = Math.min(1400, Math.max(560, Math.abs(delta) * 0.22))
  const raf = { id: 0 }
  const startedAt = performance.now()
  let settled = false

  function finish() {
    if (settled) {
      return
    }
    settled = true
    onComplete?.()
  }

  function step(now: number) {
    if (settled) {
      return
    }
    const t = Math.min(1, (now - startedAt) / durationMs)
    parent.scrollTop = start + delta * easeInOutCubic(t)
    if (t < 1) {
      raf.id = window.requestAnimationFrame(step)
      return
    }
    parent.scrollTop = endTop
    raf.id = window.requestAnimationFrame(finish)
  }

  raf.id = window.requestAnimationFrame(step)
  return () => {
    settled = true
    window.cancelAnimationFrame(raf.id)
  }
}
