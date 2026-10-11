import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { linkInstitutionMailboxSchema } from "./link-institution-mailbox-form.ts"

const validLink = {
  mailboxId: "mail-1",
  institutionId: "inst-1",
  bankSenderEmail: "bank@example.com",
  label: "",
}

describe("linkInstitutionMailboxSchema", () => {
  it("accepts a mailbox and institution", () => {
    assert.equal(
      linkInstitutionMailboxSchema.safeParse(validLink).success,
      true
    )
  })

  it("rejects an empty mailbox", () => {
    assert.equal(
      linkInstitutionMailboxSchema.safeParse({ ...validLink, mailboxId: "" })
        .success,
      false
    )
  })
})
