import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { highlightSegments } from "@/src/modules/galleries/lib/highlight"

describe("resaltado de la búsqueda de la galería", () => {
  it("sin búsqueda deja el texto completo sin resaltar", () => {
    assert.deepEqual(highlightSegments("Botón primario", "   "), [
      { text: "Botón primario", isMatch: false },
    ])
  })

  it("resalta el fragmento que coincide y deja el resto igual", () => {
    assert.deepEqual(highlightSegments("Botón primario", "prim"), [
      { text: "Botón ", isMatch: false },
      { text: "prim", isMatch: true },
      { text: "ario", isMatch: false },
    ])
  })

  it("ignora mayúsculas y acentos igual que el filtro", () => {
    assert.deepEqual(highlightSegments("Botón primario", "BOTON"), [
      { text: "Botón", isMatch: true },
      { text: " primario", isMatch: false },
    ])
    assert.deepEqual(highlightSegments("Skeleton", "skeletón"), [
      { text: "Skeleton", isMatch: true },
    ])
  })

  it("resalta todas las apariciones", () => {
    assert.deepEqual(highlightSegments("Item de item", "item"), [
      { text: "Item", isMatch: true },
      { text: " de ", isMatch: false },
      { text: "item", isMatch: true },
    ])
  })

  it("deja el texto entero sin resaltar cuando no hay coincidencias", () => {
    assert.deepEqual(highlightSegments("Combobox", "zzz"), [
      { text: "Combobox", isMatch: false },
    ])
  })

  it("conserva las tildes del texto original al resaltar", () => {
    const segments = highlightSegments(
      "Configuración regional",
      "configuracion"
    )
    assert.deepEqual(segments, [
      { text: "Configuración", isMatch: true },
      { text: " regional", isMatch: false },
    ])
  })

  it("devuelve un solo trozo vacío cuando el texto está vacío", () => {
    assert.deepEqual(highlightSegments("", "item"), [
      { text: "", isMatch: false },
    ])
  })
})
