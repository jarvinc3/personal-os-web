export function findActiveMonthKey(
  sections: ReadonlyArray<{ key: string; top: number }>,
  marker: number,
): string | null {
  if (sections.length === 0) return null
  let active: string | null = null
  for (const section of sections) {
    if (section.top <= marker) {
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
    (document.scrollingElement as HTMLElement | null) ?? document.documentElement
  )
}

function sectionScrollTarget(section: HTMLElement, offset: number) {
  const parent = getScrollParent(section)
  if (!parent) return null
  const parentTop =
    parent === document.documentElement || parent === document.body
      ? 0
      : parent.getBoundingClientRect().top
  const delta = section.getBoundingClientRect().top - parentTop - offset
  return { parent, top: parent.scrollTop + delta }
}

export function scrollSectionIntoView(
  section: HTMLElement,
  offset: number,
  behavior: ScrollBehavior = "smooth",
) {
  const target = sectionScrollTarget(section, offset)
  if (!target) {
    section.scrollIntoView({ block: "start", behavior })
    return
  }
  target.parent.scrollTo({ top: target.top, behavior })
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

export function animateScrollSectionIntoView(
  section: HTMLElement,
  offset: number,
): () => void {
  const target = sectionScrollTarget(section, offset)
  if (!target) return () => {}
  const start = target.parent.scrollTop
  const delta = target.top - start
  if (Math.abs(delta) < 2) return () => {}
  const durationMs = Math.min(900, Math.max(480, Math.abs(delta) * 0.42))
  const raf = { id: 0 }
  const startedAt = performance.now()

  function step(now: number) {
    const t = Math.min(1, (now - startedAt) / durationMs)
    target.parent.scrollTop = start + delta * easeOutCubic(t)
    if (t < 1) {
      raf.id = window.requestAnimationFrame(step)
    }
  }

  raf.id = window.requestAnimationFrame(step)
  return () => window.cancelAnimationFrame(raf.id)
}
