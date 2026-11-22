import assert from "node:assert/strict"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

import {
  GALLERY_COMPONENT_METAS,
  GALLERY_METAS_BY_CATEGORY,
} from "./components/catalog/manifest.ts"
import {
  COMPONENT_GALLERY_SECTIONS,
  componentGallerySection,
  isComponentGallerySectionId,
  type ComponentGallerySectionId,
} from "./components/sections.ts"

const COMPONENTS_ROOT = join(
  dirname(fileURLToPath(import.meta.url)),
  "components"
)
const REPO_ROOT = join(COMPONENTS_ROOT, "../../../..")
const UI_DIR = join(REPO_ROOT, "src/shared/components/ui")
const DEMOS_DIR = join(COMPONENTS_ROOT, "catalog/demos")

/** Archivo de demos de cada categoría; el id no comparte nombre con el archivo. */
const DEMO_FILES: Record<ComponentGallerySectionId, string> = {
  entradas: "entradas.tsx",
  selectores: "selectores.tsx",
  acciones: "acciones.tsx",
  overlays: "overlays.tsx",
  tabs: "tabs.tsx",
  listas: "listas.tsx",
  encabezados: "encabezados.tsx",
  estados: "estados.tsx",
  avisos: "avisos.tsx",
  montos: "montos.tsx",
  graficos: "graficos.tsx",
  estructura: "estructura.tsx",
}

/** Claves de primer nivel del mapa de demos, en el orden del archivo. */
function demoIdsInFile(file: string): string[] {
  const source = readFileSync(join(DEMOS_DIR, file), "utf8")
  const marker = "GalleryDemoMap = {"
  const start = source.indexOf(marker)
  assert.ok(start >= 0, `${file} no declara un GalleryDemoMap`)
  const mapSource = source.slice(start + marker.length)
  const matches = mapSource.matchAll(/^ {2}"?([a-z0-9-]+)"?:\s*\[/gm)
  return [...matches].map((match) => match[1])
}

/** Cada bloque de demo con su id, para revisar su código sin cargar React. */
function demoBlocks(file: string): { id: string; body: string }[] {
  const source = readFileSync(join(DEMOS_DIR, file), "utf8")
  const marker = "GalleryDemoMap = {"
  const start = source.indexOf(marker)
  assert.ok(start >= 0, `${file} no declara un GalleryDemoMap`)
  const mapSource = source.slice(start + marker.length)
  const entries = [...mapSource.matchAll(/^ {2}"?([a-z0-9-]+)"?:\s*\[/gm)]

  return entries.map((entry, index) => {
    const from = entry.index ?? 0
    const nextEntry = entries[index + 1]
    const to = nextEntry?.index ?? mapSource.length

    return { id: entry[1], body: mapSource.slice(from, to) }
  })
}

function importPathExists(importPath: string): boolean {
  const relative = importPath.replace(/^@\//, "")
  const resolved = join(REPO_ROOT, relative)
  return [
    `${resolved}.ts`,
    `${resolved}.tsx`,
    join(resolved, "index.ts"),
    join(resolved, "index.tsx"),
  ].some((candidate) => existsSync(candidate))
}

test("la galería tiene una categoría por propósito", () => {
  assert.equal(COMPONENT_GALLERY_SECTIONS.length, 12)
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
      "estructura",
    ]
  )
})

test("cada categoría tiene título, descripción, icono y fichas", () => {
  const ids = new Set<string>()
  for (const section of COMPONENT_GALLERY_SECTIONS) {
    assert.ok(section.title.length > 0, `${section.id} sin título`)
    assert.ok(section.description.length > 0, `${section.id} sin descripción`)
    assert.ok(section.icon, `${section.id} sin icono`)
    assert.ok(
      GALLERY_METAS_BY_CATEGORY[section.id].length > 0,
      `${section.id} sin fichas`
    )
    assert.ok(!ids.has(section.id), `sección repetida: ${section.id}`)
    ids.add(section.id)
  }
})

test("cada ficha tiene los metadatos completos y una ruta real", () => {
  const ids = new Set<string>()
  for (const doc of GALLERY_COMPONENT_METAS) {
    assert.ok(doc.id.length > 0, "ficha sin id")
    assert.ok(doc.name.length > 0, `${doc.id} sin nombre`)
    assert.ok(
      isComponentGallerySectionId(doc.category),
      `${doc.id} sin categoría`
    )
    assert.equal(
      componentGallerySection(doc.category).id,
      doc.category,
      `${doc.id} con categoría distinta`
    )
    assert.ok(doc.description.length > 0, `${doc.id} sin descripción`)
    assert.ok(doc.whenToUse.length > 0, `${doc.id} sin cuándo usarlo`)
    assert.ok(doc.whenNotToUse.length > 0, `${doc.id} sin cuándo no`)
    assert.ok(doc.snippet.length > 0, `${doc.id} sin snippet`)
    assert.ok(doc.anatomy.length > 0, `${doc.id} sin anatomía`)
    assert.ok(doc.variants.length > 0, `${doc.id} sin variantes`)
    assert.ok(doc.props.length > 0, `${doc.id} sin props`)
    assert.ok(
      importPathExists(doc.importPath),
      `${doc.id} apunta a un archivo que no existe: ${doc.importPath}`
    )
    assert.ok(!ids.has(doc.id), `ficha repetida: ${doc.id}`)
    ids.add(doc.id)
  }
})

test("los demos declarados son los de cada categoría", () => {
  for (const section of COMPONENT_GALLERY_SECTIONS) {
    assert.deepEqual(
      demoIdsInFile(DEMO_FILES[section.id]),
      GALLERY_METAS_BY_CATEGORY[section.id].map((doc) => doc.id),
      `los demos de ${section.id} no coinciden con ${DEMO_FILES[section.id]}`
    )
  }
})

test("todos los archivos de /ui/ están documentados", () => {
  const uiComponents = readdirSync(UI_DIR)
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => file.replace(/\.tsx$/, ""))

  for (const name of uiComponents) {
    const importPath = `@/src/shared/components/ui/${name}`
    assert.ok(
      GALLERY_COMPONENT_METAS.some((doc) => doc.importPath === importPath),
      `falta la ficha de ${name}`
    )
  }
})

