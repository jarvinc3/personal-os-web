import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  groupGalleryMatches,
  searchGalleryComponents,
} from "@/src/modules/galleries/components/catalog/search"

describe("buscador de la galería de componentes", () => {
  it("sin búsqueda devuelve todas las fichas", () => {
    const matches = searchGalleryComponents("   ")
    assert.ok(matches.length > 0)
    assert.equal(matches[0]?.category.id, "entradas")
  })

  it("encuentra una ficha por su nombre", () => {
    const matches = searchGalleryComponents("Combobox")
    assert.equal(matches.length, 1)
    assert.equal(matches[0]?.doc.name, "Combobox")
    assert.equal(matches[0]?.doc.category, "entradas")
  })

  it("encuentra por categoría sin acentos ni mayúsculas", () => {
    const matches = searchGalleryComponents("GRAFICOS")
    assert.ok(matches.length > 0)
    assert.ok(
      matches.every((match) => match.doc.category === "graficos"),
      "todas las coincidencias deben ser de gráficos"
    )
  })

  it("encuentra por ruta de importación", () => {
    const matches = searchGalleryComponents("ui/item")
    assert.equal(matches[0]?.doc.name, "Item")
  })

  it("agrupa por categoría en el orden de la galería", () => {
    const groups = groupGalleryMatches(searchGalleryComponents(""))
    assert.deepEqual(
      groups.map((group) => group.category.id),
      [
        "entradas",
        "selectores",
        "acciones",
        "overlays",
        "tabs",
        "listas",
        "encabezados",
        "estados",
        "avisos",
        "montos",
        "graficos",
        "estructura",
      ]
    )
  })

  it("no devuelve nada cuando no hay coincidencias", () => {
    assert.deepEqual(searchGalleryComponents("zzz"), [])
  })
})
