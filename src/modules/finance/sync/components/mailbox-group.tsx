"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { SyncCard } from "@/src/modules/finance/sync/components/sync-card"
import type { SyncCardStatus } from "@/src/modules/finance/sync/components/sync-card"
import type {
  FinanceEmailSource,
  FinanceEmailSyncLog,
  FinanceInstitution,
  FinanceMailbox,
} from "@/src/modules/finance/shared/types/entities"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { formatRelativeTimeFromIso } from "@/src/shared/lib/date-format"
import { cn } from "@/src/shared/lib/utils"
import {
  ChevronDownIcon,
  MailIcon,
  PlusIcon,
  RefreshCwIcon,
} from "lucide-react"

type MailboxGroupProps = {
  mailbox: FinanceMailbox
  institutions: FinanceInstitution[]
  emailSyncEnabled: boolean
  syncingSourceId: string | null
  onOpenMailbox: (id: string) => void
  onOpenSource: (id: string) => void
  onAddInstitution: (mailboxId: string) => void
  onSyncSource: (sourceId: string) => void
}

function sourceDescription(source: FinanceEmailSource): string {
  const sender = source.bankSenderEmail ?? source.bankDomain
  if (!source.lastSyncedAt) {
    return `${sender} · Primer sync pendiente`
  }
  const relative = formatRelativeTimeFromIso(source.lastSyncedAt)
  return relative ? `${sender} · Sincronizado ${relative}` : sender
}

function latestLog(source: FinanceEmailSource): FinanceEmailSyncLog | null {
  return (source.logs ?? []).reduce<FinanceEmailSyncLog | null>(
    (current, log) =>
      !current || log.startedAt > current.startedAt ? log : current,
    null
  )
}

function sourceStatus(source: FinanceEmailSource): SyncCardStatus {
  const log = latestLog(source)
  if (!log) {
    return "pending"
  }
  if (log.status === "FAILED") {
    return "error"
  }
  if (log.status === "RUNNING") {
    return "pending"
  }
  return "ok"
}

function mailboxStatus(sources: readonly FinanceEmailSource[]): SyncCardStatus {
  const statuses = sources.map(sourceStatus)
  if (statuses.includes("error")) {
    return "error"
  }
  if (statuses.includes("pending")) {
    return "pending"
  }
  return "ok"
}

export function MailboxGroup({
  mailbox,
  institutions,
  emailSyncEnabled,
  syncingSourceId,
  onOpenMailbox,
  onOpenSource,
  onAddInstitution,
  onSyncSource,
}: MailboxGroupProps) {
  const sources = mailbox.sources.filter((source) => source.isActive)

  if (sources.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <SyncCard
          icon={MailIcon}
          title={mailbox.emailAddress}
          subtitle="Sin instituciones"
          status="pending"
          onPress={() => onOpenMailbox(mailbox.id)}
        />
        <SummaryItem
          title="Añadir institución"
          icon={PlusIcon}
          onPress={() => onAddInstitution(mailbox.id)}
          showChevron={false}
          isLast
        />
      </div>
    )
  }

  return (
    <Collapsible defaultOpen className="group/mailbox">
      <SyncCard
        icon={MailIcon}
        title={mailbox.emailAddress}
        subtitle={
          sources.length === 1
            ? "1 institución"
            : `${sources.length} instituciones`
        }
        status={mailboxStatus(sources)}
        onPress={() => onOpenMailbox(mailbox.id)}
        action={
          <CollapsibleTrigger
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/50"
            aria-label={`Instituciones de ${mailbox.emailAddress}`}
          >
            <ChevronDownIcon className="size-4.5 transition-transform group-data-open/mailbox:rotate-180" />
          </CollapsibleTrigger>
        }
      />
      <CollapsibleContent>
        <div className="mt-2 flex flex-col gap-2 pl-4">
          {sources.map((source) => {
            const title =
              source.label || source.institutionName || "Institución"
            const institution = institutions.find(
              (item) => item.id === source.institutionId
            )
            const syncing = syncingSourceId === source.id
            return (
              <SyncCard
                key={source.id}
                leading={
                  <BrandLogo
                    name={institution?.name ?? title}
                    logoUrl={institution?.logoUrl}
                    size={32}
                  />
                }
                title={title}
                subtitle={sourceDescription(source)}
                status={sourceStatus(source)}
                onPress={() => onOpenSource(source.id)}
                action={
                  <button
                    type="button"
                    aria-label={`Sincronizar ${title}`}
                    disabled={!emailSyncEnabled || syncing}
                    className="flex size-9 items-center justify-center rounded-full text-primary hover:bg-muted/50 disabled:opacity-50"
                    onClick={() => onSyncSource(source.id)}
                  >
                    <RefreshCwIcon
                      className={cn("size-4.5", syncing && "animate-spin")}
                    />
                  </button>
                }
              />
            )
          })}
          <SummaryItem
            title="Añadir institución"
            icon={PlusIcon}
            onPress={() => onAddInstitution(mailbox.id)}
            showChevron={false}
            isLast
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
