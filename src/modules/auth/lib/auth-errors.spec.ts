import assert from "node:assert/strict"
import { describe, it } from "node:test"

process.env.NEXT_PUBLIC_API_URL = "http://api.test"

const {
  isProfileUnavailableFailure,
  resolveRegisterFailure,
  resolveRevokeMessages,
  resolveSessionRecoveryMessage,
} = await import("@/src/modules/auth/lib/auth-errors")
const { BackendProfileUnavailableError } =
  await import("@/src/modules/auth/lib/hydrate-auth-user")
const { AuthServiceError, REGISTER_PENDING_VERIFICATION } =
  await import("@/src/modules/auth/services/supabase-auth.service")

describe("isProfileUnavailableFailure", () => {
  it("is true only for the backend profile error", () => {
    assert.equal(
      isProfileUnavailableFailure(new BackendProfileUnavailableError("x")),
      true
    )
    assert.equal(isProfileUnavailableFailure(new Error("x")), false)
    assert.equal(isProfileUnavailableFailure(new AuthServiceError("x")), false)
  })
})

describe("resolveRegisterFailure", () => {
  it("stays silent when the recovery flow already showed the error", () => {
    assert.deepEqual(
      resolveRegisterFailure(new BackendProfileUnavailableError("x"), "a@b.co"),
      { kind: "silent" }
    )
  })

  it("sends the user to verify the email when the account is pending", () => {
    const action = resolveRegisterFailure(
      new AuthServiceError("pending", REGISTER_PENDING_VERIFICATION),
      "user@example.com"
    )

    assert.equal(action.kind, "verify-email")
    assert.match(
      action.kind === "verify-email" ? action.href : "",
      /user%40example\.com/
    )
  })

  it("shows the toast for any other failure", () => {
    assert.deepEqual(resolveRegisterFailure(new Error("boom"), "a@b.co"), {
      kind: "toast",
    })
  })
})

describe("resolveSessionRecoveryMessage", () => {
  it("keeps the specific profile error message", () => {
    assert.equal(
      resolveSessionRecoveryMessage(
        new BackendProfileUnavailableError("Cuenta no registrada")
      ),
      "Cuenta no registrada"
    )
  })

  it("falls back to the generic recovery message", () => {
    assert.match(
      resolveSessionRecoveryMessage(new Error("boom")),
      /No se pudo verificar tu cuenta/
    )
  })
})

describe("resolveRevokeMessages", () => {
  it("uses the default texts", () => {
    assert.deepEqual(resolveRevokeMessages(), {
      title: "No se pudo completar el inicio de sesión",
      description:
        "El servidor no está disponible o tu cuenta no está lista. Intenta más tarde.",
    })
  })

  it("honors the caller texts", () => {
    assert.deepEqual(resolveRevokeMessages({ title: "T", message: "M" }), {
      title: "T",
      description: "M",
    })
  })
})
