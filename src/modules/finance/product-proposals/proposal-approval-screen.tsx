"use client"

import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { CardProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { InstitutionPickerSheet } from "@/src/modules/finance/shared/components/pickers/institution-picker"
import { AccountSheet } from "@/src/modules/finance/catalog"
import { CardFormScreen } from "@/src/modules/finance/cards"
import { InstitutionFormScreen } from "@/src/modules/finance/institutions"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import {
  accountApprovalPrefill,
  cardApprovalPrefill,
  initialApprovalStep,
  institutionApprovalPrefill,
  resolveApprovalInstitution,
  type ProposalApprovalStep,
} from "@/src/modules/finance/product-proposals/lib/proposal-approval"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import {
  useApproveEmailProductProposal,
  useEmailProductProposals,
} from "@/src/modules/finance/shared/hooks/use-email-product-proposals"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceInstitution } from "@/src/modules/finance/shared/types/entities"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  ArrowLeftIcon,
  Building2Icon,
  CreditCardIcon,
  LandmarkIcon,
  Link2Icon,
  MailSearchIcon,
  WalletIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"

type ProposalApprovalScreenProps = {
  proposalId: string
}

export function ProposalApprovalScreen({
  proposalId,
}: ProposalApprovalScreenProps) {
  return (
    <FinanceGate>
      <ProposalApprovalScreenBody proposalId={proposalId} />
    </FinanceGate>
  )
}

type ApprovalFlow = {
  step: ProposalApprovalStep
  institutionId: string | null
}

