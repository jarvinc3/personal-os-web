import type { SyncFailureCopy } from "@/src/modules/intelligence/sync-status"
import { describeSyncProgress } from "@/src/modules/intelligence/sync-status"
import type { AiEmailSyncProgress } from "@/src/modules/intelligence/types/intelligence.types"

export type GmailState =
  | "disconnected"
  | "access_expired"
  | "error"
  | "classifying"
  | "syncing"
  | "up_to_date"

/** La acción principal de la tarjeta; nunca es vaciar ni resincronizar. */
export type GmailPrimaryAction = "connect" | "reconnect" | "sync"

export type GmailStatus = {
  state: GmailState
  title: string
  description: string
  primaryAction: GmailPrimaryAction | null
  primaryLabel: string | null
  /** El canal de actualizaciones solo se anuncia cuando la conexión está sana. */
  showsLiveChannel: boolean
  tone: "warning" | "info" | undefined
}

/** Intentos que hace la sincronización antes de esperar al próximo ciclo. */
const SYNC_RETRY_ATTEMPTS = 3

export const GMAIL_PRIMARY_ACTION_LABELS: Record<GmailPrimaryAction, string> = {
  connect: "Conectar Gmail",
  reconnect: "Reconectar",
  sync: "Sincronizar",
}

type GmailStatusInput = {
  connected: boolean
  requiresReconnect: boolean
  oauthIncomplete: boolean
  failure: SyncFailureCopy | null
  progress: AiEmailSyncProgress | null
  initialSyncCompletedAt: string | null
  syncInProgress: boolean
  lastSyncedAtLabel: string | null
  nextRunLabel: string | null
}

/**
 * Un solo estado visible para la conexión de Gmail. El orden manda: primero lo
 * que impide importar, después lo que está corriendo y al final la calma. Así
 * la tarjeta nunca dice «al día» y «vencida» a la vez.
 */
export function resolveGmailStatus({
  connected,
  requiresReconnect,
  oauthIncomplete,
  failure,
  progress,
  initialSyncCompletedAt,
  syncInProgress,
  lastSyncedAtLabel,
  nextRunLabel,
}: GmailStatusInput): GmailStatus {
  if (!connected) {
    return {
      state: "disconnected",
      title: "Gmail sin conectar",
      description: "Conecta una cuenta para importar y revisar tus mensajes.",
      primaryAction: "connect",
      primaryLabel: GMAIL_PRIMARY_ACTION_LABELS.connect,
      showsLiveChannel: false,
      tone: undefined,
    }
  }

  if (requiresReconnect) {
    return {
      state: "access_expired",
      title: "El acceso a Gmail venció",
      description:
        "Google pidió autorizar la cuenta otra vez. Los correos ya importados siguen disponibles y la importación se detiene hasta reconectar.",
      primaryAction: "reconnect",
      primaryLabel: GMAIL_PRIMARY_ACTION_LABELS.reconnect,
      showsLiveChannel: false,
      tone: "warning",
    }
  }

  if (oauthIncomplete) {
    return {
      state: "error",
      title: "Falta configuración de Gmail",
      description:
        "El backend no tiene completas las variables de Gmail, así que la importación automática no puede correr. No hace falta reconectar: revisa la configuración y reinicia el API.",
      primaryAction: null,
      primaryLabel: null,
      showsLiveChannel: false,
      tone: "warning",
    }
  }

  if (failure) {
    return {
      state: "error",
      title: failure.title,
      description: failure.description,
      primaryAction: failure.offerReconnect ? "reconnect" : "sync",
      primaryLabel: failure.offerReconnect
        ? GMAIL_PRIMARY_ACTION_LABELS.reconnect
        : GMAIL_PRIMARY_ACTION_LABELS.sync,
      showsLiveChannel: false,
      tone: "warning",
    }
  }

  if (
    progress?.phase === "classifying" &&
    (progress.status === "running" || progress.status === "scheduled")
  ) {
    const advance =
      typeof progress.totalEstimate === "number"
        ? `${progress.processedThisRun} de ${progress.totalEstimate} correos procesados en este lote.`
        : "Los correos importados se están clasificando."
    return {
      state: "classifying",
      title: "Clasificando correos pendientes",
      description: `${advance} El contador de importados no cambia hasta que termine.`,
      primaryAction: null,
      primaryLabel: null,
      showsLiveChannel: true,
      tone: "info",
    }
  }

  if (isSyncing({ progress, syncInProgress, initialSyncCompletedAt })) {
    return {
      state: "syncing",
      title: "Sincronizando correo",
      description: syncingDescription({ progress, nextRunLabel }),
      primaryAction: null,
      primaryLabel: null,
      showsLiveChannel: true,
      tone: "info",
    }
  }

  return {
    state: "up_to_date",
    title: "Gmail al día",
    description: lastSyncedAtLabel
      ? `Última sincronización ${lastSyncedAtLabel}. Los correos nuevos se importan solos.`
      : "Todavía no hay una sincronización registrada.",
    primaryAction: "sync",
    primaryLabel: GMAIL_PRIMARY_ACTION_LABELS.sync,
    showsLiveChannel: true,
    tone: undefined,
  }
}

function isSyncing({
  progress,
  syncInProgress,
  initialSyncCompletedAt,
}: {
  progress: AiEmailSyncProgress | null
  syncInProgress: boolean
  initialSyncCompletedAt: string | null
}): boolean {
  if (syncInProgress) {
    return true
  }
  if (!progress) {
    return !initialSyncCompletedAt
  }
  return (
    progress.status === "running" ||
    progress.status === "waiting" ||
    progress.status === "retrying" ||
    progress.status === "scheduled"
  )
}

function syncingDescription({
  progress,
  nextRunLabel,
}: {
  progress: AiEmailSyncProgress | null
  nextRunLabel: string | null
}): string {
  if (!progress) {
    return "Leyendo el histórico de Gmail. Puedes seguir usando la vista mientras termina."
  }
  if (progress.status === "waiting") {
    return `Gmail pidió una pausa temporal. Reintento ${progress.attempt} de ${SYNC_RETRY_ATTEMPTS}.`
  }
  if (progress.status === "retrying") {
    return `Enviando reintento a Gmail · intento ${progress.attempt} de ${SYNC_RETRY_ATTEMPTS}.`
  }
  if (progress.status === "scheduled") {
    return nextRunLabel
      ? `La importación continúa sola; el siguiente lote está previsto para ${nextRunLabel}.`
      : "La importación continúa sola en el próximo lote programado."
  }
  return describeSyncProgress(progress)
}
