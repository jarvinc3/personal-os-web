import { toast } from "sonner"
import type { ReactNode } from "react"

type ToastAction = {
  label: ReactNode
  onClick: () => void
}

type ToastPayload = {
  text1: string
  text2?: string
  action?: ToastAction
  duration?: number
}

function toastOptions({
  text2,
  action,
  duration,
}: Omit<ToastPayload, "text1">) {
  return {
    description: text2,
    ...(action
      ? { action: { label: action.label, onClick: action.onClick } }
      : {}),
    ...(duration !== undefined ? { duration } : {}),
  }
}

export const appToast = {
  success({ text1, ...rest }: ToastPayload) {
    toast.success(text1, toastOptions(rest))
  },
  error({ text1, ...rest }: ToastPayload) {
    toast.error(text1, toastOptions(rest))
  },
  info({ text1, ...rest }: ToastPayload) {
    toast.info(text1, toastOptions(rest))
  },
  warning({ text1, ...rest }: ToastPayload) {
    toast.warning(text1, toastOptions(rest))
  },
}
