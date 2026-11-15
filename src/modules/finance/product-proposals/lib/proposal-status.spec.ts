import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  DEFAULT_PROPOSAL_STATUS,
  proposalStatusFromSearchParams,
  withProposalStatus,
} from "./proposal-status.ts"
import type { EmailProductProposalStatus } from "@/src/modules/finance/shared/types/entities"

function paramsOf(search: string) {
  return new URLSearchParams(search)
}

describe("proposalStatusFromSearchParams", () => {
  it("opens pending when the URL has no status", () => {
    assert.equal(
      proposalStatusFromSearchParams(paramsOf("")),
      DEFAULT_PROPOSAL_STATUS
    )
  })

  it("reads every status the back accepts", () => {
    const statuses: EmailProductProposalStatus[] = [
      "PENDING",
      "APPROVING",
      "APPROVED",
      "DISCARDED",
    ]
    for (const status of statuses) {
      assert.equal(
        proposalStatusFromSearchParams(paramsOf(`status=${status}`)),
        status
      )
    }
  })

  it("falls back to pending for an unknown status", () => {
    assert.equal(
      proposalStatusFromSearchParams(paramsOf("status=DELETED")),
      DEFAULT_PROPOSAL_STATUS
    )
  })
})

describe("withProposalStatus", () => {
  it("drops the parameter for the default status", () => {
    assert.equal(withProposalStatus("status=APPROVED", "PENDING"), "")
  })

  it("keeps the rest of the query when it changes the status", () => {
    assert.equal(
      withProposalStatus("continue=/finance/products", "APPROVED"),
      "continue=%2Ffinance%2Fproducts&status=APPROVED"
    )
  })

  it("reads back what it wrote", () => {
    const search = withProposalStatus("", "DISCARDED")
    assert.equal(proposalStatusFromSearchParams(paramsOf(search)), "DISCARDED")
  })
})
