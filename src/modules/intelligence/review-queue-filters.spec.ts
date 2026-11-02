import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  activeReviewFilters,
  applyReviewQueueFilterPatch,
  clearReviewFilters,
  formatReviewDay,
  readReviewQueueFilters,
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
        dateFrom: "2026-10-01",
        dateTo: "2026-10-03",
        uncertain: false,
      }
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
    })

    assert.equal(params.get("status"), "CONFIRMED,CORRECTED")
    assert.equal(params.get("subject"), "aviso de seguridad")
    assert.equal(params.get("fromAddress"), "banco@example.com")
    assert.equal(params.get("order"), "NEWEST")
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
        })
      ),
      [
        { kind: "subject", value: "aviso" },
        { kind: "sender", value: "banco@example.com" },
        { kind: "dateFrom", value: "2026-10-01" },
        { kind: "dateTo", value: "2026-10-03" },
        { kind: "order", value: "NEWEST" },
        { kind: "partition", value: "TRAIN" },
        { kind: "status", value: "REJECTED" },
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

  it("formatea un día con el locale del perfil", () => {
    assert.equal(formatReviewDay("2026-10-25", "es"), "25 oct 2026")
    assert.equal(formatReviewDay("", "es"), "")
  })
})
