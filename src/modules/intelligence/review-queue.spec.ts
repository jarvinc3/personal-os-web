import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { removeReviewQueueItem } from "@/src/modules/intelligence/review-queue"
import type {
  AiReviewQueueItem,
  AiReviewQueuePage,
} from "@/src/modules/intelligence/types/intelligence.types"

function queueItem(
  id: string,
  partition: AiReviewQueueItem["partition"]
): AiReviewQueueItem {
  return {
    id,
    receivedAt: "2026-10-01T10:00:00.000Z",
    fromAddress: "banco@example.com",
    fromDomain: "example.com",
    subject: "Cargo",
    processingStatus: "INGESTED",
    contentFingerprint: "fingerprint",
    partition,
    status: "PENDING",
    verification: null,
  }
}

function queuePage(
  items: AiReviewQueueItem[],
  counts: AiReviewQueuePage["counts"],
  nextCursor: string | null
): AiReviewQueuePage {
  return { items, counts, nextCursor, hasMore: nextCursor !== null }
}

const COUNTS = { all: 3, TRAIN: 2, VALIDATION: 1, HOLDOUT: 0 }

describe("cola de revisión", () => {
  it("quita el correo verificado de todas las páginas y ajusta los conteos", () => {
    const queue = {
      pages: [
        queuePage(
          [queueItem("a", "TRAIN"), queueItem("b", "TRAIN")],
          COUNTS,
          "c"
        ),
        queuePage([queueItem("c", "VALIDATION")], COUNTS, null),
      ],
      pageParams: [undefined, "c"],
    }

    const next = removeReviewQueueItem(queue, "b")

    assert.deepEqual(
      next?.pages.map((page) => page.items.map((item) => item.id)),
      [["a"], ["c"]]
    )
    assert.deepEqual(next?.pages[0]?.counts, {
      all: 2,
      TRAIN: 1,
      VALIDATION: 1,
      HOLDOUT: 0,
    })
    assert.deepEqual(next?.pages[1]?.counts, next?.pages[0]?.counts)
  })

  it("descuenta la partición del correo quitado", () => {
    const queue = {
      pages: [queuePage([queueItem("hol-1", "HOLDOUT")], COUNTS, null)],
      pageParams: [undefined],
    }

    assert.deepEqual(removeReviewQueueItem(queue, "hol-1")?.pages[0]?.counts, {
      all: 2,
      TRAIN: 2,
      VALIDATION: 1,
      HOLDOUT: 0,
    })
  })

  it("no toca la cola si el correo no está cargado", () => {
    const queue = {
      pages: [queuePage([queueItem("a", "TRAIN")], COUNTS, null)],
      pageParams: [undefined],
    }

    assert.equal(removeReviewQueueItem(queue, "otro"), queue)
    assert.equal(removeReviewQueueItem(undefined, "a"), undefined)
  })
})
