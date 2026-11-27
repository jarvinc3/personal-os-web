"use client"

import { ProposalCard } from "@/src/modules/finance/product-proposals/components/proposal-card"
import { sortProposalsForReview } from "@/src/modules/finance/product-proposals/lib/proposal-approval"
import { ProposalFiltersSheet } from "@/src/modules/finance/product-proposals/components/proposal-filters-sheet"
import {
  discoveryLimitNote,
  discoverySummary,
} from "@/src/modules/finance/product-proposals/lib/discovery-summary"
import { isProposalEndpointUnavailable } from "@/src/modules/finance/product-proposals/lib/proposal-error"
import {
  PROPOSAL_STATUS_LABEL,
  proposalStatusFromSearchParams,
  withProposalStatus,
} from "@/src/modules/finance/product-proposals/lib/proposal-status"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import {
  useDiscardEmailProductProposal,
  useDiscoverEmailProductProposals,
  useEmailProductProposals,
} from "@/src/modules/finance/shared/hooks/use-email-product-proposals"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import type {
  EmailProductProposalDiscovery,
  EmailProductProposalStatus,
} from "@/src/modules/finance/shared/types/entities"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  InfoIcon,
  ListFilterIcon,
  MailSearchIcon,
  ScanSearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"

/** Propuestas que se montan de entrada; el resto entra al bajar. */
const PROPOSALS_PAGE_SIZE = 12

const EMPTY_COPY: Record<
  EmailProductProposalStatus,
  { title: string; description: string }
> = {
  PENDING: {
    title: "Sin propuestas pendientes",
    description: "Busca en correos para detectar cuentas y tarjetas.",
  },
  APPROVING: {
    title: "Sin propuestas en curso",
    description: "Ninguna propuesta se está aprobando ahora.",
  },
  APPROVED: {
    title: "Sin propuestas aprobadas",
    description: "Las que apruebes aparecen aquí y en Productos.",
  },
  DISCARDED: {
    title: "Sin propuestas descartadas",
    description: "Las que descartes quedan aquí como registro.",
  },
}

export function ProductProposalsScreen() {
  return (
    <FinanceGate>
      <ProductProposalsScreenBody />
    </FinanceGate>
  )
}

