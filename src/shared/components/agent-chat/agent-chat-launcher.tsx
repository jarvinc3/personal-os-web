"use client"

import { SparklesIcon } from "lucide-react"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { Button } from "@/src/shared/components/ui/button"

export type AgentChatLaunchOptions = {
  suggestionId?: string
}

type AgentChatLaunch = (options?: AgentChatLaunchOptions) => void
type AgentChatRegister = (launch: AgentChatLaunch) => () => void

type AgentChatLauncherValue = {
  available: boolean
  launch: AgentChatLaunch
  register: AgentChatRegister
}

const AgentChatLauncherContext = createContext<AgentChatLauncherValue | null>(
  null
)

const MISSING_PROVIDER = "AgentChatLauncherProvider is missing"

/**
 * Fuera del shell autenticado no hay host del agente: los controles se ocultan
 * con `available: false`. Si alguien intenta usarlo igual, falla en el acto en
 * vez de simular que abrió el overlay.
 */
const UNAVAILABLE_LAUNCHER: AgentChatLauncherValue = {
  available: false,
  launch: () => {
    throw new Error(MISSING_PROVIDER)
  },
  register: () => {
    throw new Error(MISSING_PROVIDER)
  },
}

/**
 * El shell pide abrir el overlay y el host de Inteligencia registra cómo.
 * Así el tab bar, el FAB y las hojas no importan el feature.
 */
export function AgentChatLauncherProvider({
  children,
}: {
  children: ReactNode
}) {
  const [launcher, setLauncher] = useState<AgentChatLaunch | null>(null)
  const pending = useRef<AgentChatLaunchOptions | null>(null)

  const register = useCallback<AgentChatRegister>((next) => {
    setLauncher(() => next)
    const queued = pending.current
    if (queued) {
      pending.current = null
      next(queued)
    }
    return () => {
      setLauncher((current: AgentChatLaunch | null) =>
        current === next ? null : current
      )
    }
  }, [])

  const launch = useCallback<AgentChatLaunch>(
    (options) => {
      if (launcher) {
        launcher(options)
        return
      }
      pending.current = options ?? {}
    },
    [launcher]
  )

  const value = useMemo(
    () => ({ available: launcher !== null, launch, register }),
    [launch, launcher, register]
  )

  return (
    <AgentChatLauncherContext.Provider value={value}>
      {children}
    </AgentChatLauncherContext.Provider>
  )
}

export function useAgentChatLauncher(): AgentChatLauncherValue {
  return useContext(AgentChatLauncherContext) ?? UNAVAILABLE_LAUNCHER
}

export function AgentChatTriggerButton({
  label = "Preguntar al agente",
  className,
}: {
  label?: string
  className?: string
}) {
  const { available, launch } = useAgentChatLauncher()

  if (!available) {
    return null
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={label}
      data-agent-chat-opener=""
      onClick={(event) => {
        event.currentTarget.focus()
        launch()
      }}
      className={className}
    >
      <SparklesIcon />
    </Button>
  )
}
