"use client"

import { useSyncExternalStore } from "react"

function subscribe(): () => void {
  return () => {}
}

function getClientSnapshot() {
  return true
}

function getServerSnapshot() {
  return false
}

/**
 * `false` hasta que React hidrata y `true` después. Sirve para dejar un
 * control deshabilitado en vez de perder el clic sin respuesta.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}
