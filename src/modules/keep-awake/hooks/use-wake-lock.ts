"use client"

import {
  KEEP_AWAKE_CHANNEL_NAME,
  KEEP_AWAKE_STORAGE_KEY,
  parseSessionRecord,
} from "@/src/modules/keep-awake/lib/session-storage"
import {
  deriveKeepAwakePhase,
  getTimerDisplay,
  INITIAL_KEEP_AWAKE_SESSION,
  type KeepAwakePhase,
  type KeepAwakeSessionState,
  type TimerDisplay,
} from "@/src/modules/keep-awake/lib/session-status"
import {
  classifyWakeLockError,
  wakeLockFailureMessage,
} from "@/src/modules/keep-awake/lib/wake-lock-error"
import {
  createWakeLockSession,
  type ActivateOptions,
  type WakeLockHandle,
  type WakeLockSession,
} from "@/src/modules/keep-awake/lib/wake-lock-session"
import {
  getPipMountNode,
  isDocumentPipSupported,
  isWakeLockSupported,
  openDocumentPip,
  watchVisibility,
} from "@/src/modules/keep-awake/lib/document-pip"
import {
  durationMsFromMinutes,
  KEEP_AWAKE_PREFS_KEY,
  parsePrefs,
} from "@/src/modules/keep-awake/lib/prefs"
import {
  formatElapsed,
  sessionElapsedSeconds,
  sessionRemainingSeconds,
} from "@/src/modules/keep-awake/lib/format-elapsed"
import { appToast } from "@/src/shared/lib/app-toast"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

const emptySubscribe = () => () => {}

function getPipSupportSnapshot() {
  return isDocumentPipSupported()
}

function getWakeLockSupportSnapshot() {
  return isWakeLockSupported()
}

function getServerSupportSnapshot() {
  return false
}

function createOwnerId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `tab-${Math.random().toString(36).slice(2)}`
}

function wrapSentinel(sentinel: WakeLockSentinel): WakeLockHandle {
  return {
    get released() {
      return sentinel.released
    },
    release: () => sentinel.release(),
    addEventListener: (type, listener) => {
      sentinel.addEventListener(type, listener)
    },
    removeEventListener: (type, listener) => {
      sentinel.removeEventListener(type, listener)
    },
  }
}

function durationFromPrefs(): ActivateOptions | undefined {
  if (typeof window === "undefined") {
    return undefined
  }
  const prefs = parsePrefs(window.localStorage.getItem(KEEP_AWAKE_PREFS_KEY))
  if (prefs.timerMode !== "countdown") {
    return undefined
  }
  return { durationMs: durationMsFromMinutes(prefs.durationMinutes) }
}

function toastWakeLockFailure(
  error: unknown,
  fallback?: ReturnType<WakeLockSession["getLastFailure"]>
) {
  const kind = fallback ?? classifyWakeLockError(error)
  const copy = wakeLockFailureMessage(kind ?? "unknown")
  appToast.error({ text1: copy.title, text2: copy.description })
}

export type UseWakeLockResult = {
  phase: KeepAwakePhase
  active: boolean
  lockHeld: boolean
  elapsedSeconds: number
  remainingSeconds: number
  startTimestamp: number | null
  endsAt: number | null
  timerDisplay: TimerDisplay
  pipOpen: boolean
  pipMount: HTMLElement | null
  supportsPip: boolean
  supportsWakeLock: boolean
  activate: (options?: ActivateOptions) => Promise<void>
  deactivate: () => Promise<void>
  end: () => Promise<void>
  toggle: (options?: ActivateOptions) => Promise<void>
  copyElapsed: () => Promise<void>
  openPip: () => Promise<void>
  focusPip: () => void
  closePip: () => void
  openOrFocusPip: () => Promise<void>
}

