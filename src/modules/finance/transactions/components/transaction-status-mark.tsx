import {
  FINANCE_TRANSACTION_STATUS_LABEL,
  type FinanceTransactionStatus,
} from "@/src/modules/finance/shared/types/entities"
import { cn } from "@/src/shared/lib/utils"
import {
  BanIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  Undo2Icon,
  type LucideIcon,
} from "lucide-react"

const STATUS_MARK: Record<
  FinanceTransactionStatus,
  { icon: LucideIcon; className: string }
> = {
  CONFIRMED: { icon: CircleCheckIcon, className: "text-success" },
  PENDING: { icon: ClockIcon, className: "text-warning" },
  DECLINED: { icon: CircleXIcon, className: "text-destructive" },
  CANCELLED: { icon: BanIcon, className: "text-muted-foreground" },
  REVERSED: { icon: Undo2Icon, className: "text-info" },
}

export function TransactionStatusMark({
  status,
}: {
  status: FinanceTransactionStatus
}) {
  const mark = STATUS_MARK[status]
  const Icon = mark.icon
  const label = FINANCE_TRANSACTION_STATUS_LABEL[status]

  return (
    <span title={label} className="inline-flex shrink-0" aria-label={label}>
      <Icon className={cn("size-4", mark.className)} aria-hidden />
    </span>
  )
}
