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
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
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
          <SummaryItem
            title="Señal de correo"
            wrapTitle
            description={`ID ${trace.signalId}`}
            wrapDescription
            icon={GitBranchIcon}
            isLast={!trace.sourceEmailMessageId}
          />
          {trace.sourceEmailMessageId ? (
            <SummaryItem
              title="Correo de origen"
              description={trace.sourceEmailMessageId}
              value="Ver correo"
              icon={MailIcon}
              href={sourceEmailDetailHref(
                trace.sourceEmailMessageId,
                transaction.id
              )}
              isLast
            />
          ) : (
            <SummaryItem
              title="Correo de origen"
              value="No disponible"
              icon={MailIcon}
              isLast
            />
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
