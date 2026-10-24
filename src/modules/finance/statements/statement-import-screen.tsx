"use client"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { StatementImportButton } from "@/src/modules/finance/shared/components/statement-import-button"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  useApplyStatementImport,
  useDiscardStatementImport,
  useStatementImport,
  useUpdateStatementLine,
} from "@/src/modules/finance/shared/hooks/use-statement-import"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import { translateFinanceError } from "@/src/modules/finance/shared/lib/finance-error-messages"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  signedStatementLineAmount,
  statementLineDefaultDecision,
  statementLineGroups,
} from "@/src/modules/finance/shared/lib/statement-import"
import type {
  FinanceStatementImport,
  FinanceStatementImportLine,
  FinanceStatementLineDecision,
} from "@/src/modules/finance/shared/types/entities"
import {
  fromStatementImportExtra,
  StatementMovementRow,
} from "@/src/modules/finance/transactions"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import { Checkbox } from "@/src/shared/components/ui/checkbox"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { appToast } from "@/src/shared/lib/app-toast"
import { CheckCircleIcon, FileWarningIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type StatementImportScreenProps = {
  importId: string
}

export function StatementImportScreen({
  importId,
}: StatementImportScreenProps) {
  return (
    <FinanceGate>
      <StatementImportScreenBody importId={importId} />
    </FinanceGate>
  )
}

function lineDisplay(
  display: FinanceMoneyDisplay,
  line: { amount: string; type: "DEBIT" | "CREDIT"; currency: string }
): string {
  return formatFinanceMoney(signedStatementLineAmount(line), {
    ...display,
    currency: line.currency,
    leadingSign: true,
  })
}

function Group({
  title,
  description,
  emptyLabel,
  children,
}: {
  title: string
  description: string
  emptyLabel: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children ?? (
        <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      )}
    </section>
  )
}

