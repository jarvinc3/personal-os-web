import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"
import ts from "typescript"

import {
  COMPONENT_GALLERY_SECTIONS,
  componentGallerySection,
  isComponentGallerySectionId,
  type ComponentGallerySectionId,
} from "./sections.ts"

const SECTIONS_ROOT = join(dirname(fileURLToPath(import.meta.url)), "sections")

/** Archivo que pinta cada sección; el id no comparte nombre con el archivo. */
const SECTION_FILES: Record<ComponentGallerySectionId, string> = {
  entradas: "entries-section.tsx",
  selectores: "selectors-section.tsx",
  acciones: "actions-section.tsx",
  overlays: "overlays-section.tsx",
  tabs: "tabs-section.tsx",
  listas: "lists-section.tsx",
  encabezados: "headings-section.tsx",
  estados: "states-section.tsx",
  avisos: "notices-section.tsx",
  montos: "money-and-dates-section.tsx",
  graficos: "charts-section.tsx",
}

/** Nombre de cada `GalleryDemo`, en el orden del archivo. */
function demoNamesInFile(file: string): string[] {
  const source = readFileSync(join(SECTIONS_ROOT, file), "utf8")
  const names: string[] = []
  const visit = (node: ts.Node): void => {
    if (
      ts.isJsxElement(node) &&
      node.openingElement.tagName.getText() === "GalleryDemo"
    ) {
      const nameAttribute = node.openingElement.attributes.properties.find(
        (property): property is ts.JsxAttribute =>
          ts.isJsxAttribute(property) && property.name.getText() === "name"
      )
      const initializer = nameAttribute?.initializer
      if (initializer && ts.isStringLiteral(initializer)) {
        names.push(initializer.text)
      }
      if (
        initializer &&
        ts.isJsxExpression(initializer) &&
        initializer.expression &&
        ts.isStringLiteral(initializer.expression)
      ) {
        names.push(initializer.expression.text)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(
    ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    )
  )
  return names
}

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

test("cada sección tiene título, descripción, icono y fichas propias", () => {
  const ids = new Set<string>()
  for (const section of COMPONENT_GALLERY_SECTIONS) {
    assert.ok(section.title.length > 0, `${section.id} sin título`)
    assert.ok(section.description.length > 0, `${section.id} sin descripción`)
    assert.ok(section.icon, `${section.id} sin icono`)
    assert.ok(section.demos.length > 0, `${section.id} sin fichas`)
    assert.ok(!ids.has(section.id), `sección repetida: ${section.id}`)
    ids.add(section.id)
  }
})

test("las fichas declaradas son las que pinta cada sección", () => {
  for (const section of COMPONENT_GALLERY_SECTIONS) {
    assert.deepEqual(
      demoNamesInFile(SECTION_FILES[section.id]),
      section.demos,
      `los nombres de ${section.id} no coinciden con ${SECTION_FILES[section.id]}`
    )
  }
})

test("las fichas de las once secciones suman 45", () => {
  assert.equal(
    COMPONENT_GALLERY_SECTIONS.reduce(
      (total, section) => total + section.demos.length,
      0
    ),
    45
  )
})

test("resuelve una sección por su id y rechaza las demás", () => {
  assert.equal(componentGallerySection("entradas").title, "Entradas y campos")
  assert.equal(isComponentGallerySectionId("graficos"), true)
  assert.equal(isComponentGallerySectionId("inexistente"), false)
  assert.throws(
    () => componentGallerySection("inexistente" as "entradas"),
    /Sección de la galería desconocida/
  )
})
