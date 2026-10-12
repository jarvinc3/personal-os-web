import { appToast } from "@/src/shared/lib/app-toast"
import type {
  FieldErrors,
  FieldValues,
  UseFormHandleSubmit,
} from "react-hook-form"

function collectFormErrorMessages(errors: FieldErrors): string[] {
  const messages: string[] = []
  for (const value of Object.values(errors)) {
    if (!value || typeof value !== "object") {
      continue
    }
    if ("message" in value && value.message) {
      messages.push(String(value.message))
      continue
    }
    messages.push(...collectFormErrorMessages(value as FieldErrors))
  }
  return messages
}

function focusFirstInvalidField() {
  if (typeof document === "undefined") {
    return
  }
  requestAnimationFrame(() => {
    const invalidField = document.querySelector<HTMLElement>(
      '[aria-invalid="true"]'
    )
    invalidField?.focus()
  })
}

export function createSheetSubmit<T extends FieldValues>(
  handleSubmit: UseFormHandleSubmit<T>
) {
  return (
    onValid: (values: T) => void | Promise<void>,
    onInvalid?: (errors: FieldErrors<T>) => void
  ) =>
    handleSubmit(onValid, (errors) => {
      const messages = collectFormErrorMessages(errors)
      const message =
        messages.length > 1
          ? `Revisa ${messages.length} campos`
          : (messages[0] ?? "Revisa los campos del formulario")
      appToast.error({ text1: message })
      onInvalid?.(errors)
      focusFirstInvalidField()
    })
}
