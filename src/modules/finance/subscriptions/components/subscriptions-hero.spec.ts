import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"
import ts from "typescript"

/**
 * `Button asChild` clones its only child through `Slot`, which throws during
 * render when it finds two. That is how Suscripciones stopped rendering (#324):
 * the calendar shortcut left `LinkPendingOverlay` as a sibling of the `Link`.
 *
 * A render test cannot run here (the runner strips types, not JSX), so the
 * guard parses the components with the TypeScript parser and counts the direct
 * children of every element that carries `asChild`.
 */
const FEATURE_ROOT = dirname(fileURLToPath(import.meta.url))
const AS_CHILD_ATTRIBUTE = "asChild"

type JsxSource = {
  file: string
  source: string
}

/** Returns a child only when React would actually render it. */
function isRendered(child: ts.JsxChild): boolean {
  if (ts.isJsxText(child)) {
    return child.text.trim() !== ""
  }
  if (ts.isJsxExpression(child)) {
    return child.expression !== undefined
  }
  return true
}

function renderedChildren(children: ts.NodeArray<ts.JsxChild>): ts.JsxChild[] {
  return children.filter(isRendered)
}

function hasAsChild(attributes: ts.JsxAttributes): boolean {
  return attributes.properties.some(
    (property) =>
      ts.isJsxAttribute(property) &&
      property.name.getText() === AS_CHILD_ATTRIBUTE
  )
}

/** Child count of every element that carries `asChild`, in source order. */
function asChildChildCounts({ file, source }: JsxSource): number[] {
  const counts: number[] = []
  const visit = (node: ts.Node): void => {
    if (ts.isJsxElement(node) && hasAsChild(node.openingElement.attributes)) {
      counts.push(renderedChildren(node.children).length)
    }
    if (ts.isJsxSelfClosingElement(node) && hasAsChild(node.attributes)) {
      counts.push(0)
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
  return counts
}

function featureSources(): JsxSource[] {
  return readdirSync(FEATURE_ROOT, { recursive: true, encoding: "utf8" })
    .filter((entry) => entry.endsWith(".tsx"))
    .map((entry) => ({
      file: entry,
      source: readFileSync(join(FEATURE_ROOT, entry), "utf8"),
    }))
}

describe("subscriptions hero", () => {
  it("counts the second child that broke the view", () => {
    const broken = `const view = (
  <Button variant="secondary" asChild>
    <Link href="/finance/subscriptions/calendar">
      <CalendarDaysIcon />
      <span>Calendario</span>
    </Link>
    <LinkPendingOverlay />
  </Button>
)`
    assert.deepEqual(
      asChildChildCounts({ file: "broken.tsx", source: broken }),
      [2]
    )
  })

  it("ignores whitespace and comments, which render nothing", () => {
    const spaced = `const view = (
  <Button variant="secondary" asChild>
    {/* el aviso vive dentro del enlace */}
    <Link href="/finance/subscriptions/calendar">
      <span>Calendario</span>
    </Link>
  </Button>
)`
    assert.deepEqual(
      asChildChildCounts({ file: "spaced.tsx", source: spaced }),
      [1]
    )
  })

  it("keeps one child per asChild element in the feature", () => {
    const inspected = featureSources().map((source) => ({
      file: source.file,
      counts: asChildChildCounts(source),
    }))
    const scanned = inspected.reduce(
      (total, { counts }) => total + counts.length,
      0
    )
    assert.ok(scanned > 0, "the feature still has asChild elements to guard")
    const offenders = inspected
      .map(({ file, counts }) => ({
        file,
        counts: counts.filter((count) => count !== 1),
      }))
      .filter(({ counts }) => counts.length > 0)
    assert.deepEqual(offenders, [])
  })
})
