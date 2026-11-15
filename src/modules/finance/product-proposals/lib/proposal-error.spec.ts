import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { isProposalEndpointUnavailable } from "./proposal-error.ts"
import { ApiError } from "@/src/config/api-client.utils.ts"

describe("isProposalEndpointUnavailable", () => {
  it("recognizes the 404 of an environment without the endpoints", () => {
    assert.equal(
      isProposalEndpointUnavailable(new ApiError(404, "Not found")),
      true
    )
  })

  it("does not hide other API failures", () => {
    assert.equal(
      isProposalEndpointUnavailable(new ApiError(500, "Server error")),
      false
    )
    assert.equal(isProposalEndpointUnavailable(new Error("Network")), false)
    assert.equal(isProposalEndpointUnavailable(null), false)
  })
})
