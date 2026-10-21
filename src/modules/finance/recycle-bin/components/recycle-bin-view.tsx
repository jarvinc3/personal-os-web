"use client"

import {
  useRecycleBin,
  useRecycleBinRestore,
  type RecycleBinRestoreInput,
} from "@/src/modules/finance/shared/hooks/use-recycle-bin"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import type {
  FinanceArchivedRecord,
  FinanceArchivedType,
  FinanceDeletedRecord,
  FinanceDeletedType,
} from "@/src/modules/finance/shared/types/api"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { SettingsSection } from "@/src/shared/components/layout/settings-section"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  ArchiveIcon,
  ArrowLeftRightIcon,
  CreditCardIcon,
  HandCoinsIcon,
  RotateCcwIcon,
  ScaleIcon,
  TagsIcon,
  TargetIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"

const ARCHIVED_TYPE_LABEL: Record<FinanceArchivedType, string> = {
  institution: "Institución",
  account: "Cuenta",
  card: "Tarjeta",
  loan: "Préstamo",
}

/** Institutions and accounts carry a brand; the rest use a generic icon. */
type BrandedRecordType = "institution" | "account"
type IconArchivedType = Exclude<FinanceArchivedType, BrandedRecordType>
type IconDeletedType = Exclude<FinanceDeletedType, BrandedRecordType>

const BRANDED_RECORD_TYPES: readonly BrandedRecordType[] = [
  "institution",
  "account",
]

const ARCHIVED_TYPE_ICON: Record<IconArchivedType, LucideIcon> = {
  card: CreditCardIcon,
  loan: HandCoinsIcon,
}

function isBrandedRecordType(
  type: FinanceArchivedType | FinanceDeletedType
): type is BrandedRecordType {
  return BRANDED_RECORD_TYPES.includes(type as BrandedRecordType)
}

function archivedIcon(type: FinanceArchivedType): LucideIcon | undefined {
  if (isBrandedRecordType(type)) {
    return undefined
  }
  return ARCHIVED_TYPE_ICON[type]
}

function deletedIcon(type: FinanceDeletedType): LucideIcon | undefined {
  if (isBrandedRecordType(type)) {
    return undefined
  }
  return DELETED_TYPE_ICON[type]
}

const DELETED_TYPE_LABEL: Record<FinanceDeletedType, string> = {
  institution: "Institución",
  account: "Cuenta",
  card: "Tarjeta",
  loan: "Préstamo",
  transaction: "Movimiento",
  category: "Categoría",
  budget: "Presupuesto",
  savingsGoal: "Meta de ahorro",
  receivable: "Cobro",
  reconciliation: "Conciliación",
}

const DELETED_TYPE_ICON: Record<IconDeletedType, LucideIcon> = {
  card: CreditCardIcon,
  loan: HandCoinsIcon,
  transaction: ArrowLeftRightIcon,
  category: TagsIcon,
  budget: WalletIcon,
  savingsGoal: TargetIcon,
  receivable: HandCoinsIcon,
  reconciliation: ScaleIcon,
}

/** A snapshot past this size can take a while to restore; warn before it does. */
const LARGE_SNAPSHOT_BYTES = 5 * 1024 * 1024

