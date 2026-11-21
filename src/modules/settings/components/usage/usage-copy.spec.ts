import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import type { EmailUsageSummary } from "@/src/modules/intelligence"
import { UsageBreakdowns } from "@/src/modules/settings/components/usage/usage-breakdowns"
import { UsageCaps } from "@/src/modules/settings/components/usage/usage-caps"
import { UsageTotals } from "@/src/modules/settings/components/usage/usage-totals"

const LOCALE = "es-DO"

const TINY_BUCKET = {
  calls: 3,
  inputTokens: 2_400,
  outputTokens: 600,
  costUsd: 0.00004,
}

const CAPS: EmailUsageSummary["caps"] = {
  perMinute: 30,
  initial: { limit: 500, remaining: 450 },
  daily: { limitTokens: 100_000, usedTokens: 2_500 },
  globalCost: {
    limitUsd: 5,
    usedUsd: 0.00004,
    alertRatio: 0.8,
    status: "OK",
  },
}

function renderBreakdowns() {
  return renderToStaticMarkup(
    createElement(UsageBreakdowns, {
      byBank: [{ bank: "linkedin.com", ...TINY_BUCKET }],
      byType: [{ type: "FIN_TRANSACTION", ...TINY_BUCKET }],
      locale: LOCALE,
    })
  )
}

function renderTotals() {
  return renderToStaticMarkup(
    createElement(UsageTotals, {
      totals: { ...TINY_BUCKET, succeeded: 3, failed: 0 },
      rangeLabel: "Últimos 7 días",
      locale: LOCALE,
    })
  )
}

function renderCaps() {
  return renderToStaticMarkup(
    createElement(UsageCaps, {
      caps: CAPS,
      now: new Date("2026-11-19T10:00:00.000Z"),
      locale: LOCALE,
    })
  )
}

describe("textos de Uso", () => {
  it("agrupa por remitente y no presenta dominios como bancos", () => {
    const html = renderBreakdowns()

    assert.match(html, /Por remitente/)
    assert.doesNotMatch(html, /Por banco/)
    assert.doesNotMatch(html, /Dominio del remitente/)
    assert.match(html, /linkedin\.com/)
  })

  it("no describe el funcionamiento interno", () => {
    for (const html of [renderBreakdowns(), renderTotals(), renderCaps()]) {
      assert.doesNotMatch(html, /salen del back/)
      assert.doesNotMatch(html, /por el back/)
      assert.doesNotMatch(html, /no lo recalcula/)
      assert.doesNotMatch(html, /Tipo semántico/)
    }
  })

  it("avisa el costo que queda bajo la precisión visible", () => {
    assert.match(renderBreakdowns(), /&lt;\s*US\$0[.,]0001/)

    for (const html of [renderTotals(), renderCaps()]) {
      assert.match(html, /&lt;\s*US\$0[.,]0001/)
      assert.doesNotMatch(html, /US\$0[.,]0000/)
    }
  })

  it("pinta el reinicio con el formato de fecha de la app", () => {
    const html = renderCaps()

    assert.match(html, /20 nov 2026, 00:00 UTC/)
    assert.doesNotMatch(html, /20\/11\/2026/)
  })
})
