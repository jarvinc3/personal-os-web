"use client"

import { apiGet } from "@/src/config/api-client"
import { FINANCE_ANALYTICS_QUERY_KEY } from "@/src/modules/finance/shared/types/api"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useQuery } from "@tanstack/react-query"

export type WeeklySummary = {
  weekStart: string
  weekEnd: string
  currency: string
  expenses: string
  averageExpenses: string
  topCategories: {
    name: string
    icon: string | null
    color: string | null
    total: string
  }[]
  budgetsAtRisk: {
    id: string
    name: string
    pctUsed: number
    spent: string
    limit: string
  }[]
  upcomingInstallments: {
    loanId: string
    lenderName: string
    amount: string
    currency: string
    dueDate: string
  }[]
  cardDueDates: {
    cardId: string
    name: string
    lastFour: string | null
    dueDay: number
  }[]
  pendingEmails: number
}

export function useWeeklySummary(enabled: boolean) {
  return useQuery({
    queryKey: [...FINANCE_ANALYTICS_QUERY_KEY, "weekly-summary"],
    queryFn: () =>
      apiGet<WeeklySummary>(API_ENDPOINTS.FINANCE.ANALYTICS_WEEKLY_SUMMARY),
    enabled,
  })
}
