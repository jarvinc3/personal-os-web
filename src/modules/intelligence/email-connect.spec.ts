import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  KEEP_EMAIL_IMPORT_PERIOD,
  SENDER_FILTER_MAX_LENGTH,
  emailConnectBody,
  emailConnectSchema,
  emailConnectHasChanges,
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
})

describe("emailConnectSchema", () => {
  it("una conexión nueva exige elegir un período", () => {
    const schema = emailConnectSchema({ reconnect: false })

    assert.equal(
      schema.safeParse({ choice: "", senderFilter: "" }).success,
      false
    )
    assert.equal(
      schema.safeParse({
        choice: KEEP_EMAIL_IMPORT_PERIOD,
        senderFilter: "",
      }).success,
      false
    )
    assert.equal(
      schema.safeParse({ choice: "LAST_3_MONTHS", senderFilter: "" }).success,
      true
    )
  })

  it("una reconexión admite mantener el período guardado", () => {
    assert.equal(
      emailConnectSchema({ reconnect: true }).safeParse({
        choice: KEEP_EMAIL_IMPORT_PERIOD,
        senderFilter: "bhd.com.do",
      }).success,
      true
    )
  })

  it("recorta el filtro y limita su largo al de la API", () => {
    const schema = emailConnectSchema({ reconnect: true })
    const parsed = schema.safeParse({
      choice: KEEP_EMAIL_IMPORT_PERIOD,
      senderFilter: "  bhd.com.do ",
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.senderFilter, "bhd.com.do")
    }
    const tooLong = schema.shape.senderFilter.safeParse(
      "x".repeat(SENDER_FILTER_MAX_LENGTH + 1)
    )

    assert.equal(tooLong.success, false)
    if (!tooLong.success) {
      assert.equal(
        tooLong.error.issues[0]?.message,
        "El filtro es demasiado largo"
      )
    }
  })

  it("exige un dominio con punto, como la API", () => {
    const acceptsSender = emailConnectSchema({
      reconnect: false,
    }).shape.senderFilter.safeParse

    assert.equal(acceptsSender("").success, true)
    assert.equal(acceptsSender("bhd.com.do").success, true)
    assert.equal(acceptsSender(" alerts.bhd.com.do ").success, true)

    for (const invalid of [
      "banco x",
      "@bhd.com",
      "bhd..com",
      "bhd.com.do,",
      "-bhd.com",
    ]) {
      const invalidParse = acceptsSender(invalid)

      assert.equal(invalidParse.success, false)
      if (!invalidParse.success) {
        assert.equal(
          invalidParse.error.issues[0]?.message,
          "Escribe un dominio válido, por ejemplo bhd.com.do"
        )
      }
    }
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

describe("emailConnectHasChanges", () => {
  it("no hay cambios con el borrador inicial", () => {
    assert.equal(
      emailConnectHasChanges(
        { choice: KEEP_EMAIL_IMPORT_PERIOD, senderFilter: "bhd.com.do" },
        { choice: KEEP_EMAIL_IMPORT_PERIOD, senderFilter: "bhd.com.do" }
      ),
      false
    )
  })

  it("detecta un período distinto", () => {
    assert.equal(
      emailConnectHasChanges(
        { choice: "TODAY", senderFilter: "" },
        { choice: KEEP_EMAIL_IMPORT_PERIOD, senderFilter: "" }
      ),
      true
    )
  })

  it("detecta un filtro distinto o borrado", () => {
    assert.equal(
      emailConnectHasChanges(
        { choice: "TODAY", senderFilter: "" },
        { choice: "TODAY", senderFilter: "bhd.com.do" }
      ),
      true
    )
  })
})
