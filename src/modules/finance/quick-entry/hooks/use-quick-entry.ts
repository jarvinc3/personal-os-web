"use client"

import { apiPost } from "@/src/config/api-client"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import type { QuickEntryParseResult } from "@/src/modules/finance/quick-entry/types"
import { useMutation } from "@tanstack/react-query"

/** Parses a sentence into a draft. The back never saves from here. */
export function useQuickEntryParse() {
  return useMutation({
    mutationFn: (text: string) =>
      apiPost<QuickEntryParseResult>(API_ENDPOINTS.FINANCE.QUICK_ENTRY_PARSE, {
        text,
      }),
  })
}
