"use client"

import { ApiError } from "@/src/config/api-client"
import { PublicShareDetailSheet } from "@/src/modules/finance/receivables/components/public-share-detail-sheet"
import {
  formatPublicShareUpdatedAt,
  publicShareCountCaption,
  publicShareCurrencyRows,
  publicSharePendingTotals,
} from "@/src/modules/finance/receivables/lib/public-receivable-share"
import { formatSharePendingTotals } from "@/src/modules/finance/receivables/lib/receivable-share"
import { ReceivableCard } from "@/src/modules/finance/receivables/components/receivable-card"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { FinanceProgressHero } from "@/src/modules/finance/shared/components/layout/progress-hero"
import { SettingsSection } from "@/src/shared/components/settings/settings-section"
import { financeLoadErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { DEFAULT_LOCALE } from "@/src/modules/settings/lib/locale-options"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { usePublicReceivableShare } from "@/src/modules/finance/shared/hooks/use-receivable-shares"
import { AppLogo } from "@/src/shared/components/shell/app-logo"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
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
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"

/**
 * Display for a visitor without a session: there are no finance settings to
 * read, and every amount is shown in the currency of its own cobro.
 */
const PUBLIC_DISPLAY = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
  locale: DEFAULT_LOCALE,
}

type PublicReceivableShareScreenProps = {
  token: string
}

export function PublicReceivableShareScreen({
  token,
}: PublicReceivableShareScreenProps) {
  const shareQuery = usePublicReceivableShare(token)
  // El cobro elegido va en `sheetId` (su `ref`), así recargar reabre el mismo.
  const itemSheet = useSheetParam(FINANCE_SHEET_KEYS.publicReceivableDetail)

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
          <ErrorState
            message={financeLoadErrorMessage(shareQuery.error)}
            onRetry={() => void shareQuery.refetch()}
            isRetrying={shareQuery.isFetching}
          />
        )}
      </div>
    )
  }

  const currencyRows = publicShareCurrencyRows(
    share.totalsByCurrency,
    PUBLIC_DISPLAY
  )
  const pendingLabel = formatSharePendingTotals(
    publicSharePendingTotals(share.totalsByCurrency, PUBLIC_DISPLAY)
  )
  const updatedLabel = formatPublicShareUpdatedAt(
    share.updatedAt,
    new Date(),
    PUBLIC_DISPLAY.locale
  )

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

      <SettingsSection
        title="Detalle"
        bare
        headerTrailing={
          <span className="text-sm text-muted-foreground">
            {publicShareCountCaption(share.items.length)}
          </span>
        }
      >
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
            {share.items.map((item) => (
              <ReceivableCard
                key={item.ref}
                source={{ kind: "shared", item }}
                display={PUBLIC_DISPLAY}
                onPress={() => itemSheet.setOpen(true, item.ref)}
              />
            ))}
          </div>
        )}
      </SettingsSection>

      <div className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
        <p>Toca un cobro para ver su detalle</p>
        {updatedLabel ? <p>{updatedLabel}</p> : null}
        <p>
          Hecho con <span className="font-semibold">Personal OS</span> · Solo
          lectura
        </p>
      </div>

      <PublicShareDetailSheet
        open={itemSheet.open}
        onOpenChange={itemSheet.setOpen}
        item={
          share.items.find((item) => item.ref === itemSheet.sheetId) ?? null
        }
        ownerFirstName={share.ownerFirstName}
        display={PUBLIC_DISPLAY}
      />
    </div>
  )
}
