"use client"

import {
  KNOWLEDGE_STATE_LABELS,
  knowledgeDescription,
  knowledgeTitle,
} from "@/src/modules/intelligence/knowledge"
import type {
  KnowledgeItem,
  KnowledgeState,
  KnowledgeType,
} from "@/src/modules/intelligence/types/knowledge.types"
import { cn } from "@/src/shared/lib/utils"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { Badge } from "@/src/shared/components/ui/badge"
import {
  BrainCircuit,
  Building2,
  FileText,
  Globe,
  Link2,
  Mail,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>

const TYPE_ICONS: Record<KnowledgeType, LucideIcon> = {
  EMAIL_SENDER: Mail,
  EMAIL_DOMAIN: Globe,
  EMAIL_TEMPLATE: FileText,
  ENTITY: Building2,
  RELATION: Link2,
  USER_MAPPING: UserRound,
}

const STATE_BADGES: Record<
  KnowledgeState,
  { label: string; variant: BadgeVariant }
> = {
  OBSERVED: { label: KNOWLEDGE_STATE_LABELS.OBSERVED, variant: "secondary" },
  STABLE: { label: KNOWLEDGE_STATE_LABELS.STABLE, variant: "success" },
  REVIEW_REQUIRED: {
    label: KNOWLEDGE_STATE_LABELS.REVIEW_REQUIRED,
    variant: "warning",
  },
  BLOCKED: { label: KNOWLEDGE_STATE_LABELS.BLOCKED, variant: "destructive" },
}

export function KnowledgeStateBadge({ state }: { state: KnowledgeState }) {
  const badge = STATE_BADGES[state]
  return <Badge variant={badge.variant}>{badge.label}</Badge>
}

type KnowledgeItemRowProps = {
  item: KnowledgeItem
  trailing?: ReactNode
  isLast?: boolean
  showState?: boolean
}

export function KnowledgeItemRow({
  item,
  trailing,
  isLast = false,
  showState = true,
}: KnowledgeItemRowProps) {
  const stateBadge = showState ? (
    <KnowledgeStateBadge state={item.state} />
  ) : null
  const KnowledgeIcon = TYPE_ICONS[item.knowledgeType] ?? BrainCircuit

  return (
    <Item
      variant="plain"
      className={cn(!isLast && "border-b border-border/60")}
    >
      <ItemMedia variant="icon">
        <KnowledgeIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="line-clamp-2 break-words">
          {knowledgeTitle(item)}
        </ItemTitle>
        <ItemDescription className="line-clamp-none text-xs break-words whitespace-normal">
          {knowledgeDescription(item)}
        </ItemDescription>
      </ItemContent>
      <ItemActions>{trailing ?? stateBadge}</ItemActions>
    </Item>
  )
}
