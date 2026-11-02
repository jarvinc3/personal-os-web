import type {
  AiEmailSyncProgress,
  IntelligenceDashboard,
} from "./types/intelligence.types"

export type SyncFailure = {
  code: string
  category: AiEmailSyncProgress["errorCategory"]
  occurredAt: string | null
}

export type SyncFailureCopy = {
  title: string
  description: string
  offerReconnect: boolean
}

export function describeSyncProgress(progress: AiEmailSyncProgress): string {
  if (progress.phase === "classifying") {
    return typeof progress.processedThisRun === "number" &&
      typeof progress.totalEstimate === "number"
      ? `Clasificando correos pendientes · ${progress.processedThisRun} de ${progress.totalEstimate}.`
      : "Clasificando correos pendientes."
  }

  if (progress.phase === "bootstrap") {
    return `Leyendo el histórico desde el 1 de enero de 2026 · ${progress.processedThisRun} correos procesados, ${progress.importedThisRun} importados en este lote${progress.totalEstimate ? ` · ${progress.totalEstimate} estimados en total` : ""}.`
  }

  if (progress.phase === "recovery") {
    return `Recuperando el cursor y leyendo correos · ${progress.processedThisRun} procesados, ${progress.importedThisRun} importados.`
  }

  return `Buscando cambios nuevos · ${progress.processedThisRun} procesados, ${progress.importedThisRun} importados.`
}

export function describeScheduledClassification(
  progress: AiEmailSyncProgress
): string | null {
  return progress.status === "scheduled" &&
    progress.errorCode === "classification_failed"
    ? "La clasificación tuvo un problema y continuará en la próxima corrida. Los correos que ya se importaron siguen disponibles."
    : null
}

type SyncFailureInput = {
  progress: AiEmailSyncProgress | null
  lastSyncErrorCode: string | null
}

type ConnectionState = IntelligenceDashboard["connection"]

type DashboardFailureInput = {
  connection: ConnectionState
  progress: AiEmailSyncProgress | null
}

export function resolveDashboardSyncFailure({
  connection,
  progress,
}: DashboardFailureInput): SyncFailure | null {
  if (!connection.connected) {
    return null
  }
  if (progress) {
    return progress.status === "failed"
      ? resolveSyncFailure({
          progress,
          lastSyncErrorCode: connection.lastSyncErrorCode,
        })
      : null
  }
  if (!connection.lastSyncErrorCode) {
    return null
  }
  return resolveSyncFailure({
    progress: null,
    lastSyncErrorCode: connection.lastSyncErrorCode,
  })
}

export function resolveSyncFailure({
  progress,
  lastSyncErrorCode,
}: SyncFailureInput): SyncFailure | null {
  const code =
    progress?.providerErrorCode ?? progress?.errorCode ?? lastSyncErrorCode
  if (!code) {
    return null
  }
  return {
    code,
    category: progress?.errorCategory,
    occurredAt: progress?.updatedAt ?? null,
  }
}

export function describeSyncFailure({
  failure,
  attemptedAt,
  requiresReconnect = false,
}: {
  failure: SyncFailure
  attemptedAt: string | null
  requiresReconnect?: boolean
}): SyncFailureCopy {
  const at = attemptedAt ? ` el ${attemptedAt}` : ""
  if (failure.code === "sync_stalled") {
    return {
      title: "La sincronización se quedó sin avance",
      description: `No se detectó progreso en Gmail${at}. Puedes volver a sincronizar; no hace falta reconectar Gmail.`,
      offerReconnect: false,
    }
  }

  if (failure.code === "worker_interrupted") {
    return {
      title: "La sincronización se interrumpió",
      description: `El API se reinició mientras sincronizaba${at}. El próximo ciclo puede reanudarla; no hace falta reconectar.`,
      offerReconnect: false,
    }
  }

  switch (failure.category) {
    case "authorization": {
      const rejection = `Google rechazó el acceso${at} con el código ${failure.code}.`
      return requiresReconnect
        ? {
            title: "Reconecta Gmail",
            description: `${rejection} La sincronización automática está detenida hasta que reconectes Gmail.`,
            offerReconnect: true,
          }
        : {
            title: "Gmail rechazó la autorización",
            description: `${rejection} Usa Reconectar Gmail para renovar la autorización.`,
            offerReconnect: true,
          }
    }
    case "configuration":
      return {
        title: "Falta configuración OAuth",
        description: `El backend no completó la configuración de Gmail${at} (código ${failure.code}). No reconectes: revisa las variables y reinicia el API.`,
        offerReconnect: false,
      }
    case "rate_limit":
      return {
        title: "Gmail alcanzó su límite temporal",
        description: `Gmail limitó las solicitudes${at} (código ${failure.code}). El reintento automático seguirá; no hace falta reconectar.`,
        offerReconnect: false,
      }
    case "temporary":
      return {
        title: "Gmail no respondió",
        description: `Gmail o la red no respondieron${at} (código ${failure.code}). Reintenta; no hace falta reconectar.`,
        offerReconnect: false,
      }
    default:
      return {
        title: "No se pudo determinar la causa",
        description: `No se pudo determinar la causa${at}. Código: ${failure.code}. Reintenta en unos minutos; no hace falta reconectar.`,
        offerReconnect: false,
      }
  }
}
