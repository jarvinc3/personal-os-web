import { isoMonthBounds } from "@/src/modules/finance/shared/lib/month-window"

/** Calendar window the merchant list labels as "gasto del mes". */
export function merchantMonthParams(now: Date = new Date()): {
  dateFrom: string
  dateTo: string
} {
  return isoMonthBounds(now.getFullYear(), now.getMonth() + 1)
}
