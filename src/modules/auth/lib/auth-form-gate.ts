const PREPARING_LABEL = "Preparando…"

export type AuthFormLockInput = {
  hydrated: boolean
  isPending: boolean
}

export type AuthFormGateInput = AuthFormLockInput & {
  isGooglePending: boolean
  idleLabel: string
  pendingLabel: string
}

export type AuthFormGate = {
  isLocked: boolean
  primaryLabel: string
  primaryBusy: boolean
}

/**
 * Antes de hidratar, el HTML ya trae el formulario pero sin handlers: el clic
 * se perdería en silencio. Se deshabilita hasta que la página esté lista.
 */
export function isAuthFormLocked({
  hydrated,
  isPending,
}: AuthFormLockInput): boolean {
  return !hydrated || isPending
}

export function resolveAuthFormGate({
  hydrated,
  isPending,
  isGooglePending,
  idleLabel,
  pendingLabel,
}: AuthFormGateInput): AuthFormGate {
  if (!hydrated) {
    return {
      isLocked: true,
      primaryLabel: PREPARING_LABEL,
      primaryBusy: true,
    }
  }

  if (isPending) {
    return { isLocked: true, primaryLabel: pendingLabel, primaryBusy: true }
  }

  return {
    isLocked: isGooglePending,
    primaryLabel: idleLabel,
    primaryBusy: false,
  }
}
