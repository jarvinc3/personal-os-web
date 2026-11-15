import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { discoveryLimitNote, discoverySummary } from "./discovery-summary.ts"
import type { EmailProductProposalDiscovery } from "@/src/modules/finance/shared/types/entities.ts"

function discoveryOf(
  overrides: Partial<EmailProductProposalDiscovery> = {}
): EmailProductProposalDiscovery {
  return {
    scanned: 12,
    limit: 200,
    limitReached: false,
    created: 0,
    evidenceAdded: 0,
    ignored: 0,
    proposals: [],
    ...overrides,
  }
}

describe("discoverySummary", () => {
  it("says when the emails had no product data", () => {
    assert.equal(
      discoverySummary(discoveryOf()),
      "Revisé 12 correos y no encontré datos de cuentas ni tarjetas."
    )
  })

  it("counts a single new proposal in the singular", () => {
    assert.equal(
      discoverySummary(discoveryOf({ created: 1 })),
      "Revisé 12 correos, encontré 1 propuesta nueva."
    )
  })

  it("joins the three outcomes", () => {
    assert.equal(
      discoverySummary(
        discoveryOf({ created: 2, evidenceAdded: 3, ignored: 4 })
      ),
      "Revisé 12 correos, encontré 2 propuestas nuevas, sumé evidencia a 3 correos e ignoré 4 correos sin datos de producto."
    )
  })

  it("uses one email in the singular", () => {
    assert.equal(
      discoverySummary(discoveryOf({ scanned: 1, evidenceAdded: 1 })),
      "Revisé 1 correo, sumé evidencia a 1 correo."
    )
  })
})

describe("discoveryLimitNote", () => {
  it("stays silent when every email was reviewed", () => {
    assert.equal(discoveryLimitNote(discoveryOf()), null)
  })

  it("explains the limit that was applied", () => {
    assert.equal(
      discoveryLimitNote(
        discoveryOf({ scanned: 200, limit: 200, limitReached: true })
      ),
      "Había más correos: se revisaron los últimos 200."
    )
  })
})
