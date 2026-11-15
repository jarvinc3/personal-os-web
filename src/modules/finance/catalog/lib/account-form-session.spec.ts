import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { AccountFormValues } from "./account-form.ts"
import { resolveAccountFormReset } from "./account-form-session.ts"

const bhdValues: AccountFormValues = {
  name: "",
  type: "CHECKING",
  currency: "DOP",
  institutionId: "institution-bhd",
  accountNumber: "",
  color: "",
  initialBalance: "",
  isDefaultForInstitution: false,
}

const popularValues: AccountFormValues = {
  ...bhdValues,
  institutionId: "institution-popular",
}

describe("resolveAccountFormReset", () => {
  it("starts a fresh form when the sheet opens", () => {
    const nextReset = resolveAccountFormReset({
      session: { open: true, accountId: null },
      appliedSession: null,
      initialValues: bhdValues,
    })

    assert.deepEqual(nextReset.values, bhdValues)
    assert.notEqual(nextReset.appliedSession, null)
  })

  it("keeps what the user typed when the default institution changes", () => {
    const opened = resolveAccountFormReset({
      session: { open: true, accountId: null },
      appliedSession: null,
      initialValues: bhdValues,
    })

    const afterInstitutionChange = resolveAccountFormReset({
      session: { open: true, accountId: null },
      appliedSession: opened.appliedSession,
      initialValues: popularValues,
    })

    assert.equal(afterInstitutionChange.values, null)
    assert.equal(afterInstitutionChange.appliedSession, opened.appliedSession)
  })

  it("starts a fresh form again after closing and reopening", () => {
    const closed = resolveAccountFormReset({
      session: { open: false, accountId: null },
      appliedSession: "applied-session",
      initialValues: bhdValues,
    })
    assert.equal(closed.appliedSession, null)
    assert.equal(closed.values, null)

    const reopened = resolveAccountFormReset({
      session: { open: true, accountId: null },
      appliedSession: closed.appliedSession,
      initialValues: popularValues,
    })
    assert.deepEqual(reopened.values, popularValues)
  })

  it("starts a fresh form when the edited account changes", () => {
    const editingFirst = resolveAccountFormReset({
      session: { open: true, accountId: "account-1" },
      appliedSession: null,
      initialValues: bhdValues,
    })

    const editingSecond = resolveAccountFormReset({
      session: { open: true, accountId: "account-2" },
      appliedSession: editingFirst.appliedSession,
      initialValues: popularValues,
    })

    assert.deepEqual(editingSecond.values, popularValues)
  })

  it("keeps the same session for the account being edited", () => {
    const opened = resolveAccountFormReset({
      session: { open: true, accountId: "account-1" },
      appliedSession: null,
      initialValues: bhdValues,
    })

    const reopenedWithOtherInstitution = resolveAccountFormReset({
      session: { open: true, accountId: "account-1" },
      appliedSession: opened.appliedSession,
      initialValues: popularValues,
    })

    assert.equal(reopenedWithOtherInstitution.values, null)
  })
})