function RecycleBinEmpty({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Empty className="py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ArchiveIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export function RecycleBinView() {
  const formatLocale = useFormatLocale()
  const { isEnabled } = useFinanceEnabled()
  const recycleBinQuery = useRecycleBin(isEnabled)
  const restore = useRecycleBinRestore()

  const archived = recycleBinQuery.data?.pages[0]?.archived ?? []
  const deleted = infiniteListItems(recycleBinQuery.data)

  if (recycleBinQuery.isError) {
    return (
      <FinanceErrorState
        message={financeErrorMessage(recycleBinQuery.error)}
        onRetry={() => void recycleBinQuery.refetch()}
        isRetrying={recycleBinQuery.isFetching}
      />
    )
  }

  function onRestore(input: RecycleBinRestoreInput) {
    restore.mutate(input, {
      onSuccess: () => appToast.success({ text1: "Registro restaurado" }),
      onError: (error) => appToast.error({ text1: financeErrorMessage(error) }),
    })
  }

  function renderArchived(record: FinanceArchivedRecord, isLast: boolean) {
    const branded = isBrandedRecordType(record.type)
    return (
      <SummaryItem
        key={`${record.type}-${record.id}`}
        title={record.label}
        description={ARCHIVED_TYPE_LABEL[record.type]}
        icon={archivedIcon(record.type)}
        leading={
          branded ? (
            <BrandLogo name={record.label} logoUrl={record.logoUrl} size={36} />
          ) : undefined
        }
        isLast={isLast}
        className="px-3"
        trailing={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={restore.isPending}
            onClick={() => onRestore({ kind: "archived", record })}
          >
            <RotateCcwIcon className="size-4 shrink-0" />
            Restaurar
          </Button>
        }
      />
    )
  }

  function renderDeleted(record: FinanceDeletedRecord, isLast: boolean) {
    const typeLabel = DELETED_TYPE_LABEL[record.type]
    const slowRestore = record.sizeBytes > LARGE_SNAPSHOT_BYTES
    const branded = isBrandedRecordType(record.type)
    return (
      <SummaryItem
        key={`${record.type}-${record.id}`}
        title={record.label ?? typeLabel}
        description={`${typeLabel} · ${formatCalendarDate(record.deletedAt, formatLocale)}${
          slowRestore ? " · Muchos datos, restaurar puede tardar" : ""
        }`}
        icon={deletedIcon(record.type)}
        leading={
          branded ? (
            <BrandLogo
              name={record.label ?? typeLabel}
              logoUrl={record.logoUrl}
              size={36}
            />
          ) : undefined
        }
        isLast={isLast}
        className="px-3"
        trailing={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={restore.isPending}
            onClick={() => onRestore({ kind: "deleted", record })}
          >
            <RotateCcwIcon className="size-4 shrink-0" />
            Restaurar
          </Button>
        }
      />
    )
  }

  return (
    <AsyncRegion
      pending={recycleBinQuery.isPending}
      pendingFallback={
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-2xl border border-border bg-muted/40"
            />
          ))}
        </div>
      }
      empty={archived.length === 0 && deleted.length === 0}
      emptyFallback={
        <RecycleBinEmpty
          title="No hay nada archivado ni eliminado"
          description="Lo que archives o elimines aparecerá aquí para restaurarlo."
        />
      }
    >
      <Tabs defaultValue="archived" className="flex flex-col gap-4">
        <TabsList className="w-full rounded-2xl bg-muted">
          <TabsTrigger value="archived" className="rounded-2xl py-3">
            <ArchiveIcon className="size-4 shrink-0" />
            Archivados
            {archived.length > 0 ? (
              <span className="text-xs text-muted-foreground tabular-nums">
                {archived.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="deleted" className="rounded-2xl py-3">
            <RotateCcwIcon className="size-4 shrink-0" />
            Eliminados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="archived" className="flex flex-col">
          {archived.length === 0 ? (
            <RecycleBinEmpty
              title="Sin archivados"
              description="Las cuentas, tarjetas o préstamos que archives aparecen aquí."
            />
          ) : (
            <SettingsSection title="Archivados">
              {archived.map((record, index) =>
                renderArchived(record, index === archived.length - 1)
              )}
            </SettingsSection>
          )}
        </TabsContent>

        <TabsContent value="deleted" className="flex flex-col">
          {deleted.length === 0 ? (
            <RecycleBinEmpty
              title="Sin eliminados"
              description="Los registros que borres aparecen aquí mientras se puedan recuperar."
            />
          ) : (
            <SettingsSection title="Eliminados">
              {deleted.map((record, index) =>
                renderDeleted(record, index === deleted.length - 1)
              )}
            </SettingsSection>
          )}
          <InfiniteListSentinel
            hasNextPage={recycleBinQuery.hasNextPage}
            isFetchingNextPage={recycleBinQuery.isFetchingNextPage}
            onLoadMore={() => void recycleBinQuery.fetchNextPage()}
          />
        </TabsContent>
      </Tabs>
    </AsyncRegion>
  )
}
