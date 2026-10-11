"use client"

import { PipPanel } from "@/src/modules/keep-awake/components/pip-panel"
import {
  useWakeLock,
  type UseWakeLockResult,
} from "@/src/modules/keep-awake/hooks/use-wake-lock"
import { createContext, useContext, type ReactNode } from "react"
import { createPortal } from "react-dom"

const KeepAwakeContext = createContext<UseWakeLockResult | null>(null)

export function KeepAwakeProvider({ children }: { children: ReactNode }) {
  const value = useWakeLock()

  return (
    <KeepAwakeContext.Provider value={value}>
      {children}
      {value.pipOpen && value.pipMount
        ? createPortal(
            <PipPanel
              phase={value.phase}
              timerDisplay={value.timerDisplay}
              onToggle={() => void value.toggle()}
            />,
            value.pipMount
          )
        : null}
    </KeepAwakeContext.Provider>
  )
}

export function useKeepAwake() {
  const context = useContext(KeepAwakeContext)
  if (!context) {
    throw new Error("useKeepAwake must be used within KeepAwakeProvider")
  }
  return context
}
