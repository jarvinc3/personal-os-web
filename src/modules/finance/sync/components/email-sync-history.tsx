"use client"

import { emailOutcomeLabel } from "@/src/modules/finance/shared/lib/email-sync-display"
import { SyncCard } from "@/src/modules/finance/sync/components/sync-card"
import type { SyncCardStatus } from "@/src/modules/finance/sync/components/sync-card"
import type {
  FinanceEmailProcessedMessage,
  FinanceEmailSyncLog,
} from "@/src/modules/finance/shared/types/entities"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
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

function logStatus(status: string): SyncCardStatus {
  if (status === "FAILED") {
    return "error"
  }
  if (status === "RUNNING") {
    return "pending"
  }
  return "ok"
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
      {logs.map((log) => {
        const when = formatRelativeTimeFromIso(log.startedAt)
        const detail = log.error
          ? log.error
          : `${log.emailsScanned} correos · ${log.transactionsNew} nuevos`
        return (
          <SyncCard
            key={log.id}
            icon={HistoryIcon}
            title={log.sourceName}
            subtitle={detail}
            status={logStatus(log.status)}
            value={when ?? undefined}
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
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  messages: FinanceEmailProcessedMessage[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
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
      <InfiniteListSentinel
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={onLoadMore}
      />
    </SummarySection>
  )
}
