"use client"

import { KEEP_AWAKE_STORAGE_KEY } from "@/src/modules/keep-awake/constants/storage"
import {
    getPipMountNode,
    isDocumentPipSupported,
    isWakeLockSupported,
    openDocumentPip,
    watchVisibility,
} from "@/src/modules/keep-awake/lib/document-pip"
import { elapsedSecondsSince } from "@/src/modules/keep-awake/lib/format-elapsed"
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

export function useWakeLock() {
  const [active, setActive] = useState(false)
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
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

  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const pipWindowRef = useRef<Window | null>(null)
  const activeRef = useRef(false)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  function currentNav(): Navigator {
    const pip = pipWindowRef.current
    if (pip && !pip.closed) return pip.navigator
    return navigator
  }

  function attachReleaseHandler(sentinel: WakeLockSentinel) {
    sentinel.addEventListener("release", () => {
      if (activeRef.current) {
        wakeLockRef.current = null
      }
    })
  }

  async function tryReacquire(nav: Navigator = currentNav()) {
    if (!activeRef.current || wakeLockRef.current !== null) return
    if (!isWakeLockSupported(nav)) return
    try {
      const sentinel = await nav.wakeLock.request("screen")
      wakeLockRef.current = sentinel
      attachReleaseHandler(sentinel)
    } catch {
      /* retry on next visibilitychange */
    }
  }

  function markActive(ts: number) {
    activeRef.current = true
    setActive(true)
    setStartTimestamp(ts)
    setElapsedSeconds(elapsedSecondsSince(ts))
  }

  function markInactive() {
    activeRef.current = false
    setActive(false)
    setStartTimestamp(null)
    setElapsedSeconds(0)
  }

  async function activate() {
    const nav = currentNav()
    if (!isWakeLockSupported(nav)) {
      appToast.error({
        text1: "No disponible",
        text2: "Este navegador no soporta Wake Lock API.",
      })
      return
    }

    try {
      const sentinel = await nav.wakeLock.request("screen")
      wakeLockRef.current = sentinel
      const ts = Date.now()
      localStorage.setItem(KEEP_AWAKE_STORAGE_KEY, String(ts))
      markActive(ts)
      attachReleaseHandler(sentinel)
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo activar"
      appToast.error({ text1: "Error", text2: message })
    }
  }

  async function deactivate() {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
      } catch {
        /* already released */
      }
      wakeLockRef.current = null
    }
    localStorage.removeItem(KEEP_AWAKE_STORAGE_KEY)
    markInactive()
  }

  async function toggle() {
    if (activeRef.current) {
      await deactivate()
    } else {
      await activate()
    }
  }

  async function restoreIfNeeded() {
    const saved = localStorage.getItem(KEEP_AWAKE_STORAGE_KEY)
    if (!saved || activeRef.current) return

    const ts = Number(saved)
    if (!Number.isFinite(ts)) return

    try {
      const nav = currentNav()
      if (!isWakeLockSupported(nav)) return
      const sentinel = await nav.wakeLock.request("screen")
      wakeLockRef.current = sentinel
      activeRef.current = true
      setActive(true)
      setStartTimestamp(ts)
      setElapsedSeconds(elapsedSecondsSince(ts))
      attachReleaseHandler(sentinel)
    } catch {
      /* tab not visible yet — key kept for visibilitychange retry */
    }
  }

  async function openPip() {
    if (!isDocumentPipSupported()) {
      appToast.warning({
        text1: "Miniplayer no disponible",
        text2:
          "Usa Chrome, Edge o Firefox recientes, o abre esta pestaña en una ventana aparte.",
      })
      return
    }

    if (pipWindowRef.current && !pipWindowRef.current.closed) return

    try {
      const pipWindow = await openDocumentPip()
      pipWindowRef.current = pipWindow
      setPipMount(getPipMountNode(pipWindow))
      setPipOpen(true)

      if (activeRef.current) {
        if (wakeLockRef.current) {
          try {
            await wakeLockRef.current.release()
          } catch {
            /* ignore */
          }
          wakeLockRef.current = null
        }
        await tryReacquire(pipWindow.navigator)
      }

      const unwatch = watchVisibility(pipWindow.document, () => {
        if (activeRef.current) {
          void tryReacquire(pipWindow.navigator)
        } else {
          void restoreIfNeeded()
        }
      })

      pipWindow.addEventListener("pagehide", () => {
        unwatch()
        pipWindowRef.current = null
        setPipMount(null)
        setPipOpen(false)

        if (activeRef.current) {
          if (wakeLockRef.current) {
            void wakeLockRef.current.release().catch(() => {})
            wakeLockRef.current = null
          }
          void tryReacquire(navigator)
        }
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo abrir"
      appToast.error({ text1: "Miniplayer", text2: message })
    }
  }

  useEffect(() => {
    // Defer restore so setState runs outside the effect body (react-hooks/set-state-in-effect).
    const restoreTimer = window.setTimeout(() => {
      void restoreIfNeeded()
    }, 0)

    const unwatch = watchVisibility(document, () => {
      if (activeRef.current) {
        void tryReacquire(navigator)
      } else {
        void restoreIfNeeded()
      }
    })

    return () => {
      window.clearTimeout(restoreTimer)
      unwatch()
      if (wakeLockRef.current) {
        void wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only bootstrap
  }, [])

  useEffect(() => {
    if (!active || startTimestamp === null) return

    const id = window.setInterval(() => {
      setElapsedSeconds(elapsedSecondsSince(startTimestamp))
    }, 1000)
    return () => window.clearInterval(id)
  }, [active, startTimestamp])

  return {
    active,
    elapsedSeconds,
    pipOpen,
    pipMount,
    supportsPip,
    supportsWakeLock,
    activate,
    deactivate,
    toggle,
    openPip,
  }
}
