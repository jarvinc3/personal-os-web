export type KeepAwakePhase =
  | "unsupported"
  | "idle"
  | "activating"
  | "active"
  | "pausing"
  | "paused"
  | "ending"
  | "interrupted"

export type KeepAwakePending = "activate" | "pause" | "resume" | "deactivate" | null

export type KeepAwakeSessionState = {
  sessionRequested: boolean
  lockHeld: boolean
  pending: KeepAwakePending
  startTimestamp: number | null
  endsAt: number | null
  userPaused: boolean
  pauseStartedAt: number | null
  accumulatedPauseMs: number
}

export type KeepAwakeSessionAction =
  | { type: "activate_started" }
  | { type: "activate_succeeded"; startTimestamp: number; endsAt: number | null }
  | { type: "activate_failed" }
  | { type: "pause_started" }
  | { type: "pause_succeeded"; pauseStartedAt: number }
  | { type: "resume_started" }
  | { type: "resume_succeeded"; accumulatedPauseMs: number; endsAt: number | null }
  | { type: "resume_failed" }
  | { type: "deactivate_started" }
  | { type: "deactivate_succeeded" }
  | { type: "lock_released" }
  | { type: "reacquire_succeeded" }
  | {
      type: "restore_succeeded"
      startTimestamp: number
      endsAt: number | null
      lockHeld?: boolean
      userPaused?: boolean
      pauseStartedAt?: number | null
      accumulatedPauseMs?: number
    }
  | { type: "remote_stopped" }

export const INITIAL_KEEP_AWAKE_SESSION: KeepAwakeSessionState = {
  sessionRequested: false,
  lockHeld: false,
  pending: null,
  startTimestamp: null,
  endsAt: null,
  userPaused: false,
  pauseStartedAt: null,
  accumulatedPauseMs: 0,
}

export function deriveKeepAwakePhase(input: {
  supportsWakeLock: boolean
  sessionRequested: boolean
  lockHeld: boolean
  pending: KeepAwakePending
  userPaused: boolean
}): KeepAwakePhase {
  if (!input.supportsWakeLock) return "unsupported"
  if (input.pending === "activate" || input.pending === "resume") return "activating"
  if (input.pending === "pause") return "pausing"
  if (input.pending === "deactivate") return "ending"
  if (input.userPaused && input.sessionRequested) return "paused"
  if (input.sessionRequested && input.lockHeld) return "active"
  if (input.sessionRequested && !input.lockHeld) return "interrupted"
  return "idle"
}

export function reduceKeepAwakeSession(
  state: KeepAwakeSessionState,
  action: KeepAwakeSessionAction
): KeepAwakeSessionState {
  switch (action.type) {
    case "activate_started":
      return { ...state, pending: "activate" }
    case "activate_succeeded":
      return {
        sessionRequested: true,
        lockHeld: true,
        pending: null,
        startTimestamp: action.startTimestamp,
        endsAt: action.endsAt,
        userPaused: false,
        pauseStartedAt: null,
        accumulatedPauseMs: 0,
      }
    case "restore_succeeded":
      return {
        sessionRequested: true,
        lockHeld: action.lockHeld ?? true,
        pending: null,
        startTimestamp: action.startTimestamp,
        endsAt: action.endsAt,
        userPaused: action.userPaused ?? false,
        pauseStartedAt: action.pauseStartedAt ?? null,
        accumulatedPauseMs: action.accumulatedPauseMs ?? 0,
      }
    case "activate_failed":
      return { ...INITIAL_KEEP_AWAKE_SESSION }
    case "pause_started":
      if (!state.sessionRequested) return state
      return { ...state, pending: "pause" }
    case "pause_succeeded":
      if (!state.sessionRequested) return state
      return {
        ...state,
        lockHeld: false,
        pending: null,
        userPaused: true,
        pauseStartedAt: action.pauseStartedAt,
      }
    case "resume_started":
      if (!state.sessionRequested || !state.userPaused) return state
      return { ...state, pending: "resume" }
    case "resume_succeeded":
      if (!state.sessionRequested) return state
      return {
        ...state,
        lockHeld: true,
        pending: null,
        userPaused: false,
        pauseStartedAt: null,
        accumulatedPauseMs: action.accumulatedPauseMs,
        endsAt: action.endsAt,
      }
    case "resume_failed":
      if (!state.sessionRequested) return state
      return { ...state, pending: null, lockHeld: false, userPaused: true }
    case "deactivate_started":
      return { ...state, pending: "deactivate" }
    case "deactivate_succeeded":
    case "remote_stopped":
      return { ...INITIAL_KEEP_AWAKE_SESSION }
    case "lock_released":
      if (!state.sessionRequested) return state
      return {
        ...state,
        lockHeld: false,
        pending: state.pending === "pause" ? state.pending : null,
      }
    case "reacquire_succeeded":
      if (!state.sessionRequested || state.userPaused) return state
      return { ...state, lockHeld: true, pending: null }
    default:
      return state
  }
}

