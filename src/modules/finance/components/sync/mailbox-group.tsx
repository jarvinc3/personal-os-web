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
import { Building2Icon, ChevronDownIcon, MailIcon, PlusIcon } from "lucide-react"

type MailboxGroupProps = {
  mailbox: FinanceMailbox
  onOpenMailbox: (id: string) => void
  onOpenSource: (id: string) => void
  onAddInstitution: (mailboxId: string) => void
}

function sourceDescription(source: FinanceEmailSource): string {
  return source.bankSenderEmail ?? source.bankDomain
}

export function MailboxGroup({
  mailbox,
  onOpenMailbox,
  onOpenSource,
  onAddInstitution,
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
            description={`${sources.length} institución${sources.length === 1 ? "" : "es"}`}
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
          {sources.map((source) => (
            <SummaryItem
              key={source.id}
              title={source.label || source.institutionName || "Institución"}
              description={sourceDescription(source)}
              icon={Building2Icon}
              onPress={() => onOpenSource(source.id)}
              isLast={false}
            />
          ))}
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
