import type { WipeUserDataResult } from "@/src/modules/settings/types/wipe.types"

/** Branches named in the toast before it summarizes the rest. */
const NAMED_BRANCH_LIMIT = 4

type WipeSummaryInput = {
  wipeResult: Pick<WipeUserDataResult, "appliedBranches" | "counts">
  branchLabels?: Record<string, string>
}

/** Resume en una línea las ramas vaciadas y las filas afectadas. */
export function wipeSummary({
  wipeResult,
  branchLabels,
}: WipeSummaryInput): string | undefined {
  const labels = wipeResult.appliedBranches.map(
    (branchId) => branchLabels?.[branchId] ?? branchId
  )
  if (labels.length === 0) {
    return undefined
  }
  const named =
    labels.length > NAMED_BRANCH_LIMIT
      ? `${labels.slice(0, NAMED_BRANCH_LIMIT - 1).join(", ")} y ${
          labels.length - NAMED_BRANCH_LIMIT + 1
        } más`
      : labels.join(", ")
  const rows = Object.values(wipeResult.counts).reduce(
    (total, count) => total + count,
    0
  )
  const rowLabel = rows === 1 ? "1 fila afectada" : `${rows} filas afectadas`
  return `${named} · ${rowLabel}.`
}
