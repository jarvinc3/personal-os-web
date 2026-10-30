import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  describeSyncFailure,
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
    const copy = describeSyncFailure(
      {
        code: "invalid_grant",
        category: "authorization",
        occurredAt: "2026-10-30T12:05:00.000Z",
      },
      "30 oct 2026, 12:05"
    )

    assert.equal(copy.offerReconnect, true)
    assert.match(copy.description, /invalid_grant/)
    assert.match(copy.description, /30 oct 2026, 12:05/)
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
      const copy = describeSyncFailure(failure, null)

      assert.equal(copy.offerReconnect, false)
      assert.match(copy.description, new RegExp(failure.code))
    }
  })

  it("distingue un reinicio del API de un fallo de Gmail", () => {
    const copy = describeSyncFailure(
      {
        code: "worker_interrupted",
        category: "temporary",
        occurredAt: "2026-10-30T12:05:00.000Z",
      },
      "30 oct 2026, 12:05"
    )

    assert.equal(copy.title, "La sincronización se interrumpió")
    assert.equal(copy.offerReconnect, false)
    assert.match(copy.description, /reinició/)
  })

  it("muestra el código y la hora cuando la causa es desconocida", () => {
    const copy = describeSyncFailure(
      {
        code: "mystery_failure",
        category: "unknown",
        occurredAt: "2026-10-30T12:05:00.000Z",
      },
      "30 oct 2026, 12:05"
    )

    assert.equal(copy.offerReconnect, false)
    assert.match(copy.description, /mystery_failure/)
    assert.match(copy.description, /30 oct 2026, 12:05/)
  })
})
