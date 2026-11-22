import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveNotificationsSocketUrl } from "./notifications-socket-url.ts"

describe("resolveNotificationsSocketUrl", () => {
  it("quita el prefijo del API de la base", () => {
    assert.equal(
      resolveNotificationsSocketUrl("https://api.test/api"),
      "https://api.test"
    )
  })

  it("acepta la base con barra final", () => {
    assert.equal(
      resolveNotificationsSocketUrl("https://api.test/api/"),
      "https://api.test"
    )
  })

  it("deja una base que ya viene sin prefijo", () => {
    assert.equal(
      resolveNotificationsSocketUrl("https://api.test"),
      "https://api.test"
    )
  })

  it("no recorta una ruta que solo se parece al prefijo", () => {
    assert.equal(
      resolveNotificationsSocketUrl("https://api.test/v1/api/messages"),
      "https://api.test/v1/api/messages"
    )
  })
})
