"use client"

import { HelpRichText } from "@/src/modules/help/components/help-rich-text"
import type { HelpFaqGroup } from "@/src/modules/help/types/help.types"
import { Card } from "@/src/shared/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"
import { cn } from "@/src/shared/lib/utils"
import { ChevronDownIcon } from "lucide-react"

type HelpFaqListProps = {
  group: HelpFaqGroup
}

export function HelpFaqList({ group }: HelpFaqListProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {group.title}
      </h2>
      <Card className="gap-0 bg-card p-1">
        {group.questions.map((question, index) => (
          <Collapsible
            key={question.id}
            className={cn(
              "border-b border-border/60",
              index === group.questions.length - 1 && "border-b-0"
            )}
          >
            <CollapsibleTrigger className="group/faq flex min-h-[52px] w-full items-center gap-3 p-3 text-left">
              <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                {question.question}
              </span>
              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-data-open/faq:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <p className="px-3 pb-3 text-sm text-muted-foreground">
                <HelpRichText text={question.answer} />
              </p>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </Card>
    </section>
  )
}
