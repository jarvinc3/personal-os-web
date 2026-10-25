import assert from "node:assert/strict"
import { test } from "node:test"

import { COMPONENT_GALLERY_SECTIONS } from "./sections.ts"

test("la galería monta las once secciones del issue #307", () => {
  assert.equal(COMPONENT_GALLERY_SECTIONS.length, 11)
  assert.deepEqual(
    COMPONENT_GALLERY_SECTIONS.map((section) => section.id),
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
    ]
  )
})

test("cada sección tiene título, descripción e icono propio", () => {
  const ids = new Set<string>()
  for (const section of COMPONENT_GALLERY_SECTIONS) {
    assert.ok(section.title.length > 0, `${section.id} sin título`)
    assert.ok(section.description.length > 0, `${section.id} sin descripción`)
    assert.ok(section.icon, `${section.id} sin icono`)
    assert.ok(!ids.has(section.id), `sección repetida: ${section.id}`)
    ids.add(section.id)
  }
})
