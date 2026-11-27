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
  chooseApprovalInstitution,
  failApproval,
  initialApprovalState,
  institutionApprovalPrefill,
  matchedApprovalProduct,
  retryProductId,
  startApproval,
  type ProposalApprovalState,
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
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useBackTo } from "@/src/shared/hooks/use-back-to"
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
import { useState } from "react"

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

function ProposalApprovalScreenBody({
  proposalId,
}: ProposalApprovalScreenProps) {
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const proposalsQuery = useEmailProductProposals(isEnabled, "PENDING")
  const institutionsQuery = useInstitutions(isEnabled)
  const accountsQuery = useAccounts(isEnabled)
  const cardsQuery = useCards(isEnabled)
  const approveMutation = useApproveEmailProductProposal()
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "institution"
  >("none")
  const [flow, setFlow] = useState<ProposalApprovalState | null>(null)

  const proposals = proposalsQuery.data ?? []
  const institutions = institutionsQuery.data ?? []
  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []
  const proposal = proposals.find((item) => item.id === proposalId) ?? null
  const initialFlow = proposal
    ? initialApprovalState({ proposal, institutions })
    : null
  const resolvedFlow = flow ?? initialFlow
  const step = resolvedFlow?.step ?? "institution"
  const institution = resolvedFlow?.institution ?? null
  const createdProductId = resolvedFlow?.createdProductId ?? null
  const approvalError = resolvedFlow?.approvalError ?? null
  const retryId = resolvedFlow ? retryProductId(resolvedFlow) : null
  const formInstitutions =
    institution && !institutions.some((item) => item.id === institution.id)
      ? [institution, ...institutions]
      : institutions
  const matchedProduct = proposal
    ? matchedApprovalProduct({
        proposal,
        institutionId: institution?.id ?? null,
        accounts,
        cards,
      })
    : null
  const isAccount = proposal?.productType === "ACCOUNT"
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  const backToList = useBackTo(APP_ROUTES.app.financeProductProposals)

  usePageHeader(
    {
      variant: "secondary",
      title: "Revisar y aprobar",
      onBack: backToList,
    },
    [backToList]
  )

  function updateFlow(
    update: (state: ProposalApprovalState) => ProposalApprovalState
  ) {
    setFlow((current) => {
      const base = current ?? initialFlow
      return base ? update(base) : current
    })
  }

  function chooseInstitution(next: FinanceInstitution) {
    updateFlow((current) => chooseApprovalInstitution(current, next))
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
    updateFlow((current) => startApproval(current, productId))
    try {
      await approveMutation.mutateAsync({ proposalId, productId })
      appToast.success({ text1: "Producto aprobado" })
      backToList()
    } catch (error) {
      updateFlow((current) => failApproval(current, financeErrorMessage(error)))
    }
  }

  if (
    (proposalsQuery.isPending && !proposalsQuery.data) ||
    (institutionsQuery.isPending && !institutionsQuery.data)
  ) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    )
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
            onRetry={() => {
              if (retryId) {
                void approveProduct(retryId)
              }
            }}
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
          value={institution?.id ?? ""}
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
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => openPicker("institution")}
        >
          <LandmarkIcon className="size-4 shrink-0" aria-hidden />
          Cambiar institución
        </Button>
      </SummarySection>

      {matchedProduct ? (
        <SummarySection
          title="Producto existente"
          icon={isAccount ? WalletIcon : CreditCardIcon}
        >
          {matchedProduct.account ? (
            <AccountProductRow
              account={matchedProduct.account}
              display={display}
            />
          ) : null}
          {matchedProduct.card ? (
            <CardProductRow
              card={matchedProduct.card}
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
            onClick={() => void approveProduct(matchedProduct.id)}
          >
            <Link2Icon className="size-4 shrink-0" aria-hidden />
            Vincular a producto existente
          </Button>
        </SummarySection>
      ) : isAccount ? (
        <AccountSheet
          open
          onOpenChange={(open) => {
            if (!open) {
              backToList()
            }
          }}
          account={null}
          institutions={formInstitutions}
          selectedInstitutionId={institution.id}
          defaultCurrency={proposal.draft.currency || config.baseCurrency}
          defaultInstitutionId={institution.id}
          prefill={accountApprovalPrefill(proposal)}
          lastFourOnly
          excludeCash
          onCreated={(account) => void approveProduct(account.id)}
        />
      ) : (
        <CardFormScreen
          card={null}
          institutions={formInstitutions}
          accounts={accounts}
          selectedInstitutionId={institution.id}
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
        value={institution.id}
        onSelect={chooseInstitutionById}
      />
    </div>
  )
}
