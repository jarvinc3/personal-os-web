import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { filterLoadedMessages, messageStatusLabel } from "./message-filters.ts"

const messages = [
  {
    subject: "Consumo en Supermercado Nacional",
    fromAddress: "Alertas <alertas@bhd.com.do>",
    processingStatus: "PROCESSED",
  },
  {
    subject: "Transferencia recibida",
    fromAddress: "notificaciones@bhd.com.do",
    processingStatus: "REVIEW_REQUIRED",
  },
  {
    subject: "Newsletter de octubre",
    fromAddress: "hola@tienda.com",
    processingStatus: "FAILED",
  },
]

describe("messageStatusLabel", () => {
  it("traduce el estado y deja el código si no lo conoce", () => {
    assert.equal(messageStatusLabel("REVIEW_REQUIRED"), "En revisión")
    assert.equal(messageStatusLabel("OTRO"), "OTRO")
  })
})

describe("filterLoadedMessages", () => {
  it("sin texto ni estado devuelve todos los cargados", () => {
    assert.equal(
      filterLoadedMessages({ messages, query: "  ", status: "ALL" }).length,
      3
    )
  })

  it("busca por asunto sin distinguir mayúsculas", () => {
    const found = filterLoadedMessages({
      messages,
      query: "transferencia",
      status: "ALL",
    })

    assert.equal(found.length, 1)
    assert.equal(found[0].subject, "Transferencia recibida")
  })

  it("busca también por remitente", () => {
    const found = filterLoadedMessages({
      messages,
      query: "bhd.com.do",
      status: "ALL",
    })

    assert.equal(found.length, 2)
  })

  it("filtra por estado", () => {
    const found = filterLoadedMessages({
      messages,
      query: "",
      status: "FAILED",
    })

    assert.deepEqual(
      found.map((message) => message.subject),
      ["Newsletter de octubre"]
    )
  })

  it("combina texto y estado", () => {
    const found = filterLoadedMessages({
      messages,
      query: "bhd",
      status: "PROCESSED",
    })

    assert.deepEqual(
      found.map((message) => message.subject),
      ["Consumo en Supermercado Nacional"]
    )
  })

  it("sin coincidencias devuelve una lista vacía", () => {
    assert.deepEqual(
      filterLoadedMessages({ messages, query: "inexistente", status: "ALL" }),
      []
    )
  })
})
