"use client"

import { ApiError } from "@/src/config/api-client"
import { PublicShareDetailSheet } from "@/src/modules/finance/receivables/components/public-share-detail-sheet"
import {
  formatPublicShareUpdatedAt,
  publicShareCountCaption,
  publicShareCurrencyRows,
  publicShareItemCaption,
  publicShareItemProgress,
  publicSharePendingTotals,
  type PublicReceivableShareItem,
} from "@/src/modules/finance/receivables/lib/public-receivable-share"
import { formatSharePendingTotals } from "@/src/modules/finance/receivables/lib/receivable-share"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceProgressHero } from "@/src/modules/finance/shared/components/layout/progress-hero"
import { PlanningProgressCard } from "@/src/modules/finance/shared/components/planning-progress-card"
import { financeLoadErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { usePublicReceivableShare } from "@/src/modules/finance/shared/hooks/use-receivable-shares"
import {
  FINANCE_RECEIVABLE_STATUS_LABEL,
  FINANCE_RECEIVABLE_STATUS_VARIANT,
} from "@/src/modules/finance/shared/types/entities"
import { AppLogo } from "@/src/shared/components/brand/app-logo"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import {
  ACCENT_FALLBACK_COLOR,
  accentSurfaceGradient,
} from "@/src/shared/lib/accent-gradient"
import { HandshakeIcon, LinkIcon } from "lucide-react"
import { useState } from "react"

/**
 * Display for a visitor without a session: there are no finance settings to
 * read, and every amount is shown in the currency of its own cobro.
 */
const PUBLIC_DISPLAY = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
}

type PublicReceivableShareScreenProps = {
  token: string
}

export function PublicReceivableShareScreen({
  token,
}: PublicReceivableShareScreenProps) {
  const shareQuery = usePublicReceivableShare(token)
  const [openItem, setOpenItem] = useState<PublicReceivableShareItem | null>(
    null
  )

  const share = shareQuery.data

  if (shareQuery.isPending) {
    return <LoadingView variant="screen" />
  }

  if (!share) {
    const notFound =
      shareQuery.error instanceof ApiError && shareQuery.error.status === 404
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center p-4 md:px-6">
        {notFound ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LinkIcon />
              </EmptyMedia>
              <EmptyTitle>Este link ya no está disponible</EmptyTitle>
              <EmptyDescription>
                Puede que se haya revocado o vencido. Pídele a quien te lo
                compartió que genere uno nuevo.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <FinanceErrorState
            message={financeLoadErrorMessage(shareQuery.error)}
            onRetry={() => void shareQuery.refetch()}
            isRetrying={shareQuery.isFetching}
          />
        )}
      </div>
    )
  }

  const display = PUBLIC_DISPLAY
  const currencyRows = publicShareCurrencyRows(share.totalsByCurrency, display)
  const pendingLabel = formatSharePendingTotals(
    publicSharePendingTotals(share.totalsByCurrency, display)
  )
  const updatedLabel = formatPublicShareUpdatedAt(share.updatedAt, new Date())

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 pb-16 md:px-6">
      <FinanceProgressHero
        accent={accentSurfaceGradient(ACCENT_FALLBACK_COLOR)}
        decoration={
          <div className="relative z-10 mb-6 flex items-center gap-2">
            <AppLogo size="sm" />
            <span className="text-sm font-medium text-white/90">
              Personal OS
            </span>
          </div>
        }
        media={
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
            {share.ownerFirstName.slice(0, 1).toUpperCase()}
          </span>
        }
        title={`${share.ownerFirstName} te comparte tus cobros`}
        subtitle={`Hola, ${share.debtorName}`}
        metricLabel="Total pendiente"
        metricValue={pendingLabel}
        progressRows={currencyRows.map((row) => ({
          key: row.currency,
          progress: row.progress,
          startCaption: row.paidCaption,
          endCaption: row.totalCaption,
        }))}
      />

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Detalle</h2>
        <span className="text-sm text-muted-foreground">
          {publicShareCountCaption(share.items.length)}
        </span>
      </div>

      {share.items.length === 0 ? (
        <Empty className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HandshakeIcon />
            </EmptyMedia>
            <EmptyTitle>No hay cobros por ver</EmptyTitle>
            <EmptyDescription>
              Quien te compartió el link los canceló o los dejó sin efecto.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {share.items.map((item) => {
            const money = { ...display, currency: item.currency }
            return (
              <PlanningProgressCard
                key={item.ref}
                title={item.concept}
                description={`Creado ${formatCalendarDate(item.createdAt)}`}
                icon={HandshakeIcon}
                tone={item.status === "PAID" ? "success" : "info"}
                badge={{
                  label:
                    FINANCE_RECEIVABLE_STATUS_LABEL[item.status] ?? item.status,
                  variant: FINANCE_RECEIVABLE_STATUS_VARIANT[item.status],
                }}
                progress={publicShareItemProgress(item)}
                currentHint="Cobrado"
                currentLabel={formatFinanceMoney(item.paid, money)}
                targetHint="Total"
                targetLabel={formatFinanceMoney(item.amount, money)}
                caption={publicShareItemCaption(item, display)}
                onPress={() => setOpenItem(item)}
              />
            )
          })}
        </div>
      )}

      <div className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
        <p>Toca un cobro para ver su detalle</p>
        {updatedLabel ? <p>{updatedLabel}</p> : null}
        <p>
          Hecho con <span className="font-semibold">Personal OS</span> · Solo
          lectura
        </p>
      </div>

      <PublicShareDetailSheet
        open={Boolean(openItem)}
        onOpenChange={(open) => {
          if (!open) {
            setOpenItem(null)
          }
        }}
        item={openItem}
        ownerFirstName={share.ownerFirstName}
        display={display}
      />
    </div>
  )
}
