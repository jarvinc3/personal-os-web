import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const FEATURE_ROOT = dirname(fileURLToPath(import.meta.url))
const LINK_TAG = "Link"
const LINK_PENDING_OVERLAY_TAG = "LinkPendingOverlay"

type JsxSource = {
  file: string
  source: string
}

type StyledLinkComposition = {
  href: string
  buttonStyled: boolean
  pendingOverlayCount: number
}

function jsxAttributeExpression(
  attributes: ts.JsxAttributes,
  name: string
): ts.Expression | undefined {
  const attribute = attributes.properties.find(
    (property): property is ts.JsxAttribute =>
      ts.isJsxAttribute(property) && property.name.getText() === name
  )
  const initializer = attribute?.initializer

  if (!initializer) {
    return undefined
  }
  if (ts.isStringLiteral(initializer)) {
    return initializer
  }
  if (!ts.isJsxExpression(initializer)) {
    return undefined
  }

  return initializer.expression
}

function jsxAttributeText(attributes: ts.JsxAttributes, name: string): string {
  const expression = jsxAttributeExpression(attributes, name)

  if (!expression) {
    return ""
  }

  return ts.isStringLiteral(expression) ? expression.text : expression.getText()
}

function isPendingOverlay(child: ts.JsxChild): boolean {
  if (ts.isJsxElement(child)) {
    return child.openingElement.tagName.getText() === LINK_PENDING_OVERLAY_TAG
  }
  if (ts.isJsxSelfClosingElement(child)) {
    return child.tagName.getText() === LINK_PENDING_OVERLAY_TAG
  }
  return false
}

function styledLinkCompositions({
  file,
  source,
}: JsxSource): StyledLinkComposition[] {
  const compositions: StyledLinkComposition[] = []
  const visit = (node: ts.Node): void => {
    if (
      ts.isJsxElement(node) &&
      node.openingElement.tagName.getText() === LINK_TAG
    ) {
      const href = jsxAttributeText(node.openingElement.attributes, "href")
      const classNameExpression = jsxAttributeExpression(
        node.openingElement.attributes,
        "className"
      )
      compositions.push({
        href,
        buttonStyled:
          classNameExpression?.getText().includes("buttonVariants") ?? false,
        pendingOverlayCount: node.children.filter(isPendingOverlay).length,
      })
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
  return compositions
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
  it("styles a direct calendar Link and keeps its pending surface", () => {
    const composition = `const view = (
  <Link
    href="/finance/subscriptions/calendar"
    className={cn(buttonVariants({ variant: "outline" }))}
  >
    <CalendarDaysIcon />
    <span>Calendario</span>
    <LinkPendingOverlay />
  </Link>
)`
    assert.deepEqual(
      styledLinkCompositions({ file: "fixture.tsx", source: composition }),
      [
        {
          href: "/finance/subscriptions/calendar",
          buttonStyled: true,
          pendingOverlayCount: 1,
        },
      ]
    )
  })

  it("keeps the calendar shortcut as a styled Link with its pending surface", () => {
    const compositions = featureSources().flatMap(styledLinkCompositions)
    const calendarShortcut = compositions.find(({ href }) =>
      href.includes("financeSubscriptionsCalendar")
    )

    assert.ok(calendarShortcut, "the calendar shortcut remains in the feature")
    assert.equal(calendarShortcut.buttonStyled, true)
    assert.equal(calendarShortcut.pendingOverlayCount, 1)
  })
})
