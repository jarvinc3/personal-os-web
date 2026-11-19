import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveGmailStatus } from "./gmail-status.ts"
import type { AiEmailSyncProgress } from "./types/intelligence.types.ts"

const baseProgress: AiEmailSyncProgress = {
  status: "running",
  phase: "incremental",
  attempt: 1,
  processedThisRun: 4,
  importedThisRun: 2,
  startedAt: "2026-11-19T10:00:00.000Z",
  updatedAt: "2026-11-19T10:01:00.000Z",
}

const baseInput = {
  connected: true,
  requiresReconnect: false,
  oauthIncomplete: false,
  failure: null,
  progress: null,
  initialSyncCompletedAt: "2026-11-01T00:00:00.000Z",
  syncInProgress: false,
  lastSyncedAtLabel: "19 nov 2026, 10:01",
  nextRunLabel: null,
}

describe("resolveGmailStatus", () => {
  it("sin conectar pide conectar y no anuncia canal", () => {
    const status = resolveGmailStatus({ ...baseInput, connected: false })

    assert.equal(status.state, "disconnected")
    assert.equal(status.primaryAction, "connect")
    assert.equal(status.showsLiveChannel, false)
  })

  it("con el acceso vencido solo ofrece Reconectar y no anuncia canal", () => {
    const status = resolveGmailStatus({
      ...baseInput,
      requiresReconnect: true,
    })

    assert.equal(status.state, "access_expired")
    assert.equal(status.primaryAction, "reconnect")
    assert.equal(status.primaryLabel, "Reconectar")
    assert.equal(status.showsLiveChannel, false)
    assert.equal(status.tone, "warning")
  })

  it("con configuración incompleta no ofrece reconectar", () => {
    const status = resolveGmailStatus({
      ...baseInput,
      oauthIncomplete: true,
    })

    assert.equal(status.state, "error")
    assert.equal(status.primaryAction, null)
    assert.equal(status.showsLiveChannel, false)
  })

  it("un fallo que pide reconectar deja Reconectar como acción principal", () => {
    const status = resolveGmailStatus({
      ...baseInput,
      failure: {
        title: "Gmail rechazó el acceso",
        description: "Vuelve a autorizar la cuenta.",
        offerReconnect: true,
      },
    })

    assert.equal(status.state, "error")
    assert.equal(status.primaryAction, "reconnect")
  })

  it("un fallo sin reconexión deja Sincronizar como acción principal", () => {
    const status = resolveGmailStatus({
      ...baseInput,
      failure: {
        title: "La sincronización se quedó sin avance",
        description: "Puedes volver a sincronizar.",
        offerReconnect: false,
      },
    })

    assert.equal(status.primaryAction, "sync")
  })

  it("clasificando muestra el avance y no ofrece acción principal", () => {
    const status = resolveGmailStatus({
      ...baseInput,
      progress: {
        ...baseProgress,
        phase: "classifying",
        status: "running",
        processedThisRun: 3,
        totalEstimate: 10,
      },
    })

    assert.equal(status.state, "classifying")
    assert.equal(status.primaryAction, null)
    assert.match(status.description, /3 de 10/)
    assert.equal(status.showsLiveChannel, true)
  })

  it("clasificando sin total no inventa cifras", () => {
    const status = resolveGmailStatus({
      ...baseInput,
      progress: {
        ...baseProgress,
        phase: "classifying",
        status: "scheduled",
        totalEstimate: undefined,
      },
    })

    assert.equal(status.state, "classifying")
    assert.match(status.description, /se están clasificando/)
  })

  it("mientras sincroniza no ofrece acción principal", () => {
    const status = resolveGmailStatus({ ...baseInput, progress: baseProgress })

    assert.equal(status.state, "syncing")
    assert.equal(status.primaryAction, null)
    assert.match(status.description, /Buscando cambios nuevos/)
  })

  it("una espera de Gmail explica el reintento", () => {
    const status = resolveGmailStatus({
      ...baseInput,
      progress: { ...baseProgress, status: "waiting", attempt: 2 },
    })

    assert.equal(status.state, "syncing")
    assert.match(status.description, /Reintento 2 de 3/)
  })

  it("un lote programado dice cuándo sigue", () => {
    const status = resolveGmailStatus({
      ...baseInput,
      progress: { ...baseProgress, status: "scheduled" },
      nextRunLabel: "19 nov 2026, 10:15",
    })

    assert.equal(status.state, "syncing")
    assert.match(status.description, /previsto para 19 nov 2026, 10:15/)
  })

  it("sin progreso y sin histórico completo sigue sincronizando", () => {
    const status = resolveGmailStatus({
      ...baseInput,
      initialSyncCompletedAt: null,
    })

    assert.equal(status.state, "syncing")
    assert.match(status.description, /histórico/)
  })

  it("al día ofrece Sincronizar como acción principal", () => {
    const status = resolveGmailStatus(baseInput)

    assert.equal(status.state, "up_to_date")
    assert.equal(status.primaryAction, "sync")
    assert.equal(status.showsLiveChannel, true)
    assert.match(status.description, /Última sincronización 19 nov 2026, 10:01/)
  })
})
