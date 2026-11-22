import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  galleryMatchesInCategory,
  groupGalleryMatches,
  searchGalleryComponents,
  searchGalleryComponentsInCategory,
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

describe("buscador dentro de una categoría", () => {
  it("sin búsqueda devuelve todas las fichas de la categoría", () => {
    const matches = searchGalleryComponentsInCategory("estados", "   ")
    assert.ok(matches.length > 0)
    assert.ok(matches.every((match) => match.doc.category === "estados"))
    assert.equal(matches.length, galleryMatchesInCategory("estados").length)
  })

  it("filtra las fichas de la categoría que coinciden", () => {
    const matches = searchGalleryComponentsInCategory("entradas", "combobox")
    assert.deepEqual(
      matches.map((match) => match.doc.name),
      ["Combobox"]
    )
  })

  it("no trae fichas de otras categorías aunque coincidan", () => {
    assert.deepEqual(
      searchGalleryComponentsInCategory("selectores", "item"),
      []
    )
    assert.ok(
      searchGalleryComponentsInCategory("listas", "item").length > 0,
      "Item sí está en listas"
    )
  })

  it("ignora acentos y mayúsculas", () => {
    assert.ok(
      searchGalleryComponentsInCategory("graficos", "GRAFICOS").length > 0
    )
  })

  it("devuelve vacío cuando nada coincide o la categoría no existe", () => {
    assert.deepEqual(searchGalleryComponentsInCategory("estados", "zzz"), [])
    assert.deepEqual(
      searchGalleryComponentsInCategory("inexistente", "item"),
      []
    )
  })
})
