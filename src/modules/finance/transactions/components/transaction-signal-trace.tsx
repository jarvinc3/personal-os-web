import { GitBranchIcon, MailIcon } from "lucide-react"
import {
  EMPTY_COMPACT_CLASS_NAME,
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
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import Link from "next/link"
import { cn } from "@/src/shared/lib/utils"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import {
  sourceEmailDetailHref,
  transactionSignalTrace,
} from "@/src/modules/finance/transactions/lib/transaction-signal-trace"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"

export function TransactionSignalTrace({
  transaction,
}: {
  transaction: FinanceTransaction
}) {
  const trace = transactionSignalTrace(transaction.aiMetadata)

  return (
    <SummarySection title="Trazabilidad" icon={GitBranchIcon}>
      {trace.signalId ? (
        <>
          <Item
            variant="plain"
            className={cn(
              !!trace.sourceEmailMessageId && "border-b border-border/60"
            )}
          >
            <ItemMedia variant="icon">
              <GitBranchIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="line-clamp-2 break-words">
                {"Señal de correo"}
              </ItemTitle>
              <ItemDescription className="line-clamp-none text-xs break-words whitespace-normal">
                {`ID ${trace.signalId}`}
              </ItemDescription>
            </ItemContent>
          </Item>
          {trace.sourceEmailMessageId ? (
            <Item
              variant="default"
              render={
                <Link
                  href={sourceEmailDetailHref(
                    trace.sourceEmailMessageId,
                    transaction.id
                  )}
                />
              }
            >
              <ItemMedia variant="icon">
                <MailIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{"Correo de origen"}</ItemTitle>
                <ItemDescription className="truncate text-xs">
                  {trace.sourceEmailMessageId}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <span className="text-sm font-semibold tabular-nums">
                  {"Ver correo"}
                </span>
                <LinkPendingOverlay />
              </ItemActions>
            </Item>
          ) : (
            <Item variant="plain">
              <ItemMedia variant="icon">
                <MailIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{"Correo de origen"}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <span className="text-sm font-semibold tabular-nums">
                  {"No disponible"}
                </span>
              </ItemActions>
            </Item>
          )}
        </>
      ) : (
        <Empty className={`${EMPTY_COMPACT_CLASS_NAME} border-0`}>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MailIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Sin señal de correo</EmptyTitle>
            <EmptyDescription>
              Este movimiento no tiene una señal de correo asociada.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </SummarySection>
  )
}
