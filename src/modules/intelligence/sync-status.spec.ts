import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  describeScheduledClassification,
  describeSyncFailure,
  describeSyncProgress,
  resolveDashboardSyncFailure,
  resolveSyncFailure,
  type SyncFailure,
} from "@/src/modules/intelligence/sync-status"
import type {
  AiEmailSyncProgress,
  IntelligenceDashboard,
} from "@/src/modules/intelligence/types/intelligence.types"

type ConnectedState = Extract<
  IntelligenceDashboard["connection"],
  { connected: true }
>

const connectedState = (
  overrides: Partial<ConnectedState> = {}
): ConnectedState => ({
  connected: true,
  emailAddress: "qa@example.com",
  initialSyncCompletedAt: "2026-10-24T00:00:00.000Z",
  syncInProgress: false,
  syncProgress: null,
  lastSyncedAt: "2026-10-30T12:00:00.000Z",
  lastRecoverySyncAt: null,
  lastSyncErrorCode: null,
  requiresReconnect: false,
  ...overrides,
})

const progress = (
  overrides: Partial<AiEmailSyncProgress> = {}
): AiEmailSyncProgress => ({
  status: "failed",
  phase: "incremental",
  attempt: 1,
  processedThisRun: 0,
  importedThisRun: 0,
  startedAt: "2026-10-30T12:00:00.000Z",
  updatedAt: "2026-10-30T12:05:00.000Z",
  ...overrides,
})

describe("estado de sincronización de Gmail", () => {
  it("muestra el progreso exacto de clasificación pendiente", () => {
    assert.equal(
      describeSyncProgress(
        progress({
          status: "running",
          phase: "classifying",
          processedThisRun: 120,
          totalEstimate: 4000,
        })
      ),
      "Clasificando correos pendientes · 120 de 4000."
    )
  })

  it("describe clasificación sin inventar cifras ausentes", () => {
    const missingEstimate = {
      ...progress({ status: "running", phase: "classifying" }),
      totalEstimate: undefined,
    } as AiEmailSyncProgress
    const missingProcessedCount = {
      ...progress({ status: "running", phase: "classifying" }),
      processedThisRun: undefined,
    } as unknown as AiEmailSyncProgress

    assert.equal(
      describeSyncProgress(missingEstimate),
      "Clasificando correos pendientes."
    )
    assert.equal(
      describeSyncProgress(missingProcessedCount),
      "Clasificando correos pendientes."
    )
  })

  it("explica que el atraso de clasificación seguirá en la próxima corrida", () => {
    assert.match(
      describeScheduledClassification(
        progress({
          status: "scheduled",
          errorCode: "classification_failed",
        })
      ) ?? "",
      /continuará en la próxima corrida.*correos que ya se importaron siguen disponibles/
    )
    assert.equal(
      describeScheduledClassification(
        progress({ status: "scheduled", errorCode: "other_error" })
      ),
      null
    )
  })

  it("prefiere el código del proveedor guardado para el reintento", () => {
    const failure = resolveSyncFailure({
      progress: progress({
        status: "waiting",
        errorCode: "rate_limit_retry_scheduled",
        providerErrorCode: "RESOURCE_EXHAUSTED",
      }),
      lastSyncErrorCode: null,
    })

    assert.equal(failure?.code, "RESOURCE_EXHAUSTED")
  })

  it("no inventa un fallo cuando no hay código", () => {
    assert.equal(
      resolveSyncFailure({ progress: null, lastSyncErrorCode: null }),
      null
    )
  })

  it("ignora un error viejo cuando el último intento terminó bien", () => {
    const completed = progress({ status: "completed" })

    assert.equal(
      resolveDashboardSyncFailure({
        connection: connectedState({
          lastSyncErrorCode: "http_500",
          syncProgress: completed,
        }),
        progress: completed,
      }),
      null
    )
  })

  it("usa el último error guardado cuando no hay progreso", () => {
    const failure = resolveDashboardSyncFailure({
      connection: connectedState({ lastSyncErrorCode: "invalid_grant" }),
      progress: null,
    })

    assert.equal(failure?.code, "invalid_grant")
  })

  it("no muestra fallos de una conexión cerrada", () => {
    assert.equal(
      resolveDashboardSyncFailure({
        connection: { connected: false },
        progress: null,
      }),
      null
    )
  })

  it("ofrece reconectar solo cuando Google rechazó la autorización", () => {
    const copy = describeSyncFailure({
      failure: {
        code: "invalid_grant",
        category: "authorization",
        occurredAt: "2026-10-30T12:05:00.000Z",
      },
      attemptedAt: "30 oct 2026, 12:05",
    })

    assert.equal(copy.title, "Gmail rechazó la autorización")
    assert.equal(copy.offerReconnect, true)
    assert.match(copy.description, /invalid_grant/)
    assert.match(copy.description, /30 oct 2026, 12:05/)
  })

  it("pide reconectar cuando la conexión lo requiere", () => {
    const copy = describeSyncFailure({
      failure: {
        code: "invalid_grant",
        category: "authorization",
        occurredAt: "2026-10-30T12:05:00.000Z",
      },
      attemptedAt: "30 oct 2026, 12:05",
      requiresReconnect: true,
    })

    assert.equal(copy.title, "Reconecta Gmail")
    assert.equal(copy.offerReconnect, true)
    assert.match(copy.description, /sincronización automática está detenida/)
  })

  it("no presenta reconectar como remedio para configuración o límite", () => {
    for (const failure of [
      {
        code: "gmail_oauth_not_configured",
        category: "configuration",
        occurredAt: null,
      },
      {
        code: "RESOURCE_EXHAUSTED",
        category: "rate_limit",
        occurredAt: null,
      },
    ] satisfies SyncFailure[]) {
      const copy = describeSyncFailure({ failure, attemptedAt: null })

      assert.equal(copy.offerReconnect, false)
      assert.match(copy.description, new RegExp(failure.code))
    }
  })

  it("distingue un reinicio del API de un fallo de Gmail", () => {
    const copy = describeSyncFailure({
      failure: {
        code: "worker_interrupted",
        category: "temporary",
        occurredAt: "2026-10-30T12:05:00.000Z",
      },
      attemptedAt: "30 oct 2026, 12:05",
    })

    assert.equal(copy.title, "La sincronización se interrumpió")
    assert.equal(copy.offerReconnect, false)
    assert.match(copy.description, /reinició/)
  })

  it("ofrece sincronizar de nuevo si se estanca, sin pedir reconexión", () => {
    const copy = describeSyncFailure({
      failure: {
        code: "sync_stalled",
        category: "temporary",
        occurredAt: "2026-10-30T12:05:00.000Z",
      },
      attemptedAt: "30 oct 2026, 12:05",
      requiresReconnect: false,
    })

    assert.equal(copy.title, "La sincronización se quedó sin avance")
    assert.equal(copy.offerReconnect, false)
    assert.match(copy.description, /volver a sincronizar/)
    assert.doesNotMatch(copy.description, /Reconecta Gmail/)
  })

  it("muestra el código y la hora cuando la causa es desconocida", () => {
    const copy = describeSyncFailure({
      failure: {
        code: "mystery_failure",
        category: "unknown",
        occurredAt: "2026-10-30T12:05:00.000Z",
      },
      attemptedAt: "30 oct 2026, 12:05",
    })

    assert.equal(copy.offerReconnect, false)
    assert.match(copy.description, /mystery_failure/)
    assert.match(copy.description, /30 oct 2026, 12:05/)
  })
})
