"use client"

import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query"

import {
  financeInfiniteListQuery,
  type FinanceListPage,
  type FinanceListParams,
} from "@/src/modules/finance/shared/lib/finance-query-options"

type ExtraOptions<TPage extends FinanceListPage> = Omit<
  UseInfiniteQueryOptions<
    TPage,
    Error,
    InfiniteData<TPage>,
    readonly unknown[],
    string | undefined
  >,
  "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>

export type UseInfiniteFinanceListOptions<TPage extends FinanceListPage> = {
  queryKey: readonly unknown[]
  endpoint: string
  params?: FinanceListParams
} & ExtraOptions<TPage>

/**
 * One cursor-paginated finance list. Every growing list shares this hook so the
 * page shape and the "load more" trigger stay the same across screens.
 */
export function useInfiniteFinanceList<TPage extends FinanceListPage>({
  queryKey,
  endpoint,
  params,
  ...rest
}: UseInfiniteFinanceListOptions<TPage>) {
  return useInfiniteQuery<
    TPage,
    Error,
    InfiniteData<TPage>,
    readonly unknown[],
    string | undefined
  >({
    ...financeInfiniteListQuery<TPage>({ queryKey, endpoint, params }),
    ...rest,
  })
}
