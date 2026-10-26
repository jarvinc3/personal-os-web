import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"

/**
 * `Button asChild` clones its only child (`Slot`), and throws during render
 * when it finds two. That is how Suscripciones stopped rendering (#324): the
 * calendar shortcut left `LinkPendingOverlay` as a sibling of the `Link`.
 *
 * A render test cannot run here (the runner only strips types, not JSX), so the
 * guard reads the components: every `asChild` in the feature must have exactly
 * one direct child.
 */
const FEATURE_ROOT = join(dirname(fileURLToPath(import.meta.url)))

function jsxTagEnd(source: string, start: number): number {
  let braces = 0
  let quote: string | null = null
  for (let index = start; index < source.length; index += 1) {
    const char = source[index]
    if (quote) {
      if (char === quote) {
        quote = null
      }
      continue
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char
      continue
    }
    if (char === "{") {
      braces += 1
      continue
    }
    if (char === "}") {
      braces -= 1
      continue
    }
    if (char === ">" && braces === 0) {
      return index
    }
  }
  return -1
}

function jsxExpressionEnd(source: string, start: number): number {
  let depth = 0
  let quote: string | null = null
  for (let index = start; index < source.length; index += 1) {
    const char = source[index]
    if (quote) {
      if (char === quote) {
        quote = null
      }
      continue
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char
      continue
    }
    if (char === "{") {
      depth += 1
      continue
    }
    if (char === "}") {
      depth -= 1
      if (depth === 0) {
        return index
      }
    }
  }
  return source.length - 1
}

/** Direct children of the element whose opening tag ends at `openEnd`. */
function directChildren(
  source: string,
  openEnd: number,
  name: string
): string[] {
  const children: string[] = []
  const open: string[] = []
  let index = openEnd + 1
  while (index < source.length) {
    const char = source[index]
    if (char === "{") {
      const end = jsxExpressionEnd(source, index)
      if (open.length === 0) {
        children.push(source.slice(index, end + 1))
      }
      index = end + 1
      continue
    }
    if (char === "<") {
      if (source[index + 1] === "/") {
        const end = source.indexOf(">", index)
        const closing = source.slice(index + 2, end).trim()
        if (open.length === 0 && closing === name) {
          return children
        }
        open.pop()
        index = end + 1
        continue
      }
      const end = jsxTagEnd(source, index)
      if (end === -1) {
        return children
      }
      const selfClosing = source[end - 1] === "/"
      const childName = source.slice(index + 1, end).split(/[\s>/]/)[0] ?? ""
      if (open.length === 0) {
        children.push(source.slice(index, end + 1))
      }
      if (!selfClosing) {
        open.push(childName)
      }
      index = end + 1
      continue
    }
    if (open.length === 0 && char.trim()) {
      let end = index
      while (
        end < source.length &&
        source[end] !== "<" &&
        source[end] !== "{"
      ) {
        end += 1
      }
      children.push(source.slice(index, end).trim())
      index = end
      continue
    }
    index += 1
  }
  return children
}

/** Child count of every `asChild` element declared in a component source. */
function asChildChildCounts(source: string): number[] {
  const counts: number[] = []
  let offset = 0
  for (const line of source.split("\n")) {
    const inline = /<[A-Z][A-Za-z.]*[^>]*\basChild\b[^>]*>/.test(line)
    const ownLine = line.trim() === "asChild"
    if (inline || ownLine) {
      const at = offset + line.indexOf("asChild")
      const tagStart = source.lastIndexOf("<", at)
      const openEnd = jsxTagEnd(source, tagStart)
      const name = source.slice(tagStart + 1, openEnd).split(/[\s>/]/)[0] ?? ""
      counts.push(directChildren(source, openEnd, name).length)
    }
    offset += line.length + 1
  }
  return counts
}

function featureSources(): Array<{ file: string; source: string }> {
  return readdirSync(FEATURE_ROOT, { recursive: true })
    .map((entry) => String(entry))
    .filter((entry) => entry.endsWith(".tsx"))
    .map((entry) => ({
      file: entry,
      source: readFileSync(join(FEATURE_ROOT, entry), "utf8"),
    }))
}

describe("subscriptions hero", () => {
  it("detects a second child next to the link, the shape that broke the view", () => {
    const broken = `<Button variant="secondary" asChild>
  <Link href="/x">
    <CanendarIcon />
    <span>Calendario</span>
  </Link>
  <LinkPendingOverlay />
</Button>`
    assert.deepEqual(asChildChildCounts(broken), [2])
  })

  it("keeps one child per asChild element in the feature", () => {
    const offenders = featureSources()
      .map(({ file, source }) => ({
        file,
        counts: asChildChildCounts(source).filter((count) => count !== 1),
      }))
      .filter(({ counts }) => counts.length > 0)
    assert.deepEqual(offenders, [])
  })
})