export type KeepAwakeCopy = {
  label: string
  description: string
  toggleLabel: string
  togglePressed: boolean
  busy: boolean
  canToggle: boolean
  canEnd: boolean
}

export function getKeepAwakeCopy(
  phase: KeepAwakePhase,
  options: { supportsPip: boolean; countdown?: boolean }
): KeepAwakeCopy {
  const busy = phase === "activating" || phase === "pausing" || phase === "ending"
  const canToggle = phase !== "unsupported" && !busy
  const canEnd = phase === "active" || phase === "interrupted" || phase === "paused"

  switch (phase) {
    case "unsupported":
      return {
        label: "No disponible",
        description:
          "Este navegador no admite Wake Lock. Prueba un navegador reciente basado en Chromium, o Safari/Firefox actualizados.",
        toggleLabel: "Activar",
        togglePressed: false,
        busy: false,
        canToggle: false,
        canEnd: false,
      }
    case "activating":
      return {
        label: "Activando",
        description: "Solicitando el bloqueo de pantalla…",
        toggleLabel: "Activar",
        togglePressed: false,
        busy,
        canToggle,
        canEnd: false,
      }
    case "pausing":
      return {
        label: "Pausando",
        description: "Liberando el bloqueo. La sesión sigue en curso.",
        toggleLabel: "Pausar",
        togglePressed: true,
        busy,
        canToggle,
        canEnd: false,
      }
    case "ending":
      return {
        label: "Terminando",
        description: "Cerrando la sesión…",
        toggleLabel: "Terminar",
        togglePressed: true,
        busy,
        canToggle,
        canEnd: false,
      }
    case "paused":
      return {
        label: "Pausada",
        description:
          "Puedes continuar la misma sesión o terminarla. El tiempo queda congelado hasta que continúes.",
        toggleLabel: "Continuar",
        togglePressed: false,
        busy,
        canToggle,
        canEnd,
      }
    case "active":
      return {
        label: "Activo",
        description: options.countdown
          ? "La pantalla se mantiene despierta hasta que acabe el temporizador. Si ocultas la pestaña, el sistema puede liberar el bloqueo y lo reintentamos al volver."
          : options.supportsPip
            ? "La pantalla se mantiene despierta en esta ventana, también si cambias de sección en Personal OS. Si ocultas la pestaña, el sistema puede liberar el bloqueo y lo reintentamos al volver."
            : "La pantalla se mantiene despierta en esta ventana. El miniplayer no está disponible aquí; el bloqueo sigue en la pestaña.",
        toggleLabel: "Pausar",
        togglePressed: true,
        busy,
        canToggle,
        canEnd,
      }
    case "interrupted":
      return {
        label: "Reintentando",
        description:
          "El sistema liberó el bloqueo (pestaña oculta o política del navegador). Lo reintentamos al volver a esta ventana.",
        toggleLabel: "Pausar",
        togglePressed: true,
        busy,
        canToggle,
        canEnd,
      }
    default:
      return {
        label: "Inactivo",
        description: options.countdown
          ? "Elige una duración y activa. El bloqueo se suelta solo al terminar. Si la pestaña está oculta, el cierre puede retrasarse hasta que vuelvas."
          : options.supportsPip
            ? "Activa el bloqueo para evitar que la pantalla se apague. El cronómetro y el miniplayer quedan disponibles al activar."
            : "Activa el bloqueo para evitar que la pantalla se apague en esta ventana.",
        toggleLabel: "Activar",
        togglePressed: false,
        busy,
        canToggle,
        canEnd: false,
      }
  }
}

export function getPipActionLabel(pipOpen: boolean): string {
  return pipOpen ? "Enfocar miniplayer" : "Miniplayer"
}

export type TimerDisplay = {
  label: string
  seconds: number
  mode: "open" | "countdown"
}

export function getTimerDisplay(input: {
  endsAt: number | null
  elapsedSeconds: number
  remainingSeconds: number
}): TimerDisplay {
  if (input.endsAt != null) {
    return {
      label: "Quedan",
      seconds: input.remainingSeconds,
      mode: "countdown",
    }
  }
  return {
    label: "Tiempo",
    seconds: input.elapsedSeconds,
    mode: "open",
  }
}