export function useWakeLock(): UseWakeLockResult {
  const [sessionState, setSessionState] = useState<KeepAwakeSessionState>(
    INITIAL_KEEP_AWAKE_SESSION
  )
  const [, setElapsedTick] = useState(0)
  const [pipOpen, setPipOpen] = useState(false)
  const [pipMount, setPipMount] = useState<HTMLElement | null>(null)

  const supportsPip = useSyncExternalStore(
    emptySubscribe,
    getPipSupportSnapshot,
    getServerSupportSnapshot
  )
  const supportsWakeLock = useSyncExternalStore(
    emptySubscribe,
    getWakeLockSupportSnapshot,
    getServerSupportSnapshot
  )

  const ownerIdRef = useRef<string | null>(null)
  const sessionRef = useRef<WakeLockSession | null>(null)
  const pipWindowRef = useRef<Window | null>(null)

  if (ownerIdRef.current === null) {
    ownerIdRef.current = createOwnerId()
  }

  useEffect(() => {
    const ownerId = ownerIdRef.current ?? createOwnerId()
    ownerIdRef.current = ownerId

    const currentNav = (): Navigator => {
      const pip = pipWindowRef.current
      if (pip && !pip.closed) {
        return pip.navigator
      }
      return navigator
    }

    const channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(KEEP_AWAKE_CHANNEL_NAME)
        : null

    const session = createWakeLockSession({
      ownerId,
      isSupported: () => isWakeLockSupported(currentNav()),
      requestWakeLock: async () => {
        const nav = currentNav()
        if (!isWakeLockSupported(nav)) {
          throw Object.assign(new Error("Wake Lock is not supported"), {
            name: "NotSupportedError",
          })
        }
        const sentinel = await nav.wakeLock.request("screen")
        return wrapSentinel(sentinel)
      },
      storage: window.localStorage,
      broadcast: (message) => channel?.postMessage(message),
      onChange: setSessionState,
    })
    sessionRef.current = session

    const restoreTimer = window.setTimeout(() => {
      void session.restoreIfNeeded()
    }, 0)

    const unwatch = watchVisibility(document, () => {
      if (session.getState().sessionRequested) {
        void session.stopIfCountdownElapsed().then(() => {
          if (session.getState().sessionRequested) {
            void session.tryReacquire()
          }
        })
      } else {
        void session.restoreIfNeeded()
      }
    })

    const onChannelMessage = (event: MessageEvent) => {
      void session.handleRemoteMessage(event.data)
    }
    channel?.addEventListener("message", onChannelMessage)

    const onStorage = (event: StorageEvent) => {
      if (event.key !== KEEP_AWAKE_STORAGE_KEY) {
        return
      }
      if (event.newValue === null) {
        void session.handleRemoteMessage({ type: "stop", ownerId: "remote" })
        return
      }
      const record = parseSessionRecord(event.newValue)
      if (!record) {
        return
      }
      void session.handleRemoteMessage({
        type: "claim",
        ownerId: record.ownerId || "remote",
        startTimestamp: record.startTimestamp,
      })
    }
    window.addEventListener("storage", onStorage)

    return () => {
      window.clearTimeout(restoreTimer)
      unwatch()
      channel?.removeEventListener("message", onChannelMessage)
      channel?.close()
      window.removeEventListener("storage", onStorage)
      if (pipWindowRef.current && !pipWindowRef.current.closed) {
        pipWindowRef.current.close()
      }
      pipWindowRef.current = null
      sessionRef.current = null
      void session.dispose()
    }
  }, [])

  useEffect(() => {
    if (
      !sessionState.sessionRequested ||
      sessionState.startTimestamp === null
    ) {
      return
    }

    const id = window.setInterval(() => {
      setElapsedTick((tick) => tick + 1)
      const session = sessionRef.current
      if (!session) {
        return
      }
      const wasRequested = session.getState().sessionRequested
      void session.stopIfCountdownElapsed().then(() => {
        if (wasRequested && !session.getState().sessionRequested) {
          appToast.info({
            text1: "Temporizador terminado",
            text2: "La pantalla ya puede apagarse.",
          })
        }
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [
    sessionState.sessionRequested,
    sessionState.startTimestamp,
    sessionState.endsAt,
  ])

  const elapsedSeconds = sessionElapsedSeconds(sessionState)
  const remainingSeconds = sessionRemainingSeconds(sessionState)
  const timerDisplay = getTimerDisplay({
    endsAt: sessionState.endsAt,
    elapsedSeconds,
    remainingSeconds,
  })

  const phase = deriveKeepAwakePhase({
    supportsWakeLock,
    sessionRequested: sessionState.sessionRequested,
    lockHeld: sessionState.lockHeld,
    pending: sessionState.pending,
    userPaused: sessionState.userPaused,
  })

  const activate = async (options?: ActivateOptions) => {
    const session = sessionRef.current
    if (!session) {
      return
    }
    if (!supportsWakeLock) {
      toastWakeLockFailure(null, "unsupported")
      return
    }
    try {
      await session.activate(options ?? durationFromPrefs())
    } catch (error) {
      toastWakeLockFailure(error, session.getLastFailure())
    }
  }

  const end = async () => {
    await sessionRef.current?.end()
  }

  const deactivate = async () => {
    await end()
  }

  const toggle = async (options?: ActivateOptions) => {
    const session = sessionRef.current
    if (!session) {
      return
    }
    if (!supportsWakeLock && !session.getState().sessionRequested) {
      toastWakeLockFailure(null, "unsupported")
      return
    }
    try {
      await session.toggle(options ?? durationFromPrefs())
    } catch (error) {
      toastWakeLockFailure(error, session.getLastFailure())
    }
  }

  const copyElapsed = async () => {
    const text = formatElapsed(elapsedSeconds)
    try {
      await navigator.clipboard.writeText(text)
      appToast.success({ text1: "Duración copiada", text2: text })
    } catch {
      appToast.error({ text1: "No se pudo copiar", text2: text })
    }
  }

  const openPip = async () => {
    if (!isDocumentPipSupported()) {
      appToast.warning({
        text1: "Miniplayer no disponible",
        text2:
          "Document Picture-in-Picture no está disponible en este navegador. El bloqueo sigue funcionando en esta pestaña.",
      })
      return
    }

    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.focus()
      return
    }

    try {
      const pipWindow = await openDocumentPip()
      pipWindowRef.current = pipWindow
      setPipMount(getPipMountNode(pipWindow))
      setPipOpen(true)

      const session = sessionRef.current
      if (
        session?.getState().sessionRequested &&
        !session.getState().userPaused
      ) {
        await session.releaseHeldLock()
        await session.tryReacquire()
      }

      const unwatch = watchVisibility(pipWindow.document, () => {
        if (sessionRef.current?.getState().sessionRequested) {
          void sessionRef.current.tryReacquire()
        } else {
          void sessionRef.current?.restoreIfNeeded()
        }
      })

      pipWindow.addEventListener("pagehide", () => {
        unwatch()
        pipWindowRef.current = null
        setPipMount(null)
        setPipOpen(false)

        const current = sessionRef.current
        if (
          current?.getState().sessionRequested &&
          !current.getState().userPaused
        ) {
          void current.releaseHeldLock().then(() => current.tryReacquire())
        }
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo abrir"
      appToast.error({ text1: "Miniplayer", text2: message })
    }
  }

  const focusPip = () => {
    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.focus()
    }
  }

  const closePip = () => {
    pipWindowRef.current?.close()
  }

  const openOrFocusPip = async () => {
    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      focusPip()
      return
    }
    await openPip()
  }

  return {
    phase,
    active: sessionState.sessionRequested,
    lockHeld: sessionState.lockHeld,
    elapsedSeconds,
    remainingSeconds,
    startTimestamp: sessionState.startTimestamp,
    endsAt: sessionState.endsAt,
    timerDisplay,
    pipOpen,
    pipMount,
    supportsPip,
    supportsWakeLock,
    activate,
    deactivate,
    end,
    toggle,
    copyElapsed,
    openPip,
    focusPip,
    closePip,
    openOrFocusPip,
  }
}
