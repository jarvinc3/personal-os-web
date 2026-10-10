"use client"

import { useState } from "react"

type PickerState<TPicker extends string> = {
  picker: TPicker
  openPicker: (next: TPicker) => void
  /** Handler para `onOpenChange`: solo atiende el cierre de esa hoja. */
  closeHandlerFor: (current: TPicker) => (isOpen: boolean) => void
}

/**
 * Una sola hoja abierta a la vez. `closePicker` ignora el cierre de una hoja
 * que ya fue reemplazada por otra.
 */
export function usePicker<TPicker extends string>(
  closed: TPicker
): PickerState<TPicker> {
  const [picker, setPicker] = useState<TPicker>(closed)

  function openPicker(next: TPicker) {
    setPicker(next)
  }

  function closePicker(current: TPicker) {
    setPicker((active) => (active === current ? closed : active))
  }

  function closeHandlerFor(current: TPicker) {
    return (isOpen: boolean) => {
      if (!isOpen) {
        closePicker(current)
      }
    }
  }

  return { picker, openPicker, closeHandlerFor }
}