function StatementHeaderCard({
  statement,
  display,
}: {
  statement: FinanceStatementImport
  display: FinanceMoneyDisplay
}) {
  const money = { ...display, currency: statement.header.currency }
  const period =
    statement.header.periodStart && statement.header.periodEnd
      ? `${formatCalendarDate(statement.header.periodStart, display.locale)} — ${formatCalendarDate(
          statement.header.periodEnd,
          display.locale
        )}`
      : "Periodo no leído"
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{statement.target.name}</p>
      <p className="font-semibold">{period}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">Saldo anterior</p>
          <p className="tabular-nums">
            {formatFinanceMoney(statement.header.previousBalance, money)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Saldo al corte</p>
          <p className="tabular-nums">
            {formatFinanceMoney(statement.header.closingBalance, money)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Pago mínimo</p>
          <p className="tabular-nums">
            {formatFinanceMoney(statement.header.minimumPayment, money)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Fecha límite</p>
          <p>
            {statement.header.dueDate
              ? formatCalendarDate(statement.header.dueDate, display.locale)
              : "—"}
          </p>
        </div>
      </div>
    </div>
  )
}

function StatementImportScreenBody({ importId }: StatementImportScreenProps) {
  const router = useRouter()
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const query = useStatementImport(isEnabled, importId)
  const updateLine = useUpdateStatementLine(importId)
  const apply = useApplyStatementImport(importId)
  const discard = useDiscardStatementImport(importId)
  const [adjust, setAdjust] = useState(false)

  const statement = query.data ?? null
  const display: FinanceMoneyDisplay = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  usePageHeader(
    {
      variant: "secondary",
      title: "Estado de cuenta",
      onBack: () => router.push(APP_ROUTES.app.financeProducts),
    },
    [router]
  )

  async function onToggle(
    line: FinanceStatementImportLine,
    isChecked: boolean
  ) {
    const fallback: FinanceStatementLineDecision =
      statementLineDefaultDecision(line)
    try {
      await updateLine.mutateAsync({
        lineId: line.id,
        decision: isChecked ? fallback : "IGNORE",
      })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onApply() {
    try {
      await apply.mutateAsync(adjust)
      appToast.success({ text1: "Estado de cuenta aplicado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onDiscard() {
    try {
      await discard.mutateAsync()
      router.push(APP_ROUTES.app.financeProducts)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  if (query.isPending && !statement) {
    return <LoadingView />
  }

  if (!statement) {
    return (
      <MissingRecord
        icon={FileWarningIcon}
        title="No encontramos este estado de cuenta"
        description="Puede que se haya descartado."
        backHref={APP_ROUTES.app.financeProducts}
        backLabel="Volver a Productos"
      />
    )
  }

  if (statement.status === "PARSING") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-semibold">Leyendo el PDF</p>
        <p className="text-sm text-muted-foreground">
          Estamos extrayendo el periodo y los movimientos.
        </p>
      </div>
    )
  }

  if (statement.status === "FAILED") {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="destructive">
          <FileWarningIcon />
          <AlertTitle>No pudimos leer el estado de cuenta</AlertTitle>
          <AlertDescription>
            {translateFinanceError(
              400,
              statement.failureReason ?? "",
              statement.error ?? undefined
            )}
          </AlertDescription>
        </Alert>
        <StatementImportButton
          cardId={
            statement.target.kind === "CARD" ? statement.target.id : undefined
          }
          accountId={
            statement.target.kind === "ACCOUNT"
              ? statement.target.id
              : undefined
          }
          label="Subir otra vez"
          className="w-full"
        />
      </div>
    )
  }

  const { matched, missing } = statementLineGroups(statement.lines)
  const applied = statement.status === "APPLIED"

  return (
    <div className="flex flex-col gap-5">
      {applied ? (
        <Alert>
          <CheckCircleIcon />
          <AlertTitle>Estado de cuenta aplicado</AlertTitle>
          <AlertDescription>
            {statement.counts.lines} movimientos revisados.
          </AlertDescription>
        </Alert>
      ) : null}
      <StatementHeaderCard statement={statement} display={display} />

      {!applied && statement.difference !== null ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <div>
            <p className="text-sm text-muted-foreground">Diferencia de saldo</p>
            <p className="text-xl font-semibold tabular-nums">
              {formatFinanceMoney(statement.difference, display)}
            </p>
          </div>
          {statement.adjustment ? (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={adjust}
                onCheckedChange={(value) => setAdjust(value === true)}
              />
              Ajustar la diferencia exacta
            </label>
          ) : (
            <p className="text-sm text-muted-foreground">
              La diferencia ya es cero.
            </p>
          )}
        </div>
      ) : null}

      <Group
        title="Coinciden"
        description="Ya están registrados en la app."
        emptyLabel="Ninguno."
      >
        {matched.length === 0 ? null : (
          <div className="rounded-2xl border border-border bg-card">
            {matched.map((line) => (
              <SummaryItem
                key={line.id}
                title={line.description}
                description={formatCalendarDate(line.date, display.locale)}
                value={lineDisplay(display, line)}
                trailing={
                  applied ? undefined : (
                    <Checkbox
                      checked={line.decision === "MATCH"}
                      onCheckedChange={(value) =>
                        void onToggle(line, value === true)
                      }
                      aria-label={`Mantener ${line.description}`}
                    />
                  )
                }
              />
            ))}
          </div>
        )}
      </Group>

      <Group
        title="Faltan en la app"
        description="Se crearán al aplicar. Desmarca lo que no quieras."
        emptyLabel="Nada por crear."
      >
        {missing.length === 0 ? null : (
          <div className="rounded-2xl border border-border bg-card">
            {missing.map((line) => (
              <SummaryItem
                key={line.id}
                title={line.description}
                description={[
                  formatCalendarDate(line.date, display.locale),
                  line.categoryName,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                value={lineDisplay(display, line)}
                trailing={
                  applied ? undefined : (
                    <Checkbox
                      checked={line.decision === "CREATE"}
                      onCheckedChange={(value) =>
                        void onToggle(line, value === true)
                      }
                      aria-label={`Crear ${line.description}`}
                    />
                  )
                }
              />
            ))}
          </div>
        )}
      </Group>

      <Group
        title="Sobran en la app"
        description="Están registrados en el ciclo y no aparecen en el PDF. Revísalos aparte."
        emptyLabel="Nada de más."
      >
        {statement.extra.length === 0 ? null : (
          <div className="rounded-2xl border border-border bg-card">
            {statement.extra.map((movement, index) => (
              <StatementMovementRow
                key={movement.id}
                movement={fromStatementImportExtra(movement)}
                display={display}
                isLast={index === statement.extra.length - 1}
              />
            ))}
          </div>
        )}
      </Group>

      {applied ? null : (
        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            disabled={apply.isPending}
            onClick={() => void onApply()}
          >
            <CheckCircleIcon className="size-4 shrink-0" />
            Aplicar estado de cuenta
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            disabled={discard.isPending}
            onClick={() => void onDiscard()}
          >
            <XIcon className="size-4 shrink-0" />
            Descartar
          </Button>
        </div>
      )}

      {query.error ? (
        <FinanceErrorState
          message={financeLoadErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : null}
    </div>
  )
}
