import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  DEFAULT_USAGE_DAYS,
  fillDailyUsage,
  fillHourlyUsage,
  formatUsageCost,
  formatUsageCostAxis,
  formatUsagePercent,
  formatUsageReset,
  initialBudgetProgress,
  isUsageDays,
  nextUsageReset,
  nextUtcDailyReset,
  usageCostTone,
  usageRefreshDelay,
  usageResetReached,
  usageProgress,
  usageRangeCaption,
  usageTotalTokens,
  usageTypeLabel,
} from "./usage-summary.ts"

describe("rangos de uso", () => {
  it("ofrece hoy, 7 y 30 días, con 7 por defecto", () => {
    assert.equal(DEFAULT_USAGE_DAYS, 7)
    assert.equal(isUsageDays(1), true)
    assert.equal(isUsageDays(7), true)
    assert.equal(isUsageDays(30), true)
    assert.equal(isUsageDays(14), false)
  })

  it("explica el rango en UTC para hoy", () => {
    assert.equal(usageRangeCaption(1), "Hoy (UTC)")
    assert.equal(usageRangeCaption(30), "Últimos 30 días")
  })
})

describe("fillDailyUsage", () => {
  it("completa con ceros los días sin llamadas", () => {
    const filled = fillDailyUsage({
      byDay: [
        {
          day: "2026-11-18",
          calls: 2,
          inputTokens: 100,
          outputTokens: 20,
          costUsd: 0.0004,
        },
      ],
      from: "2026-11-17T00:00:00.000Z",
      to: "2026-11-19T12:30:00.000Z",
    })

    assert.deepEqual(
      filled.map((bucket) => bucket.day),
      ["2026-11-17", "2026-11-18", "2026-11-19"]
    )
    assert.equal(filled[0].calls, 0)
    assert.equal(filled[1].calls, 2)
    assert.equal(filled[2].costUsd, 0)
  })

  it("falla si el rango termina antes de empezar", () => {
    assert.throws(
      () =>
        fillDailyUsage({
          byDay: [],
          from: "2026-11-19T00:00:00.000Z",
          to: "2026-11-17T00:00:00.000Z",
        }),
      /termina antes de empezar/
    )
  })

  it("falla si la fecha del rango no es válida", () => {
    assert.throws(
      () => fillDailyUsage({ byDay: [], from: "sin-fecha", to: "2026-11-19" }),
      /Fecha de rango inválida/
    )
  })
})

describe("fillHourlyUsage", () => {
  it("pinta las 24 horas y conserva las que traen datos", () => {
    const filled = fillHourlyUsage([
      {
        hour: 9,
        calls: 3,
        inputTokens: 900,
        outputTokens: 120,
        costUsd: 0.0009,
      },
    ])

    assert.equal(filled.length, 24)
    assert.equal(filled[0].hour, 0)
    assert.equal(filled[9].calls, 3)
    assert.equal(filled[23].calls, 0)
  })
})

describe("usageProgress", () => {
  it("calcula el avance y el restante", () => {
    assert.deepEqual(usageProgress({ limit: 500, used: 125 }), {
      percent: 25,
      used: 125,
      remaining: 375,
    })
  })

  it("no deja pasar del límite ni inventa consumo", () => {
    assert.deepEqual(usageProgress({ limit: 500, used: 600 }), {
      percent: 100,
      used: 500,
      remaining: 0,
    })
    assert.deepEqual(usageProgress({ limit: 500, used: -10 }), {
      percent: 0,
      used: 0,
      remaining: 500,
    })
    assert.deepEqual(usageProgress({ limit: 0, used: 10 }), {
      percent: 0,
      used: 0,
      remaining: 0,
    })
  })

  it("deriva el usado de la carga inicial desde el restante", () => {
    assert.deepEqual(initialBudgetProgress({ limit: 500, remaining: 480 }), {
      percent: 4,
      used: 20,
      remaining: 480,
    })
  })
})

