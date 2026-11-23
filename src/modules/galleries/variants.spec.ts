import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

import { GALLERY_METAS_BY_CATEGORY } from "./components/catalog/manifest.ts"
import type { ComponentGallerySectionId } from "./components/sections.ts"

const DEMOS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "components/catalog/demos"
)

/** Categorías que ya pintan sus variantes; crece una ola por issue. */
const COVERED_CATEGORIES: readonly ComponentGallerySectionId[] = [
  "acciones",
  "avisos",
  "tabs",
  "listas",
  "encabezados",
  "estados",
  "montos",
  "graficos",
  "estructura",
]

/** Claves de primer nivel del mapa de variantes: el id de cada ficha. */
const FICHA_KEY = /^ {2}"?([a-z0-9-]+)"?:\s*\{/gm

/** Claves de segundo nivel: el nombre del grupo, simple o entre comillas. */
const GROUP_KEY = /^ {4}(?:"([^"]+)"|([A-Za-z_$][\w$]*)):\s*\[/gm

const LABEL = /label: "([^"]*)"/g

/**
 * Cada ejemplo de variante vive en el mapa paralelo a los demos, en el mismo
 * archivo de su categoría. Se lee el fuente y no el módulo: montar los demos
 * carga React y no hace falta para revisar la estructura.
 */
function variantSource(category: ComponentGallerySectionId): string {
  const file = `${category}.tsx`
  const source = readFileSync(join(DEMOS_DIR, file), "utf8")
  const marker = `${category}VariantDemos: GalleryVariantDemoMap = {`
  const start = source.indexOf(marker)
  assert.ok(start >= 0, `${file} no declara ${marker}`)
  return source.slice(start + marker.length)
}

/** Bloques de una clave, desde la clave hasta la siguiente. */
function keyedBlocks(source: string, key: RegExp): Map<string, string> {
  const matches = [...source.matchAll(key)]
  const blocks = new Map<string, string>()

  matches.forEach((match, index) => {
    const from = match.index ?? 0
    const to = matches[index + 1]?.index ?? source.length
    blocks.set(match[1] ?? match[2], source.slice(from, to))
  })

  return blocks
}

test("cada ficha cubierta pinta cada grupo de variantes con su etiqueta", () => {
  for (const category of COVERED_CATEGORIES) {
    const fichas = keyedBlocks(variantSource(category), FICHA_KEY)

    for (const meta of GALLERY_METAS_BY_CATEGORY[category]) {
      const ficha = fichas.get(meta.id)
      assert.ok(
        ficha,
        `${category}/${meta.id} no declara ejemplos de variantes`
      )

      const groups = keyedBlocks(ficha, GROUP_KEY)
      for (const variant of meta.variants) {
        const group = groups.get(variant.name)
        assert.ok(
          group,
          `${category}/${meta.id} no pinta el grupo ${variant.name}`
        )

        const labels = [...group.matchAll(LABEL)].map((match) => match[1])
        assert.ok(
          labels.length > 0,
          `${category}/${meta.id}/${variant.name} no tiene ejemplos pintados`
        )
        assert.ok(
          labels.every((label) => label.trim().length > 0),
          `${category}/${meta.id}/${variant.name} tiene una etiqueta vacía`
        )
        assert.equal(
          new Set(labels).size,
          labels.length,
          `${category}/${meta.id}/${variant.name} repite una etiqueta`
        )
      }
    }
  }
})

test("los ejemplos de variantes usan los grupos declarados por su ficha", () => {
  for (const category of COVERED_CATEGORIES) {
    const fichas = keyedBlocks(variantSource(category), FICHA_KEY)

    for (const meta of GALLERY_METAS_BY_CATEGORY[category]) {
      const ficha = fichas.get(meta.id)
      assert.ok(
        ficha,
        `${category}/${meta.id} no declara ejemplos de variantes`
      )

      for (const groupName of keyedBlocks(ficha, GROUP_KEY).keys()) {
        assert.ok(
          meta.variants.some((variant) => variant.name === groupName),
          `${category}/${meta.id} pinta un grupo inexistente: ${groupName}`
        )
      }
    }
  }
})