function ProductProposalsScreenBody() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const status = proposalStatusFromSearchParams(searchParams)
  const [discovery, setDiscovery] =
    useState<EmailProductProposalDiscovery | null>(null)
  const [discardingId, setDiscardingId] = useState<string | null>(null)
  const [pendingDiscardId, setPendingDiscardId] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PROPOSALS_PAGE_SIZE)

  const filtersSheet = useSheetParam(FINANCE_SHEET_KEYS.proposalFilters)
  const proposalsQuery = useEmailProductProposals(isEnabled, status)
  const accountsQuery = useAccounts(isEnabled)
  const discoverMutation = useDiscoverEmailProductProposals()
  const discardMutation = useDiscardEmailProductProposal()

  const proposals = proposalsQuery.data ?? []
  const accounts = accountsQuery.data ?? []
  const ordered = sortProposalsForReview(proposals)
  const shown = ordered.slice(0, visibleCount)
  const emptyCopy = EMPTY_COPY[status]
  const unavailable = isProposalEndpointUnavailable(proposalsQuery.error)
  const pendingDiscard =
    proposals.find((proposal) => proposal.id === pendingDiscardId) ?? null
  const limitNote = discovery ? discoveryLimitNote(discovery) : null
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.financeProducts)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: "Detectados en correos",
      onBack: handleBack,
    },
    [handleBack]
  )

  function changeStatus(next: EmailProductProposalStatus) {
    setVisibleCount(PROPOSALS_PAGE_SIZE)
    const query = withProposalStatus(searchParams.toString(), next)
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }

  async function runDiscovery() {
    try {
      const discoveryResult = await discoverMutation.mutateAsync()
      setDiscovery(discoveryResult)
      appToast.success({ text1: "Búsqueda terminada" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function discardPending() {
    if (!pendingDiscard) {
      return
    }
    setDiscardingId(pendingDiscard.id)
    try {
      await discardMutation.mutateAsync(pendingDiscard.id)
      appToast.success({ text1: "Propuesta descartada" })
      setPendingDiscardId(null)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    } finally {
      setDiscardingId(null)
    }
  }

  if (unavailable) {
    return (
      <Alert>
        <InfoIcon aria-hidden />
        <AlertTitle>Solo disponible en desarrollo</AlertTitle>
        <AlertDescription>
          Las propuestas de productos detectados en correos se habilitan cuando
          el entorno las tiene activas. Aquí no hay nada que revisar.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SummarySection title="Propuestas de correo" icon={MailSearchIcon}>
        <p className="px-1 text-sm text-muted-foreground">
          Sugerencias a partir de correos de BHD ya guardados que no se pudieron
          asignar a un producto. No se lee Gmail en vivo. Nada se crea hasta que
          lo apruebes.
        </p>
        <Button
          type="button"
          className="w-full"
          disabled={discoverMutation.isPending}
          onClick={() => void runDiscovery()}
        >
          {discoverMutation.isPending ? (
            <Spinner className="size-4" />
          ) : (
            <ScanSearchIcon className="size-4 shrink-0" aria-hidden />
          )}
          Buscar en correos
        </Button>
        {discovery ? (
          <Alert role="status">
            <MailSearchIcon aria-hidden />
            <AlertTitle>Búsqueda terminada</AlertTitle>
            <AlertDescription>
              <p>{discoverySummary(discovery)}</p>
              {limitNote ? <p>{limitNote}</p> : null}
            </AlertDescription>
          </Alert>
        ) : null}
      </SummarySection>

      <SummaryItem
        title="Estado"
        description="Filtra las propuestas"
        value={PROPOSAL_STATUS_LABEL[status]}
        icon={ListFilterIcon}
        onPress={() => filtersSheet.setOpen(true)}
        showChevron
        className="px-3"
      />

      {proposalsQuery.isError && !unavailable ? (
        <ErrorState
          message={financeLoadErrorMessage(proposalsQuery.error)}
          onRetry={() => void proposalsQuery.refetch()}
          isRetrying={proposalsQuery.isFetching}
        />
      ) : null}

      <AsyncRegion
        pending={proposalsQuery.isPending && !proposalsQuery.data}
        pendingFallback={
          <div className="flex flex-col gap-2 px-3 py-2" aria-hidden>
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        }
        empty={proposals.length === 0}
        emptyFallback={
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MailSearchIcon />
              </EmptyMedia>
              <EmptyTitle>{emptyCopy.title}</EmptyTitle>
              <EmptyDescription>{emptyCopy.description}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        <div className="flex flex-col gap-2">
          {shown.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              accounts={accounts}
              display={display}
              locale={formatLocale}
              discarding={discardingId === proposal.id}
              reviewHref={APP_ROUTES.app.financeProductProposalApproval(
                proposal.id
              )}
              onDiscard={() => setPendingDiscardId(proposal.id)}
            />
          ))}
        </div>
        <InfiniteListSentinel
          hasNextPage={shown.length < proposals.length}
          isFetchingNextPage={false}
          onLoadMore={() =>
            setVisibleCount((current) => current + PROPOSALS_PAGE_SIZE)
          }
        />
      </AsyncRegion>

      <ProposalFiltersSheet
        open={filtersSheet.open}
        onOpenChange={filtersSheet.setOpen}
        status={status}
        onChange={changeStatus}
      />

      <AlertDialog
        open={Boolean(pendingDiscard)}
        onOpenChange={(open) => {
          if (!open && !discardMutation.isPending) {
            setPendingDiscardId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2Icon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              ¿Descartar {pendingDiscard?.draft.name ?? "la propuesta"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              No se crea ningún producto. La propuesta queda fuera de la lista y
              no se puede recuperar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={discardMutation.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={discardMutation.isPending}
              onClick={() => void discardPending()}
            >
              {discardMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Trash2Icon className="size-4 shrink-0" aria-hidden="true" />
              )}
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
