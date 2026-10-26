import type { InfiniteData } from "@tanstack/react-query"
import type {
  AiReviewQueueItem,
  AiReviewQueuePage,
} from "@/src/modules/intelligence/types/intelligence.types"

export type ReviewQueueData = InfiniteData<AiReviewQueuePage>

type ReviewPartition = AiReviewQueueItem["partition"]
type ReviewQueueCounts = AiReviewQueuePage["counts"]

function decrementCounts(
  counts: ReviewQueueCounts,
  partition: ReviewPartition
): ReviewQueueCounts {
  return {
    all: Math.max(0, counts.all - 1),
    TRAIN: Math.max(0, counts.TRAIN - (partition === "TRAIN" ? 1 : 0)),
    VALIDATION: Math.max(
      0,
      counts.VALIDATION - (partition === "VALIDATION" ? 1 : 0)
    ),
    HOLDOUT: Math.max(0, counts.HOLDOUT - (partition === "HOLDOUT" ? 1 : 0)),
  }
}

/**
 * Quita de la cola el correo que ya se verificó y ajusta los conteos de cada
 * página. Los conteos locales se reemplazan con la respuesta del servidor al
 * terminar la mutación.
 */
export function removeReviewQueueItem(
  data: ReviewQueueData | undefined,
  messageId: string
): ReviewQueueData | undefined {
  if (!data) {
    return undefined
  }
  const removed = data.pages
    .flatMap((page) => page.items)
    .find((item) => item.id === messageId)
  if (!removed) {
    return data
  }
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((item) => item.id !== messageId),
      counts: decrementCounts(page.counts, removed.partition),
    })),
  }
}
