import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveNotificationEmptyCopy } from "./notification-empty-copy.ts"

describe("resolveNotificationEmptyCopy", () => {
  it("celebrates that everything is read", () => {
    const copy = resolveNotificationEmptyCopy({
      readFilter: "unread",
      moduleLabel: null,
    })

    assert.deepEqual(copy, {
      title: "Todo al día",
      description: "No tienes notificaciones sin leer.",
    })
  })

  it("names the module scope in the unread empty state", () => {
    const copy = resolveNotificationEmptyCopy({
      readFilter: "unread",
      moduleLabel: "Finanzas",
    })

    assert.deepEqual(copy, {
      title: "Todo al día",
      description: "No tienes notificaciones sin leer en Finanzas.",
    })
  })

  it("explains a read filter with nothing read", () => {
    const copy = resolveNotificationEmptyCopy({
      readFilter: "read",
      moduleLabel: "Agenda",
    })

    assert.deepEqual(copy, {
      title: "Nada leído",
      description: "No tienes notificaciones leídas en Agenda.",
    })
  })

  it("switches the whole empty state to the selected module", () => {
    const copy = resolveNotificationEmptyCopy({
      readFilter: "all",
      moduleLabel: "Proyectos",
    })

    assert.deepEqual(copy, {
      title: "Sin avisos de Proyectos",
      description: "Cuando Proyectos tenga algo nuevo, aparecerá aquí.",
    })
  })

  it("falls back to the generic empty state", () => {
    const copy = resolveNotificationEmptyCopy({
      readFilter: "all",
      moduleLabel: null,
    })

    assert.deepEqual(copy, {
      title: "Sin notificaciones",
      description: "Cuando llegue algo, lo verás aquí.",
    })
  })
})
