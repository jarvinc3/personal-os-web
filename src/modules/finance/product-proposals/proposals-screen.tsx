"use client"

import { ProposalCard } from "@/src/modules/finance/product-proposals/components/proposal-card"
import { ProposalEditSheet } from "@/src/modules/finance/product-proposals/components/proposal-edit-sheet"
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
  useApproveEmailProductProposal,
  useDiscardEmailProductProposal,
  useDiscoverEmailProductProposals,
  useEmailProductProposals,
} from "@/src/modules/finance/shared/hooks/use-email-product-proposals"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useSheetListEntity } from "@/src/modules/finance/shared/hooks/use-sheet-entity"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type {
  EmailProductProposal,
  EmailProductProposalDiscovery,
  EmailProductProposalStatus,
} from "@/src/modules/finance/shared/types/entities"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { ListSkeleton } from "@/src/shared/components/feedback/list-skeleton"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
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
} from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"

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
  const status = useMemo(
    () => proposalStatusFromSearchParams(searchParams),
    [searchParams]
  )
  const [discovery, setDiscovery] =
    useState<EmailProductProposalDiscovery | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [discardingId, setDiscardingId] = useState<string | null>(null)
  const [pendingDiscardId, setPendingDiscardId] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PROPOSALS_PAGE_SIZE)

  const filtersSheet = useSheetParam(FINANCE_SHEET_KEYS.proposalFilters)
  const editSheet = useSheetParam(FINANCE_SHEET_KEYS.proposalEdit)
  const proposalsQuery = useEmailProductProposals(isEnabled, status)
  const accountsQuery = useAccounts(isEnabled)
  const institutionsQuery = useInstitutions(isEnabled)
  const discoverMutation = useDiscoverEmailProductProposals()
  const approveMutation = useApproveEmailProductProposal()
  const discardMutation = useDiscardEmailProductProposal()

  const proposals = proposalsQuery.data ?? []
  const accounts = accountsQuery.data ?? []
  const institutions = institutionsQuery.data ?? []
  const shown = proposals.slice(0, visibleCount)
  const emptyCopy = EMPTY_COPY[status]
  const unavailable = isProposalEndpointUnavailable(proposalsQuery.error)
  const editing = useSheetListEntity(
    editSheet.open,
    editSheet.sheetId,
    proposals,
    proposalsQuery.isPending,
    editSheet.setOpen
  )
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

  async function approve(proposal: EmailProductProposal) {
    setApprovingId(proposal.id)
    try {
      const approved = await approveMutation.mutateAsync(proposal.id)
      appToast.success({
        text1: approved.approval?.duplicate
          ? "Ese producto ya existía"
          : "Producto aprobado",
      })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    } finally {
      setApprovingId(null)
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
          Revisa los correos guardados y propone las cuentas y tarjetas que
          aparezcan. Nada se crea hasta que lo apruebes.
        </p>
        <Button
          type="button"
          className="w-full"
          disabled={discoverMutation.isPending || !isEnabled}
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
          message={financeErrorMessage(proposalsQuery.error)}
          onRetry={() => void proposalsQuery.refetch()}
          isRetrying={proposalsQuery.isFetching}
        />
      ) : null}

      <AsyncRegion
        pending={proposalsQuery.isPending && !proposalsQuery.data}
        pendingFallback={<ListSkeleton rows={3} />}
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
              approving={approvingId === proposal.id}
              discarding={discardingId === proposal.id}
              onApprove={() => void approve(proposal)}
              onEdit={() => editSheet.setOpen(true, proposal.id)}
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

      {editing ? (
        <ProposalEditSheet
          open={editSheet.open}
          onOpenChange={editSheet.setOpen}
          proposal={editing}
          accounts={accounts}
          institutions={institutions}
          display={display}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDiscard)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDiscardId(null)
          }
        }}
        tone="danger"
        icon={Trash2Icon}
        title={`¿Descartar ${pendingDiscard?.draft.name ?? "la propuesta"}?`}
        description="No se crea ningún producto. La propuesta queda fuera de la lista y no se puede recuperar."
        confirmLabel="Descartar"
        confirmIcon={Trash2Icon}
        pending={discardMutation.isPending}
        onConfirm={() => void discardPending()}
      />
    </div>
  )
}
