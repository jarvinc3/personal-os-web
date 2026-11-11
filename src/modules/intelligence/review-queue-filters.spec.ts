import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  activeReviewFilters,
  applyReviewQueueFilterPatch,
  clearReviewFilters,
  formatReviewDay,
  patchReviewQueueDraft,
  readReviewQueueFilters,
  removeReviewFilter,
  reviewQueueApiQuery,
  reviewQueueApiSearchParams,
  reviewQueueDatePatch,
  reviewQueueFiltersHref,
  REVIEW_QUEUE_FILTER_DEFAULTS,
  type ReviewQueueFilters,
} from "@/src/modules/intelligence/review-queue-filters"

const search = (query: string) => new URLSearchParams(query)

const filtersWith = (
  patch: Partial<ReviewQueueFilters>
): ReviewQueueFilters => ({
  ...REVIEW_QUEUE_FILTER_DEFAULTS,
  ...patch,
})

describe("filtros de la cola de revisión", () => {
  it("lee los valores por defecto sin parámetros", () => {
    assert.deepEqual(readReviewQueueFilters(search("")), {
      ...REVIEW_QUEUE_FILTER_DEFAULTS,
    })
  })

  it("lee la pestaña, el estado, el orden, la partición y los textos", () => {
    assert.deepEqual(
      readReviewQueueFilters(
        search(
          "queue=reviewed&status=CORRECTED&order=NEWEST&partition=HOLDOUT&q=aviso%20de%20seguridad&sender=notificaciones%40github.com&from=2026-10-01&to=2026-10-03"
        )
      ),
      {
        tab: "reviewed",
        status: "CORRECTED",
        order: "NEWEST",
        partition: "HOLDOUT",
        subject: "aviso de seguridad",
        sender: "notificaciones@github.com",
        semanticType: "ALL",
        route: "ALL",
        confidenceMin: null,
        confidenceMax: null,
        dateFrom: "2026-10-01",
        dateTo: "2026-10-03",
        uncertain: false,
      }
    )
  })

  it("lee los filtros semánticos y el rango de confianza", () => {
    assert.deepEqual(
      readReviewQueueFilters(
        search(
          "semanticType=FIN_TRANSACTION&route=FINANCE&confidenceMin=0.7&confidenceMax=0.95&order=IMPACT"
        )
      ),
      {
        ...REVIEW_QUEUE_FILTER_DEFAULTS,
        semanticType: "FIN_TRANSACTION",
        route: "FINANCE",
        confidenceMin: 0.7,
        confidenceMax: 0.95,
        order: "IMPACT",
      }
    )
    assert.deepEqual(
      readReviewQueueFilters(
        search(
          "semanticType=UNKNOWN&route=BOGUS&confidenceMin=2&confidenceMax=nope"
        )
      ),
      { ...REVIEW_QUEUE_FILTER_DEFAULTS }
    )
  })

  it("cae en los valores por defecto ante datos desconocidos", () => {
    assert.deepEqual(
      readReviewQueueFilters(
        search(
          "queue=otro&status=UNKNOWN&order=SIDEWAYS&partition=OTHER&from=2026-13-01&to=31-10-2026"
        )
      ),
      {
        ...REVIEW_QUEUE_FILTER_DEFAULTS,
      }
    )
    assert.equal(
      readReviewQueueFilters(search("from=2026-02-30")).dateFrom,
      "",
      "un día que no existe no llega al API"
    )
  })

  it("ordena un rango invertido en vez de enviarlo", () => {
    const filters = readReviewQueueFilters(
      search("from=2026-10-31&to=2026-10-01")
    )
    assert.equal(filters.dateFrom, "2026-10-01")
    assert.equal(filters.dateTo, "2026-10-31")
  })

  it("recorta los textos y respeta los límites del contrato", () => {
    const filters = readReviewQueueFilters(
      search(`q=${"a".repeat(210)}&sender=${"b".repeat(330)}%20`)
    )
    assert.equal(filters.subject.length, 200)
    assert.equal(filters.sender.length, 320)
  })

  it("aplica un cambio sin mutar los filtros recibidos", () => {
    const filters = filtersWith({ subject: "aviso" })
    const next = applyReviewQueueFilterPatch(filters, {
      subject: "  cobro  ",
      sender: "banco@example.com",
    })

    assert.equal(next.subject, "cobro")
    assert.equal(next.sender, "banco@example.com")
    assert.equal(filters.subject, "aviso")
    assert.equal(filters.sender, "")
  })

  it("conserva el texto tal como se escribe en el borrador de la hoja", () => {
    const draft = filtersWith({ subject: "Full", sender: "banco" })
    const next = patchReviewQueueDraft(draft, {
      subject: "Full ",
      sender: "banco ",
    })

    assert.equal(next.subject, "Full ")
    assert.equal(next.sender, "banco ")
    assert.equal(draft.subject, "Full")
    assert.equal(draft.sender, "banco")
  })

  it("arma la URL del cambio y conserva el resto de parámetros", () => {
    assert.equal(
      reviewQueueFiltersHref("/intelligence", "tab=review", {
        subject: "aviso",
      }),
      "/intelligence?tab=review&q=aviso"
    )
    assert.equal(
      reviewQueueFiltersHref(
        "/intelligence",
        "sheet=intelligence-message&sheetId=correo-1",
        { partition: "TRAIN" }
      ),
      "/intelligence?sheet=intelligence-message&sheetId=correo-1&partition=TRAIN"
    )
    assert.equal(
      reviewQueueFiltersHref("/intelligence", "sheet=review-filters", {
        semanticType: "FIN_TRANSACTION",
        route: "FINANCE",
        confidenceMin: 0.7,
        confidenceMax: 0.95,
        order: "IMPACT",
      }),
      "/intelligence?sheet=review-filters&order=IMPACT&semanticType=FIN_TRANSACTION&route=FINANCE&confidenceMin=0.7&confidenceMax=0.95"
    )
  })

  it("no navega si el valor ya está aplicado", () => {
    assert.equal(
      reviewQueueFiltersHref("/intelligence", "q=aviso", {
        subject: " aviso ",
      }),
      null
    )
  })

  it("quita el parámetro al volver al valor por defecto", () => {
    assert.equal(
      reviewQueueFiltersHref("/intelligence", "q=aviso", { subject: "" }),
      "/intelligence"
    )
    assert.equal(
      reviewQueueFiltersHref("/intelligence", "queue=reviewed", {
        tab: "pending",
      }),
      "/intelligence"
    )
  })

  it("ajusta el otro extremo cuando el rango quedaría invertido", () => {
    const filters = filtersWith({
      dateFrom: "2026-10-01",
      dateTo: "2026-10-10",
    })

    assert.deepEqual(reviewQueueDatePatch("dateFrom", "2026-10-20", filters), {
      dateFrom: "2026-10-20",
      dateTo: "2026-10-20",
    })
    assert.deepEqual(reviewQueueDatePatch("dateTo", "2026-09-01", filters), {
      dateTo: "2026-09-01",
      dateFrom: "2026-09-01",
    })
    assert.deepEqual(reviewQueueDatePatch("dateFrom", "", filters), {
      dateFrom: "",
    })
  })

  it("no manda estado en Pendientes y pide los tres veredictos en Revisados", () => {
    assert.equal(
      reviewQueueApiQuery(filtersWith({ status: "REJECTED" })).status,
      undefined
    )
    assert.deepEqual(
      reviewQueueApiQuery(filtersWith({ tab: "reviewed" })).status,
      ["CONFIRMED", "CORRECTED", "REJECTED"]
    )
    assert.deepEqual(
      reviewQueueApiQuery(filtersWith({ tab: "reviewed", status: "CORRECTED" }))
        .status,
      ["CORRECTED"]
    )
  })

  it("envía el orden de impacto al API", () => {
    assert.equal(
      reviewQueueApiQuery(filtersWith({ order: "IMPACT" })).order,
      "IMPACT"
    )
    assert.equal(
      reviewQueueApiSearchParams({ order: "IMPACT" }).get("order"),
      "IMPACT"
    )
  })

  it("traduce los filtros al contrato del API", () => {
    assert.deepEqual(
      reviewQueueApiQuery(
        filtersWith({
          tab: "reviewed",
          status: "CORRECTED",
          partition: "HOLDOUT",
          subject: "aviso",
          sender: "banco@example.com",
          dateFrom: "2026-10-01",
          dateTo: "2026-10-03",
          order: "NEWEST",
          semanticType: "FIN_TRANSACTION",
          route: "FINANCE",
          confidenceMin: 0.7,
          confidenceMax: 0.95,
          uncertain: true,
        })
      ),
      {
        partition: "HOLDOUT",
        status: ["CORRECTED"],
        fromAddress: "banco@example.com",
        subject: "aviso",
        dateFrom: "2026-10-01",
        dateTo: "2026-10-03",
        order: "NEWEST",
        semanticType: "FIN_TRANSACTION",
        route: "FINANCE",
        confidenceMin: 0.7,
        confidenceMax: 0.95,
        uncertain: true,
      }
    )
    assert.equal(
      reviewQueueApiQuery(filtersWith({ uncertain: true })).uncertain,
      true
    )
    assert.deepEqual(reviewQueueApiQuery(REVIEW_QUEUE_FILTER_DEFAULTS), {})
  })

  it("serializa los parámetros del API con los estados separados por coma", () => {
    const params = reviewQueueApiSearchParams({
      status: ["CONFIRMED", "CORRECTED"],
      fromAddress: "banco@example.com",
      subject: "aviso de seguridad",
      dateFrom: "2026-10-01",
      dateTo: "2026-10-03",
      order: "NEWEST",
      semanticType: "FIN_TRANSACTION",
      route: "FINANCE",
      confidenceMin: 0.7,
      confidenceMax: 0.95,
    })

    assert.equal(params.get("status"), "CONFIRMED,CORRECTED")
    assert.equal(params.get("subject"), "aviso de seguridad")
    assert.equal(params.get("fromAddress"), "banco@example.com")
    assert.equal(params.get("order"), "NEWEST")
    assert.equal(params.get("semanticType"), "FIN_TRANSACTION")
    assert.equal(params.get("route"), "FINANCE")
    assert.equal(params.get("confidenceMin"), "0.7")
    assert.equal(params.get("confidenceMax"), "0.95")
  })

  it("enumera los filtros activos para el estado vacío", () => {
    assert.deepEqual(activeReviewFilters(REVIEW_QUEUE_FILTER_DEFAULTS), [])
    assert.deepEqual(
      activeReviewFilters(
        filtersWith({
          tab: "reviewed",
          status: "REJECTED",
          partition: "TRAIN",
          subject: "aviso",
          sender: "banco@example.com",
          dateFrom: "2026-10-01",
          dateTo: "2026-10-03",
          order: "NEWEST",
          semanticType: "FIN_TRANSACTION",
          route: "FINANCE",
          confidenceMin: 0.7,
          confidenceMax: 0.95,
          uncertain: true,
        })
      ),
      [
        { kind: "subject", value: "aviso" },
        { kind: "sender", value: "banco@example.com" },
        { kind: "dateFrom", value: "2026-10-01" },
        { kind: "dateTo", value: "2026-10-03" },
        { kind: "order", value: "NEWEST" },
        { kind: "semanticType", value: "FIN_TRANSACTION" },
        { kind: "route", value: "FINANCE" },
        { kind: "confidenceMin", value: 0.7 },
        { kind: "confidenceMax", value: 0.95 },
        { kind: "partition", value: "TRAIN" },
        { kind: "status", value: "REJECTED" },
        { kind: "uncertain" },
      ]
    )
    assert.deepEqual(
      activeReviewFilters(filtersWith({ status: "REJECTED" })),
      [],
      "el estado no aplica en Pendientes"
    )
  })

  it("limpiar conserva la pestaña y vuelve a la cola completa", () => {
    assert.deepEqual(
      clearReviewFilters(
        filtersWith({
          tab: "reviewed",
          status: "CORRECTED",
          partition: "HOLDOUT",
          subject: "aviso",
          sender: "banco@example.com",
          dateFrom: "2026-10-01",
          dateTo: "2026-10-03",
          order: "NEWEST",
        })
      ),
      { ...REVIEW_QUEUE_FILTER_DEFAULTS, tab: "reviewed" }
    )
  })

  it("quita un filtro activo sin modificar los demás", () => {
    const filters = filtersWith({
      tab: "reviewed",
      status: "REJECTED",
      subject: "aviso",
      semanticType: "FIN_TRANSACTION",
      route: "FINANCE",
      confidenceMin: 0.7,
      uncertain: true,
    })

    assert.deepEqual(
      removeReviewFilter(filters, {
        kind: "semanticType",
        value: "FIN_TRANSACTION",
      }),
      { ...filters, semanticType: "ALL" }
    )
    assert.deepEqual(
      removeReviewFilter(filters, { kind: "confidenceMin", value: 0.7 }),
      { ...filters, confidenceMin: null }
    )
    assert.deepEqual(removeReviewFilter(filters, { kind: "uncertain" }), {
      ...filters,
      uncertain: false,
    })
    assert.deepEqual(
      removeReviewFilter(filters, { kind: "status", value: "REJECTED" }),
      { ...filters, status: "ALL" }
    )
  })

  it("formatea un día con el locale del perfil", () => {
    assert.equal(formatReviewDay("2026-10-25", "es"), "25 oct 2026")
    assert.equal(formatReviewDay("", "es"), "")
  })
})
