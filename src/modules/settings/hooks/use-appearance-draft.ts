"use client"

import { useEffect, useRef, useState } from "react"

type AppearanceDraftOptions<T> = {
  /** La hoja está abierta. */
  open: boolean
  /** Valor guardado en el perfil. */
  savedValue: T
  /** Aplica el valor elegido al documento mientras la hoja está abierta. */
  applyPreview: (value: T) => void
}

/**
 * Borrador de un eje de Apariencia: el cambio se ve al elegirlo y se descarta al
 * cerrar la hoja, también cuando la cierra Atrás por la ruta, que no pasa por
 * `onOpenChange`. Cada apertura empieza desde lo guardado.
 */
export function useAppearanceDraft<T>({
  open,
  savedValue,
  applyPreview,
}: AppearanceDraftOptions<T>) {
  const [draft, setDraft] = useState<T | null>(null)
  const [wasOpen, setWasOpen] = useState(open)
  const previewAppliedRef = useRef(false)

  // Ajuste de estado durante el render: al abrir se tira el borrador anterior.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setDraft(null)
    }
  }

  useEffect(() => {
    if (open) {
      previewAppliedRef.current = true
      return
    }
    if (!previewAppliedRef.current) {
      return
    }
    previewAppliedRef.current = false
    applyPreview(savedValue)
  }, [applyPreview, open, savedValue])

  return {
    value: draft ?? savedValue,
    isDirty: draft !== null && draft !== savedValue,
    change(value: T) {
      setDraft(value)
      applyPreview(value)
    },
    revert() {
      setDraft(null)
      applyPreview(savedValue)
    },
    clear() {
      setDraft(null)
    },
  }
}
