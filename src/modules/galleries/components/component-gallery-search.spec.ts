import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  searchComponentGallerySections,
  type ComponentGallerySectionMatch,
} from "@/src/modules/galleries/components/component-gallery-search"

function sectionIds(
  matches: readonly ComponentGallerySectionMatch[]
): string[] {
  return matches.map((match) => match.section.id)
}

describe("buscador de la galería de componentes", () => {
  it("sin búsqueda devuelve todas las categorías sin coincidencias", () => {
    const matches = searchComponentGallerySections("   ")
    assert.equal(matches.length, 11)
    assert.ok(matches.every((match) => match.matchedDemos.length === 0))
  })

  it("encuentra una categoría por su título sin acentos ni mayúsculas", () => {
    assert.deepEqual(sectionIds(searchComponentGallerySections("GRAFICOS")), [
      "graficos",
    ])
    assert.deepEqual(sectionIds(searchComponentGallerySections("dialogos")), [
      "overlays",
    ])
  })

  it("encuentra un componente por su nombre y dice cuáles coinciden", () => {
    const [match] = searchComponentGallerySections("FormTextField")
    assert.equal(match?.section.id, "entradas")
    assert.deepEqual(match?.matchedDemos, ["FormTextField"])
  })

  it("devuelve todas las fichas coincidentes de una categoría", () => {
    const [match] = searchComponentGallerySections("button")
    assert.equal(match?.section.id, "acciones")
    assert.deepEqual(match?.matchedDemos, [
      "Button",
      "Button",
      "Button",
      "Button asChild",
    ])
  })

  it("no devuelve nada cuando no hay coincidencias", () => {
    assert.deepEqual(searchComponentGallerySections("zzz"), [])
  })
})
