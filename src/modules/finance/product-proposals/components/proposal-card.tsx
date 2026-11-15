"use client"

import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { countLabel } from "@/src/modules/finance/shared/lib/count-label"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { PROPOSAL_STATUS_BADGE_LABEL } from "@/src/modules/finance/product-proposals/lib/proposal-status"
import { proposalApprovalReadiness } from "@/src/modules/finance/product-proposals/lib/proposal-review"
import {
  proposalEvidenceRows,
  proposalKindLabel,
  proposalProductDetail,
} from "@/src/modules/finance/product-proposals/lib/proposal-view"
import type {
  EmailProductProposal,
  EmailProductProposalStatus,
  FinanceAccount,
} from "@/src/modules/finance/shared/types/entities"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  CheckIcon,
  HashIcon,
  MailIcon,
  PencilIcon,
  ShieldCheckIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"

const STATUS_BADGE_VARIANT: Record<
  EmailProductProposalStatus,
  "warning" | "info" | "success" | "outline"
> = {
  PENDING: "warning",
  APPROVING: "info",
  APPROVED: "success",
  DISCARDED: "outline",
}

type ProposalCardProps = {
  proposal: EmailProductProposal
  accounts: readonly FinanceAccount[]
  display: FinanceMoneyDisplay
  locale: string
  approving: boolean
  discarding: boolean
  onApprove: () => void
  onEdit: () => void
  onDiscard: () => void
}

/**
 * Una propuesta detectada en el correo con su evidencia y sus acciones. No es
 * una entidad del catálogo: es un borrador que espera la aprobación explícita.
 */
export function ProposalCard({
  proposal,
  accounts,
  display,
  locale,
  approving,
  discarding,
  onApprove,
  onEdit,
  onDiscard,
}: ProposalCardProps) {
  const readiness = proposalApprovalReadiness(proposal)
  const evidence = proposalEvidenceRows({
    evidence: proposal.evidence,
    locale,
  })
  const hiddenEvidence = proposal.evidence.length - evidence.length
  const account = accounts.find((item) => item.id === proposal.draft.accountId)
  const pending = proposal.status === "PENDING"
  const busy = approving || discarding
  const institutionName = proposal.draft.institution.name.trim()

  return (
    <div className="relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-3">
      <div className="flex items-start gap-3">
        <BrandLogo
          name={institutionName || proposal.draft.name}
          size={36}
          className="shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">
            {proposal.draft.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {proposalProductDetail(proposal)}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {proposalKindLabel(proposal)}
            {institutionName ? ` · ${institutionName}` : ""}
          </span>
        </div>
        <Badge variant={STATUS_BADGE_VARIANT[proposal.status]}>
          {PROPOSAL_STATUS_BADGE_LABEL[proposal.status]}
        </Badge>
      </div>

      {proposal.productType === "ACCOUNT" ? (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {proposal.draft.accountNumberProvided ? (
            <ShieldCheckIcon className="size-3.5 shrink-0" aria-hidden />
          ) : (
            <HashIcon className="size-3.5 shrink-0" aria-hidden />
          )}
          {proposal.draft.accountNumberProvided
            ? "Número completo guardado"
            : "Solo los últimos 4 dígitos"}
        </span>
      ) : (
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <WalletIcon className="size-3.5 shrink-0" aria-hidden />
          {account ? (
            <AccountProductRow
              account={account}
              display={display}
              variant="inline"
            />
          ) : (
            <span className="truncate">
              {proposal.draft.accountId
                ? "Cuenta no disponible"
                : "Sin cuenta asociada"}
            </span>
          )}
        </span>
      )}

      <div className="flex flex-col gap-1 border-t border-border/60 pt-2">
        <span className="text-xs text-muted-foreground">
          {countLabel(proposal.evidence.length, "message")}
        </span>
        <ul className="flex flex-col gap-1">
          {evidence.map((row) => (
            <li
              key={row.messageId}
              className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground"
            >
              <MailIcon className="size-3.5 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{row.subject}</span>
              <span className="max-w-[45%] shrink-0 truncate">
                {row.fromDomain} · {row.dateLabel}
              </span>
            </li>
          ))}
        </ul>
        {hiddenEvidence > 0 ? (
          <span className="text-xs text-muted-foreground">
            +{countLabel(hiddenEvidence, "message")} más
          </span>
        ) : null}
      </div>

      {pending && !readiness.ready ? (
        <p className="text-xs text-muted-foreground">
          {readiness.reason}. Edita la propuesta para completarlo.
        </p>
      ) : null}

      {pending ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            className="flex-1"
            disabled={!readiness.ready || busy}
            onClick={onApprove}
          >
            {approving ? (
              <Spinner className="size-4" />
            ) : (
              <CheckIcon className="size-4 shrink-0" aria-hidden />
            )}
            Aprobar
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Editar propuesta"
            disabled={busy}
            onClick={onEdit}
          >
            <PencilIcon className="size-4 shrink-0" aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Descartar propuesta"
            disabled={busy}
            onClick={onDiscard}
          >
            {discarding ? (
              <Spinner className="size-4" />
            ) : (
              <XIcon className="size-4 shrink-0" aria-hidden />
            )}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