test("resuelve una categoría por su id y rechaza las demás", () => {
  assert.equal(componentGallerySection("entradas").title, "Entradas y campos")
  assert.equal(isComponentGallerySectionId("estructura"), true)
  assert.equal(isComponentGallerySectionId("inexistente"), false)
  assert.throws(
    () => componentGallerySection("inexistente" as "entradas"),
    /Sección de la galería desconocida/
  )
})

test("cada demo trae el código exacto de lo que pinta", () => {
  for (const section of COMPONENT_GALLERY_SECTIONS) {
    for (const block of demoBlocks(DEMO_FILES[section.id])) {
      const codes = [...block.body.matchAll(/code:\s*`([\s\S]*?)`/g)]
      assert.ok(
        codes.length > 0,
        `${section.id}/${block.id} no declara el código de su demo`
      )
      for (const [, code] of codes) {
        assert.ok(
          code.trim().length > 0,
          `${section.id}/${block.id} sin código`
        )
        assert.ok(
          !/^<[A-Za-z]+Demo\s*\/>$/.test(code.trim()),
          `${section.id}/${block.id} muestra el ayudante en vez del componente`
        )
        assert.ok(
          !code.includes("GALLERY_"),
          `${section.id}/${block.id} usa constantes internas de la galería`
        )
      }
    }
  }
})

test("cada ficha declara su anatomía con nombres", () => {
  for (const meta of GALLERY_COMPONENT_METAS) {
    assert.ok(meta.anatomy.length > 0, `${meta.id} sin anatomía`)
    for (const root of meta.anatomy) {
      assert.ok(
        root.name.trim().length > 0,
        `${meta.id} tiene un nodo sin nombre`
      )
    }
  }
})
