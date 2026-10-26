"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  readPickerKey,
  resolvePickerNavigation,
} from "@/src/shared/lib/sheet-navigation"

type PickerState<TPicker extends string> = {
  picker: TPicker
  openPicker: (next: TPicker) => void
  /** Handler para `onOpenChange`: solo atiende el cierre de esa hoja. */
  closeHandlerFor: (current: TPicker) => (isOpen: boolean) => void
}

/**
 * Una sola hoja abierta a la vez, con su clave en la URL (`?picker=`), para que
 * Atrás cierre solo el selector y el formulario que lo contiene no pierda lo
 * escrito. `closePicker` ignora el cierre de una hoja que ya fue reemplazada.
 */
const pushedPickerByPath = new Map<string, boolean>()

export function usePicker<TPicker extends string>(
  closed: TPicker
): PickerState<TPicker> {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const active = (readPickerKey(searchParams) ?? closed) as TPicker

  function navigate(next: TPicker, open: boolean) {
    const decision = resolvePickerNavigation({
      pathname,
      searchParams,
      key: next,
      open,
      wasPushed: pushedPickerByPath.get(pathname) === true,
    })
    switch (decision.action) {
      case "noop":
        return
      case "push":
        pushedPickerByPath.set(pathname, true)
        router.push(decision.url, { scroll: false })
        return
      case "replace":
        router.replace(decision.url, { scroll: false })
        return
      case "back":
        pushedPickerByPath.delete(pathname)
        router.back()
    }
  }

  function openPicker(next: TPicker) {
    navigate(next, true)
  }

  function closePicker(current: TPicker) {
    if (active !== current) {
      return
    }
    navigate(current, false)
  }

  function closeHandlerFor(current: TPicker) {
    return (isOpen: boolean) => {
      if (!isOpen) {
        closePicker(current)
      }
    }
  }

  return { picker: active, openPicker, closeHandlerFor }
}
