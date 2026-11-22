import { WIPE_BRANCH_TEXTS } from "@/src/modules/settings/lib/wipe-branch-texts"

type FormatBranchCountInput = {
  branchId: string
  count: number
  locale: string
}

export function formatBranchCount({
  branchId,
  count,
  locale,
}: FormatBranchCountInput): string {
  if (count <= 0) {
    return "Sin datos"
  }
  const unit = WIPE_BRANCH_TEXTS[branchId]?.unit
  const amount = new Intl.NumberFormat(locale).format(count)
  if (!unit) {
    return `${amount} filas`
  }
  return `${amount} ${count === 1 ? unit.singular : unit.plural}`
}