function ProposalApprovalScreenBody({
  proposalId,
}: ProposalApprovalScreenProps) {
  const router = useRouter()
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const proposalsQuery = useEmailProductProposals(isEnabled, "PENDING")
  const institutionsQuery = useInstitutions(isEnabled)
  const accountsQuery = useAccounts(isEnabled)
  const cardsQuery = useCards(isEnabled)
  const approveMutation = useApproveEmailProductProposal()
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "institution"
  >("none")
  const [flow, setFlow] = useState<ApprovalFlow | null>(null)
  const [createdInstitution, setCreatedInstitution] =
    useState<FinanceInstitution | null>(null)
  const [createdProductId, setCreatedProductId] = useState<string | null>(null)
  const [approvalError, setApprovalError] = useState<string | null>(null)

  const proposals = proposalsQuery.data ?? []
  const institutions = institutionsQuery.data ?? []
  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []
  const proposal = proposals.find((item) => item.id === proposalId) ?? null
  const compatibleInstitution = proposal
    ? resolveApprovalInstitution({ proposal, institutions })
    : null
  const initialFlow = proposal
    ? {
        step: initialApprovalStep({ proposal, institutions }),
        institutionId: compatibleInstitution?.id ?? null,
      }
    : null
  const step = flow?.step ?? initialFlow?.step ?? "institution"
  const institutionId =
    flow?.institutionId ?? initialFlow?.institutionId ?? null
  const institution =
    institutions.find((item) => item.id === institutionId) ??
    (createdInstitution?.id === institutionId ? createdInstitution : null) ??
    (compatibleInstitution?.id === institutionId ? compatibleInstitution : null)
  const formInstitutions =
    institution && !institutions.some((item) => item.id === institution.id)
      ? [institution, ...institutions]
      : institutions
  const isAccount = proposal?.productType === "ACCOUNT"
  const matchedProductId =
    proposal?.matchedProductId &&
    institutionId &&
    proposal.draft.institution.matchedInstitutionIds.includes(institutionId)
      ? proposal.matchedProductId
      : null
  const matchedAccount =
    matchedProductId && isAccount
      ? (accounts.find((account) => account.id === matchedProductId) ?? null)
      : null
  const matchedCard =
    matchedProductId && !isAccount
      ? (cards.find((card) => card.id === matchedProductId) ?? null)
      : null
  const canChangeInstitution = Boolean(institution)
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  const backToList = useCallback(() => {
    router.push(APP_ROUTES.app.financeProductProposals)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: "Revisar y aprobar",
      onBack: backToList,
    },
    [backToList]
  )

  function chooseInstitution(next: FinanceInstitution) {
    setCreatedInstitution(next)
    setFlow({ step: "product", institutionId: next.id })
  }

  function chooseInstitutionById(nextInstitutionId: string) {
    const selected = formInstitutions.find(
      (item) => item.id === nextInstitutionId
    )
    if (selected) {
      chooseInstitution(selected)
    }
  }

  async function approveProduct(productId: string) {
    setCreatedProductId(productId)
    setApprovalError(null)
    try {
      await approveMutation.mutateAsync({ proposalId, productId })
      appToast.success({ text1: "Producto aprobado" })
      backToList()
    } catch (error) {
      setApprovalError(financeErrorMessage(error))
    }
  }

  if (
    (proposalsQuery.isPending && !proposalsQuery.data) ||
    (institutionsQuery.isPending && !institutionsQuery.data)
  ) {
    return <LoadingView />
  }

  if (proposalsQuery.error) {
    return (
      <ErrorState
        message={financeLoadErrorMessage(proposalsQuery.error)}
        onRetry={() => void proposalsQuery.refetch()}
        isRetrying={proposalsQuery.isFetching}
      />
    )
  }

  if (!proposal) {
    return (
      <MissingRecord
        icon={MailSearchIcon}
        title="Esta propuesta ya no está pendiente"
        description="Se aprobó o se descartó en otra pantalla. Vuelve a la lista para ver las que quedan."
        backHref={APP_ROUTES.app.financeProductProposals}
        backLabel="Volver a propuestas"
      />
    )
  }

  if (createdProductId) {
    return (
      <SummarySection title="Aprobación" icon={Link2Icon}>
        {approveMutation.isPending ? (
          <p className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            Aprobando el producto…
          </p>
        ) : null}
        {approvalError ? (
          <ErrorState
            message={approvalError}
            onRetry={() => void approveProduct(createdProductId)}
            isRetrying={approveMutation.isPending}
          />
        ) : null}
        {approvalError ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={backToList}
          >
            <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
            Volver a propuestas
          </Button>
        ) : null}
      </SummarySection>
    )
  }

  if (step === "institution" || !institution) {
    return (
      <div className="flex flex-col gap-4">
        <SummarySection title="Institución" icon={Building2Icon}>
          <p className="px-1 text-sm text-muted-foreground">
            El correo no coincide con una institución tuya. Créala con el
            formulario de siempre o elige una que ya tengas.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => openPicker("institution")}
          >
            <LandmarkIcon className="size-4 shrink-0" aria-hidden />
            Elegir una existente
          </Button>
        </SummarySection>
        <InstitutionFormScreen
          prefill={institutionApprovalPrefill(proposal)}
          startAtForm
          onCreated={chooseInstitution}
          onDone={backToList}
        />
        <InstitutionPickerSheet
          open={picker === "institution"}
          onOpenChange={closeHandlerFor("institution")}
          institutions={formInstitutions}
          value={institutionId ?? ""}
          onSelect={chooseInstitutionById}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SummarySection title="Institución" icon={Building2Icon}>
        <p className="px-1 text-sm">
          <span className="font-medium">{institution.name}</span>
        </p>
        {canChangeInstitution ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => openPicker("institution")}
          >
            <LandmarkIcon className="size-4 shrink-0" aria-hidden />
            Cambiar institución
          </Button>
        ) : null}
      </SummarySection>

      {matchedProductId && (matchedAccount || matchedCard) ? (
        <SummarySection
          title="Producto existente"
          icon={isAccount ? WalletIcon : CreditCardIcon}
        >
          {matchedAccount ? (
            <AccountProductRow account={matchedAccount} display={display} />
          ) : null}
          {matchedCard ? (
            <CardProductRow
              card={matchedCard}
              accounts={accounts}
              display={display}
            />
          ) : null}
          <p className="px-1 text-sm text-muted-foreground">
            Ya existe con estos datos en {institution.name}. Vincúlalo para
            cerrar la propuesta sin crear otro.
          </p>
          <Button
            type="button"
            className="w-full"
            disabled={approveMutation.isPending}
            onClick={() => void approveProduct(matchedProductId)}
          >
            <Link2Icon className="size-4 shrink-0" aria-hidden />
            Vincular a producto existente
          </Button>
        </SummarySection>
      ) : isAccount ? (
        <AccountSheet
          key={institution.id}
          open
          onOpenChange={(open) => {
            if (!open) {
              backToList()
            }
          }}
          account={null}
          institutions={formInstitutions}
          defaultCurrency={proposal.draft.currency || config.baseCurrency}
          defaultInstitutionId={institution.id}
          prefill={accountApprovalPrefill(proposal)}
          lastFourOnly
          onCreated={(account) => void approveProduct(account.id)}
        />
      ) : (
        <CardFormScreen
          key={institution.id}
          card={null}
          institutions={formInstitutions}
          accounts={accounts}
          defaultCurrency={proposal.draft.currency || config.baseCurrency}
          defaultInstitutionId={institution.id}
          prefill={cardApprovalPrefill(proposal)}
          display={display}
          onDone={backToList}
          onCreated={(card) => void approveProduct(card.id)}
        />
      )}

      <InstitutionPickerSheet
        open={picker === "institution"}
        onOpenChange={closeHandlerFor("institution")}
        institutions={formInstitutions}
        value={institutionId ?? ""}
        onSelect={chooseInstitutionById}
      />
    </div>
  )
}
