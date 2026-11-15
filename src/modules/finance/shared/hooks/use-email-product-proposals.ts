"use client"

import { apiGet, apiPost } from "@/src/config/api-client"
import { invalidateFinancePositions } from "./use-balance-sheet"
import { buildFinanceQueryPath } from "@/src/modules/finance/shared/lib/finance-query-options"
import {
  FINANCE_EMAIL_PRODUCT_PROPOSALS_QUERY_KEY,
  FINANCE_INSTITUTIONS_QUERY_KEY,
} from "@/src/modules/finance/shared/types/api"
import type {
  EmailProductProposal,
  EmailProductProposalDiscovery,
  EmailProductProposalStatus,
} from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query"

function invalidateProposals(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: FINANCE_EMAIL_PRODUCT_PROPOSALS_QUERY_KEY,
  })
}

export function useEmailProductProposals(
  enabled: boolean,
  status: EmailProductProposalStatus
) {
  return useQuery({
    queryKey: [...FINANCE_EMAIL_PRODUCT_PROPOSALS_QUERY_KEY, status],
    queryFn: ({ signal }) =>
      apiGet<EmailProductProposal[]>(
        buildFinanceQueryPath({
          endpoint: API_ENDPOINTS.INTELLIGENCE.EMAIL_PRODUCT_PROPOSALS,
          params: { status },
        }),
        signal
      ),
    enabled,
  })
}

export function useDiscoverEmailProductProposals() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiPost<EmailProductProposalDiscovery>(
        API_ENDPOINTS.INTELLIGENCE.EMAIL_PRODUCT_PROPOSAL_DISCOVER,
        {}
      ),
    onSuccess: () => invalidateProposals(queryClient),
  })
}

export function useApproveEmailProductProposal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      proposalId,
      productId,
    }: {
      proposalId: string
      productId: string
    }) =>
      apiPost<EmailProductProposal>(
        API_ENDPOINTS.INTELLIGENCE.EMAIL_PRODUCT_PROPOSAL_APPROVE(proposalId),
        { productId }
      ),
    onSuccess: () => {
      invalidateProposals(queryClient)
      void queryClient.invalidateQueries({
        queryKey: FINANCE_INSTITUTIONS_QUERY_KEY,
      })
      invalidateFinancePositions(queryClient)
    },
  })
}

export function useDiscardEmailProductProposal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (proposalId: string) =>
      apiPost<EmailProductProposal>(
        API_ENDPOINTS.INTELLIGENCE.EMAIL_PRODUCT_PROPOSAL_DISCARD(proposalId),
        {}
      ),
    onSuccess: () => invalidateProposals(queryClient),
  })
}
