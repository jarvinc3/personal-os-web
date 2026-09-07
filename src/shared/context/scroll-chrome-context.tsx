"use client"

import { useScrollDirection } from "@/src/shared/hooks/use-scroll-direction"
import {
  createContext,
  useContext,
  type ReactNode,
} from "react"

type ScrollChromeValue = {
  hidden: boolean
  atTop: boolean
}

const ScrollChromeContext = createContext<ScrollChromeValue>({
  hidden: false,
  atTop: true,
})

export function ScrollChromeProvider({
  children,
  scrollElement,
}: {
  children: ReactNode
  scrollElement: HTMLElement | null
}) {
  const value = useScrollDirection(scrollElement)
  return (
    <ScrollChromeContext.Provider value={value}>
      {children}
    </ScrollChromeContext.Provider>
  )
}

export function useScrollChrome() {
  return useContext(ScrollChromeContext)
}
