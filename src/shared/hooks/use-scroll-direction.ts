'use client'

import { useEffect, useRef, useState } from 'react'

type ScrollDirection = 'up' | 'down'

const THRESHOLD = 10

export function useScrollDirection(element: HTMLElement | null = null) {
  const [direction, setDirection] = useState<ScrollDirection>('up')
  const [atTop, setAtTop] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    let ticking = false

    function getY() {
      return element ? element.scrollTop : window.scrollY
    }

    function onScroll() {
      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        const y = getY()
        setAtTop(y < 10)

        if (Math.abs(y - lastY.current) > THRESHOLD) {
          setDirection(y > lastY.current ? 'down' : 'up')
          lastY.current = y
        }

        ticking = false
      })
    }

    lastY.current = getY()
    setAtTop(lastY.current < 10)
    setDirection('up')

    const target: EventTarget = element ?? window
    target.addEventListener('scroll', onScroll, { passive: true })
    return () => target.removeEventListener('scroll', onScroll)
  }, [element])

  const hidden = direction === 'down' && !atTop

  return { direction, atTop, hidden }
}
