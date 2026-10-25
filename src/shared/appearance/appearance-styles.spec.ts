import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"

import { contrastRatio } from "@/src/shared/appearance/color.ts"
import { APPEARANCE_STYLES } from "@/src/shared/appearance/style-registry.ts"

const STYLES_DIR = new URL("./styles/", import.meta.url)
const STYLE_INDEX = readFileSync(new URL("index.css", STYLES_DIR), "utf8")

type TokenBlock = {
  selector: string
  tokens: Map<string, string>
}

function readStyleFile(name: string): string {
  return readFileSync(new URL(name, STYLES_DIR), "utf8")
}

function readTokenBlocks(source: string): TokenBlock[] {
  const blocks: TokenBlock[] = []
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "")
  for (const block of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const tokens = new Map<string, string>()
    for (const declaration of block[2].matchAll(
      /--([a-z0-9-]+):\s*([^;]+);/g
    )) {
      tokens.set(declaration[1], declaration[2].trim())
    }
    blocks.push({ selector: block[1].trim(), tokens })
  }
  return blocks
}

function requireToken(block: TokenBlock, name: string): string {
  const value = block.tokens.get(name)
  assert.ok(value, `${block.selector} no define --${name}`)
  return value
}

const NEO_BLOCKS = readTokenBlocks(readStyleFile("neo-skeuo.css"))

function requireBlock(
  name: string,
  matches: (block: TokenBlock) => boolean
): TokenBlock {
  const block = NEO_BLOCKS.find(matches)
  if (!block) {
    throw new Error(`neo-skeuo.css no declara el bloque ${name}`)
  }
  return block
}

const NEO_LIGHT = requireBlock(
  "claro",
  (block) => block.selector === '[data-style="neo-skeuo"]'
)
const NEO_DARK = requireBlock(
  "oscuro",
  (block) => block.selector.includes(".dark") && block.tokens.size > 0
)

/** Pares de texto o control con el fondo sobre el que se leen. */
const CONTRAST_PAIRS = [
  ["foreground", "background", 4.5],
  ["card-foreground", "card", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "card", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["sidebar-foreground", "sidebar", 4.5],
  ["ring", "background", 3],
] as const

describe("registro de estilos", () => {
  it("importa el archivo de cada estilo registrado", () => {
    for (const style of APPEARANCE_STYLES) {
      assert.match(
        STYLE_INDEX,
        new RegExp(`@import "\\./${style.id}\\.css";`),
        `${style.id} no está importado en styles/index.css`
      )
      assert.ok(
        readStyleFile(`${style.id}.css`).includes(`[data-style="${style.id}"]`),
        `${style.id} no declara sus tokens`
      )
    }
  })
})

describe("estilo Neo-Skeuo", () => {
  it("declara los dos temas con los tokens que consumen los componentes", () => {
    const required = [
      "background",
      "foreground",
      "card",
      "card-foreground",
      "popover",
      "primary",
      "primary-foreground",
      "secondary",
      "muted",
      "muted-foreground",
      "accent",
      "accent-foreground",
      "destructive",
      "border",
      "input",
      "ring",
      "sidebar",
      "sidebar-foreground",
      "text",
      "surface",
      "surface-shadow-sm",
      "surface-shadow-md",
      "surface-shadow-lg",
    ]

    for (const block of [NEO_LIGHT, NEO_DARK]) {
      for (const token of required) {
        requireToken(block, token)
      }
    }

    // La escala de radios es la misma en los dos temas: se declara una vez.
    for (const token of [
      "radius",
      "radius-ratio-sm",
      "radius-ratio-xl",
      "radius-ratio-4xl",
    ]) {
      requireToken(NEO_LIGHT, token)
    }
  })

  it("mantiene el contraste de texto y foco en claro y en oscuro", () => {
    for (const block of [NEO_LIGHT, NEO_DARK]) {
      for (const [foreground, background, minimum] of CONTRAST_PAIRS) {
        const ratio = contrastRatio(
          requireToken(block, foreground),
          requireToken(block, background)
        )
        assert.ok(
          ratio >= minimum,
          `${block.selector}: ${foreground} sobre ${background} quedó en ${ratio.toFixed(2)}`
        )
      }
    }
  })
})
