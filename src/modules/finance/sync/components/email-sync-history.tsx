"use client"

import {
  emailOutcomeLabel,
  syncLogStatusLabel,
} from "@/src/modules/finance/shared/lib/email-sync-display"
import type {
  FinanceEmailProcessedMessage,
  FinanceEmailSyncLog,
} from "@/src/modules/finance/shared/types/entities"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/src/shared/components/ui/empty"
import { formatRelativeTimeFromIso } from "@/src/shared/lib/date-format"
import { HistoryIcon, ScrollTextIcon } from "lucide-react"

export type NamedSyncLog = FinanceEmailSyncLog & {
  sourceName: string
}

export function EmailSyncLogList({
  logs,
  emptyLabel,
}: {
  logs: NamedSyncLog[]
  emptyLabel: string
}) {
  if (logs.length === 0) {
    return (
      <Empty className="py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HistoryIcon />
          </EmptyMedia>
          <EmptyDescription>{emptyLabel}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      {logs.map((log, index) => {
        const when = formatRelativeTimeFromIso(log.startedAt)
        const detail = log.error
          ? log.error
          : `${log.emailsScanned} correos · ${log.transactionsNew} nuevos`
        return (
          <SummaryItem
            key={log.id}
            title={`${log.sourceName} · ${syncLogStatusLabel(log.status)}`}
            description={`${detail}${when ? ` · ${when}` : ""}`}
            value={syncLogStatusLabel(log.status)}
            showChevron={false}
            isLast={index === logs.length - 1}
          />
        )
      })}
    </>
  )
}

export function EmailSyncLogsSection({
  logs,
  emptyLabel,
}: {
  logs: NamedSyncLog[]
  emptyLabel: string
}) {
  return (
    <SummarySection title="Últimos syncs" icon={HistoryIcon}>
      <EmailSyncLogList logs={logs} emptyLabel={emptyLabel} />
    </SummarySection>
  )
}

export function EmailMessageHistorySection({
  messages,
}: {
  messages: FinanceEmailProcessedMessage[]
}) {
  return (
    <SummarySection title="Historial de correos" icon={ScrollTextIcon}>
      {messages.length === 0 ? (
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ScrollTextIcon />
            </EmptyMedia>
            <EmptyDescription>
              Aún no hay correos procesados. Un sync exitoso los listará aquí.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        messages.map((message, index) => {
          const when = formatRelativeTimeFromIso(message.createdAt)
          const merchant =
            message.extractedPayload?.merchant ?? message.gmailMessageId
          return (
            <SummaryItem
              key={message.id}
              title={merchant}
              description={`${message.institutionName} · ${emailOutcomeLabel(message.outcome)}${message.reason ? ` · ${message.reason}` : ""}${when ? ` · ${when}` : ""}`}
              showChevron={false}
              isLast={index === messages.length - 1}
            />
          )
        })
      )}
    </SummarySection>
  )
}
