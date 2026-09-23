"use client"

import type {
  FinanceEmailSource,
  FinanceMailbox,
} from "@/src/modules/finance/types/entities"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { formatRelativeTimeFromIso } from "@/src/shared/lib/date-format"
import {
  Building2Icon,
  ChevronDownIcon,
  MailIcon,
  PlusIcon,
  RefreshCwIcon,
} from "lucide-react"

type MailboxGroupProps = {
  mailbox: FinanceMailbox
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

export function MailboxGroup({
  mailbox,
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
      <div className="flex flex-col">
        <SummaryItem
          title={mailbox.emailAddress}
          description="Sin instituciones"
          icon={MailIcon}
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
      <div className="flex items-stretch border-b border-border/60 last:border-b-0">
        <div className="min-w-0 flex-1">
          <SummaryItem
            title={mailbox.emailAddress}
            description={
              sources.length === 1
                ? "1 institución"
                : `${sources.length} instituciones`
            }
            icon={MailIcon}
            isLast
            onPress={() => onOpenMailbox(mailbox.id)}
            showChevron={false}
          />
        </div>
        <CollapsibleTrigger
          type="button"
          className="flex shrink-0 items-center px-3 text-muted-foreground hover:bg-muted/50"
          aria-label={`Instituciones de ${mailbox.emailAddress}`}
        >
          <ChevronDownIcon className="size-4.5 transition-transform group-data-open/mailbox:rotate-180" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="flex flex-col pl-7">
          {sources.map((source) => {
            const title = source.label || source.institutionName || "Institución"
            const syncing = syncingSourceId === source.id
            return (
              <div
                key={source.id}
                className="flex items-stretch border-b border-border/60"
              >
                <div className="min-w-0 flex-1">
                  <SummaryItem
                    title={title}
                    description={sourceDescription(source)}
                    icon={Building2Icon}
                    onPress={() => onOpenSource(source.id)}
                    isLast
                    showChevron={false}
                  />
                </div>
                <button
                  type="button"
                  aria-label={`Sincronizar ${title}`}
                  disabled={!emailSyncEnabled || !source.isActive || syncing}
                  className="flex shrink-0 items-center px-3 text-primary hover:bg-muted/50 disabled:opacity-50"
                  onClick={() => onSyncSource(source.id)}
                >
                  <RefreshCwIcon
                    className={`size-4.5 ${syncing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
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
