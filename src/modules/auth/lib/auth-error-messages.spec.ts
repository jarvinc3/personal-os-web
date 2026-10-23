import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { translateAuthError } from "@/src/modules/auth/lib/auth-error-messages"

const FALLBACK = "No se pudo iniciar sesión"

describe("translateAuthError", () => {
  it("does not reveal which credential failed", () => {
    assert.equal(
      translateAuthError({ code: "invalid_credentials" }, FALLBACK),
      "El correo o la contraseña no son correctos."
    )
  })

  it("explains that the email is already registered", () => {
    const expected = "Ya existe una cuenta con este correo."

    assert.equal(
      translateAuthError({ code: "user_already_exists" }, FALLBACK),
      expected
    )
    assert.equal(
      translateAuthError({ code: "email_exists" }, FALLBACK),
      expected
    )
  })

  it("explains that the email is not confirmed", () => {
    assert.equal(
      translateAuthError({ code: "email_not_confirmed" }, FALLBACK),
      "Confirma tu correo antes de iniciar sesión."
    )
  })

  it("explains the weak password reasons", () => {
    assert.match(
      translateAuthError(
        { code: "weak_password", reasons: ["length"] },
        FALLBACK
      ),
      /al menos 10 caracteres/
    )
    assert.match(
      translateAuthError(
        { code: "weak_password", reasons: ["characters"] },
        FALLBACK
      ),
      /mayúsculas, minúsculas y números/
    )
    assert.match(
      translateAuthError(
        { code: "weak_password", reasons: ["pwned"] },
        FALLBACK
      ),
      /filtración pública/
    )
  })

  it("joins every known weak password reason", () => {
    assert.equal(
      translateAuthError(
        { code: "weak_password", reasons: ["length", "pwned"] },
        FALLBACK
      ),
      "La contraseña debe tener al menos 10 caracteres. Esa contraseña apareció en una filtración pública. Elige otra."
    )
  })

  it("keeps a generic message when the weak password reason is unknown", () => {
    assert.equal(
      translateAuthError({ code: "weak_password", reasons: [] }, FALLBACK),
      "La contraseña no cumple la política de seguridad."
    )
  })

  it("explains the rate limits", () => {
    assert.match(
      translateAuthError({ code: "over_email_send_rate_limit" }, FALLBACK),
      /demasiados correos/
    )
    assert.match(
      translateAuthError({ code: "over_request_rate_limit" }, FALLBACK),
      /demasiados intentos/
    )
  })

  it("falls back to the operation message for an unmapped code", () => {
    assert.equal(
      translateAuthError({ code: "some_future_code" }, FALLBACK),
      FALLBACK
    )
  })

  it("falls back when the error has no code", () => {
    assert.equal(translateAuthError({}, FALLBACK), FALLBACK)
    assert.equal(translateAuthError(null, FALLBACK), FALLBACK)
  })
})
