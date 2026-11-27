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
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { InfiniteListErrorFooter } from "@/src/shared/components/feedback/infinite-list-error-footer"
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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { cn } from "@/src/shared/lib/utils"
import { Card } from "@/src/shared/components/ui/card"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { resolveInfiniteListErrorState } from "@/src/shared/lib/infinite-list-error"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { appToast } from "@/src/shared/lib/app-toast"
import { useTabsBehavior } from "@/src/shared/hooks/use-tabs-behavior"
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
  const tabsBehavior = useTabsBehavior({ defaultValue: "archived" })

  const archived = recycleBinQuery.data?.pages[0]?.archived ?? []
  const deleted = infiniteListItems(recycleBinQuery.data)
  const recycleBinErrorState = resolveInfiniteListErrorState({
    hasError: recycleBinQuery.isError,
    itemCount: archived.length + deleted.length,
  })

  if (recycleBinErrorState === "full") {
    return (
      <ErrorState
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
    const RecordIcon = archivedIcon(record.type)
    return (
      <Item
        key={`${record.type}-${record.id}`}
        variant="plain"
        className={cn("px-3", !isLast && "border-b border-border/60")}
      >
        {branded ? (
          <ItemMedia className="h-10 w-max min-w-10 rounded-full px-1">
            <BrandLogo name={record.label} logoUrl={record.logoUrl} size={36} />
          </ItemMedia>
        ) : null}
        {!branded && RecordIcon ? (
          <ItemMedia variant="icon">
            <RecordIcon />
          </ItemMedia>
        ) : null}
        <ItemContent>
          <ItemTitle>{record.label}</ItemTitle>
          <ItemDescription className="truncate text-xs">
            {ARCHIVED_TYPE_LABEL[record.type]}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
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
        </ItemActions>
      </Item>
    )
  }

  function renderDeleted(record: FinanceDeletedRecord, isLast: boolean) {
    const typeLabel = DELETED_TYPE_LABEL[record.type]
    const slowRestore = record.sizeBytes > LARGE_SNAPSHOT_BYTES
    const branded = isBrandedRecordType(record.type)
    const RecordIcon = deletedIcon(record.type)
    return (
      <Item
        key={`${record.type}-${record.id}`}
        variant="plain"
        className={cn("px-3", !isLast && "border-b border-border/60")}
      >
        {branded ? (
          <ItemMedia className="h-10 w-max min-w-10 rounded-full px-1">
            <BrandLogo
              name={record.label ?? typeLabel}
              logoUrl={record.logoUrl}
              size={36}
            />
          </ItemMedia>
        ) : null}
        {!branded && RecordIcon ? (
          <ItemMedia variant="icon">
            <RecordIcon />
          </ItemMedia>
        ) : null}
        <ItemContent>
          <ItemTitle>{record.label ?? typeLabel}</ItemTitle>
          <ItemDescription className="truncate text-xs">
            {`${typeLabel} · ${formatCalendarDate(record.deletedAt, formatLocale)}${
              slowRestore ? " · Muchos datos, restaurar puede tardar" : ""
            }`}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
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
        </ItemActions>
      </Item>
    )
  }

  return (
    <AsyncRegion
      pending={recycleBinQuery.isPending}
      pendingFallback={
        <div className="flex flex-col gap-2">
          <Skeleton
            className="h-16 border border-border bg-muted/40"
            aria-hidden
          />
          <Skeleton
            className="h-16 border border-border bg-muted/40"
            aria-hidden
          />
          <Skeleton
            className="h-16 border border-border bg-muted/40"
            aria-hidden
          />
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
      <Tabs {...tabsBehavior} className="flex flex-col gap-4">
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
            <section className="flex flex-col gap-2">
              <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Archivados
              </h2>
              <Card className="gap-0 bg-card p-1">
                {archived.map((record, index) =>
                  renderArchived(record, index === archived.length - 1)
                )}
              </Card>
            </section>
          )}
        </TabsContent>

        <TabsContent value="deleted" className="flex flex-col">
          {deleted.length === 0 ? (
            <RecycleBinEmpty
              title="Sin eliminados"
              description="Los registros que borres aparecen aquí mientras se puedan recuperar."
            />
          ) : (
            <section className="flex flex-col gap-2">
              <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Eliminados
              </h2>
              <Card className="gap-0 bg-card p-1">
                {deleted.map((record, index) =>
                  renderDeleted(record, index === deleted.length - 1)
                )}
              </Card>
            </section>
          )}
          {recycleBinErrorState === "inline" ? (
            <InfiniteListErrorFooter
              title="No se pudieron cargar más registros"
              isRetrying={recycleBinQuery.isFetchingNextPage}
              onRetry={() => void recycleBinQuery.fetchNextPage()}
            />
          ) : (
            <InfiniteListSentinel
              hasNextPage={recycleBinQuery.hasNextPage}
              isFetchingNextPage={recycleBinQuery.isFetchingNextPage}
              onLoadMore={() => void recycleBinQuery.fetchNextPage()}
            />
          )}
        </TabsContent>
      </Tabs>
    </AsyncRegion>
  )
}