describe("nextUtcDailyReset", () => {
  it("apunta a la medianoche UTC siguiente", () => {
    assert.equal(
      nextUtcDailyReset(new Date("2026-11-19T17:35:00.000Z")).toISOString(),
      "2026-11-20T00:00:00.000Z"
    )
  })

  it("en la medianoche exacta apunta al día siguiente", () => {
    assert.equal(
      nextUtcDailyReset(new Date("2026-11-20T00:00:00.000Z")).toISOString(),
      "2026-11-21T00:00:00.000Z"
    )
  })
})

describe("reinicio del uso", () => {
  it("calcula el reinicio siguiente a la hora del servidor", () => {
    assert.equal(
      nextUsageReset("2026-11-19T23:00:00.000Z").toISOString(),
      "2026-11-20T00:00:00.000Z"
    )
  })

  it("espera el reinicio más un minuto de margen", () => {
    assert.equal(
      usageRefreshDelay({
        serverNow: "2026-11-19T23:00:00.000Z",
        clientNow: Date.parse("2026-11-19T23:00:00.000Z"),
      }),
      3_660_000
    )
  })

  it("detecta si el servidor ya pasó el reinicio esperado", () => {
    assert.equal(
      usageResetReached({
        previousServerNow: "2026-11-19T23:00:00.000Z",
        serverNow: "2026-11-20T00:00:30.000Z",
      }),
      true
    )
    assert.equal(
      usageResetReached({
        previousServerNow: "2026-11-19T23:00:00.000Z",
        serverNow: "2026-11-19T23:59:00.000Z",
      }),
      false
    )
  })
})

describe("estado del costo global", () => {
  it("traduce la alerta al 80 % y la pausa al 100 %", () => {
    assert.equal(usageCostTone("OK"), "ok")
    assert.equal(usageCostTone("ALERT"), "warning")
    assert.equal(usageCostTone("PAUSED"), "paused")
  })
})

describe("etiquetas y formato", () => {
  it("traduce el tipo de clasificación y deja el valor si no lo conoce", () => {
    assert.equal(usageTypeLabel("FIN_TRANSACTION"), "Transacción")
    assert.equal(usageTypeLabel("SIN_CLASIFICACION"), "Sin clasificación")
    assert.equal(usageTypeLabel("OTRO_TIPO"), "OTRO_TIPO")
  })

  it("suma entrada y salida de un bucket", () => {
    assert.equal(
      usageTotalTokens({
        calls: 1,
        inputTokens: 2_465,
        outputTokens: 310,
        costUsd: 0.0005,
      }),
      2_775
    )
  })

  it("pinta costo y porcentaje con el locale del perfil", () => {
    assert.match(formatUsageCost(0.0005, "es-DO"), /0[.,]0005/)
    assert.match(formatUsageCost(5, "es-DO"), /5[.,]00/)
    assert.match(formatUsageCostAxis(0.0005, "es-DO"), /0[.,]0005/)
    assert.match(formatUsagePercent(80, "es-DO"), /80\s?%/)
    assert.match(formatUsagePercent(100, "es-DO"), /100\s?%/)
  })

  it("avisa cuando el costo existe pero queda bajo la precisión visible", () => {
    assert.match(formatUsageCost(0.00004, "es-DO"), /^<\s*US\$0[.,]0001$/)
    assert.equal(formatUsageCost(0, "es-DO").startsWith("<"), false)
    assert.equal(formatUsageCost(0.0005, "es-DO").startsWith("<"), false)
  })

  it("pinta el reinicio en UTC con el formato de fecha de la app", () => {
    const label = formatUsageReset(
      new Date("2026-11-20T00:00:00.000Z"),
      "es-DO"
    )
    assert.match(label, /20 nov 2026/)
    assert.match(label, /00:00/)
    assert.match(label, /UTC$/)
  })
})
