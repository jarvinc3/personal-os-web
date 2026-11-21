import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { isWithinQuietHours } from "./quiet-hours.ts"

const OVERNIGHT = {
  enabled: true,
  start: "22:00",
  end: "08:00",
  timezone: "UTC",
}

describe("isWithinQuietHours", () => {
  it("no aplica con el horario silencioso apagado", () => {
    assert.equal(
      isWithinQuietHours({
        ...OVERNIGHT,
        enabled: false,
        now: new Date("2026-01-15T23:30:00Z"),
      }),
      false
    )
  })

  it("ignora un horario que no se puede leer", () => {
    const now = new Date("2026-01-15T23:30:00Z")

    assert.equal(
      isWithinQuietHours({ ...OVERNIGHT, start: "25:00", now }),
      false
    )
    assert.equal(isWithinQuietHours({ ...OVERNIGHT, end: "ocho", now }), false)
  })

  it("cubre la noche de un horario que cruza la medianoche", () => {
    assert.equal(
      isWithinQuietHours({
        ...OVERNIGHT,
        now: new Date("2026-01-15T23:30:00Z"),
      }),
      true
    )
    assert.equal(
      isWithinQuietHours({
        ...OVERNIGHT,
        now: new Date("2026-01-16T07:59:00Z"),
      }),
      true
    )
    assert.equal(
      isWithinQuietHours({
        ...OVERNIGHT,
        now: new Date("2026-01-16T08:00:00Z"),
      }),
      false
    )
    assert.equal(
      isWithinQuietHours({
        ...OVERNIGHT,
        now: new Date("2026-01-16T12:00:00Z"),
      }),
      false
    )
  })

  it("incluye el inicio y excluye el fin de una ventana diurna", () => {
    const window = {
      enabled: true,
      start: "09:00",
      end: "17:00",
      timezone: "UTC",
    }

    assert.equal(
      isWithinQuietHours({ ...window, now: new Date("2026-01-15T09:00:00Z") }),
      true
    )
    assert.equal(
      isWithinQuietHours({ ...window, now: new Date("2026-01-15T16:59:00Z") }),
      true
    )
    assert.equal(
      isWithinQuietHours({ ...window, now: new Date("2026-01-15T17:00:00Z") }),
      false
    )
  })

  it("trata un inicio igual al fin como todo el día", () => {
    assert.equal(
      isWithinQuietHours({
        ...OVERNIGHT,
        start: "10:00",
        end: "10:00",
        now: new Date("2026-01-15T03:00:00Z"),
      }),
      true
    )
  })

  it("usa la zona del perfil, no la del equipo", () => {
    const now = new Date("2026-01-15T16:30:00Z")
    const window = { enabled: true, start: "12:00", end: "14:00" }

    assert.equal(isWithinQuietHours({ ...window, timezone: "UTC", now }), false)
    assert.equal(
      isWithinQuietHours({
        ...window,
        timezone: "America/Santo_Domingo",
        now,
      }),
      true
    )
  })

  it("cae a la hora local cuando la zona es inválida", () => {
    assert.equal(
      isWithinQuietHours({
        ...OVERNIGHT,
        timezone: "No/Existe",
        now: new Date(2026, 0, 15, 23, 30),
      }),
      true
    )
  })
})
