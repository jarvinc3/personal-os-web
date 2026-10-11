"use client"

import { loanInstallmentsQuery } from "@/src/modules/finance/shared/lib/finance-query-options"
import { useQuery } from "@tanstack/react-query"

export function useLoanInstallments(enabled: boolean, loanId: string | null) {
  return useQuery({
    ...loanInstallmentsQuery(loanId ?? ""),
    enabled: enabled && Boolean(loanId),
  })
}
