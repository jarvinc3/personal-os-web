'use client'

import { useEffect, useRef, useState } from 'react'

type ScrollDirection = 'up' | 'down'

const THRESHOLD = 10

export function useScrollDirection() {
  const [direction, setDirection] = useState<ScrollDirection>('up')
  const [atTop, setAtTop] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    let ticking = false

    function onScroll() {
      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        const y = window.scrollY
        setAtTop(y < 10)

        if (Math.abs(y - lastY.current) > THRESHOLD) {
          setDirection(y > lastY.current ? 'down' : 'up')
          lastY.current = y
        }

        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const hidden = direction === 'down' && !atTop

  return { direction, atTop, hidden }
}
