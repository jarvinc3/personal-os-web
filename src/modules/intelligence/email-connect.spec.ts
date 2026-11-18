import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  KEEP_EMAIL_IMPORT_PERIOD,
  canConnectGmail,
  emailConnectBody,
  emailImportScopeLabel,
  emailImportStartLabel,
  normalizeSenderFilter,
} from "./email-connect.ts"

describe("normalizeSenderFilter", () => {
  it("recorta el dominio", () => {
    assert.equal(normalizeSenderFilter("  bhd.com.do "), "bhd.com.do")
  })

  it("un filtro vacío se borra", () => {
    assert.equal(normalizeSenderFilter(""), null)
    assert.equal(normalizeSenderFilter("   "), null)
  })
})

describe("emailConnectBody", () => {
  it("incluye el período elegido y el filtro", () => {
    assert.deepEqual(
      emailConnectBody({ choice: "LAST_MONTH", senderFilter: " bhd.com.do " }),
      { period: "LAST_MONTH", senderFilter: "bhd.com.do" }
    )
  })

  it("omite el período al mantener el guardado", () => {
    assert.deepEqual(
      emailConnectBody({
        choice: KEEP_EMAIL_IMPORT_PERIOD,
        senderFilter: "bhd.com.do",
      }),
      { senderFilter: "bhd.com.do" }
    )
  })

  it("envía null para borrar el filtro", () => {
    assert.deepEqual(
      emailConnectBody({ choice: "TODAY", senderFilter: "  " }),
      {
        period: "TODAY",
        senderFilter: null,
      }
    )
  })

  it("sin elección no envía período y no pide filtro", () => {
    assert.deepEqual(emailConnectBody({ choice: null, senderFilter: "" }), {
      senderFilter: null,
    })
  })
})

describe("canConnectGmail", () => {
  it("una conexión nueva exige elegir un período", () => {
    assert.equal(canConnectGmail({ reconnect: false, choice: null }), false)
    assert.equal(
      canConnectGmail({ reconnect: false, choice: KEEP_EMAIL_IMPORT_PERIOD }),
      false
    )
    assert.equal(
      canConnectGmail({ reconnect: false, choice: "LAST_3_MONTHS" }),
      true
    )
  })

  it("una reconexión puede mantener el período guardado", () => {
    assert.equal(canConnectGmail({ reconnect: true, choice: null }), true)
    assert.equal(
      canConnectGmail({ reconnect: true, choice: KEEP_EMAIL_IMPORT_PERIOD }),
      true
    )
  })
})

describe("emailImportStartLabel", () => {
  it("pinta el día del corte, sin correrlo por la zona horaria", () => {
    assert.equal(
      emailImportStartLabel("2026-11-05T00:00:00.000Z", "es-DO"),
      "5 nov 2026"
    )
  })

  it("ignora una fecha ausente o inválida", () => {
    assert.equal(emailImportStartLabel(null, "es-DO"), null)
    assert.equal(emailImportStartLabel(undefined, "es-DO"), null)
    assert.equal(emailImportStartLabel("2026-11-05", "es-DO"), "5 nov 2026")
    assert.equal(emailImportStartLabel("sin fecha", "es-DO"), null)
  })
})

describe("emailImportScopeLabel", () => {
  it("junta el corte y el filtro", () => {
    assert.equal(
      emailImportScopeLabel(
        {
          importStartAt: "2026-11-05T00:00:00.000Z",
          senderFilter: "bhd.com.do",
        },
        "es-DO"
      ),
      "desde el 5 nov 2026 · bhd.com.do"
    )
  })

  it("acepta solo el filtro", () => {
    assert.equal(
      emailImportScopeLabel({ senderFilter: "bhd.com.do" }, "es-DO"),
      "bhd.com.do"
    )
  })

  it("sin corte ni filtro no hay alcance", () => {
    assert.equal(emailImportScopeLabel({}, "es-DO"), null)
  })
})
