"use client"

import {
  HistoryIcon,
  MessageSquareTextIcon,
  PlusIcon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react"

import { useAgentConversations } from "@/src/modules/intelligence/hooks/use-agent-chat"
import type { AgentConversationSummary } from "@/src/modules/intelligence/types/agent-chat.types"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Alert, AlertDescription } from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { formatDateTime } from "@/src/shared/lib/date-format"
import { cn } from "@/src/shared/lib/utils"

export function AgentChatHistorySheet({
  open,
  onOpenChange,
  activeConversationId,
  onSelect,
  onNewChat,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeConversationId: string | null
  onSelect: (conversation: AgentConversationSummary) => void
  onNewChat: () => void
}) {
  const conversations = useAgentConversations(open)
  const locale = useFormatLocale()
  const items = conversations.data ?? []

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Conversaciones"
      description="Retoma una conversación o empieza otra."
      showAgentTrigger={false}
      layerClassName="z-[100]"
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon />
            Cerrar
          </Button>
        ),
        submit: (
          <Button type="button" className="flex-1" onClick={onNewChat}>
            <PlusIcon />
            Nuevo chat
          </Button>
        ),
      }}
    >
      {conversations.isPending ? (
        <div className="flex flex-col gap-2" aria-hidden>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      ) : conversations.isError ? (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col gap-3">
            <span>No se pudieron cargar las conversaciones.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              disabled={conversations.isFetching}
              onClick={() => void conversations.refetch()}
            >
              <RotateCcwIcon />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      ) : items.length === 0 ? (
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HistoryIcon />
            </EmptyMedia>
            <EmptyTitle>Sin conversaciones guardadas</EmptyTitle>
            <EmptyDescription>
              Tus conversaciones con el agente aparecen aquí.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-1 pb-2">
          {items.map((conversation) => (
            <SummaryItem
              key={conversation.id}
              title={conversation.title}
              description={formatDateTime(conversation.updatedAt, locale)}
              value={
                conversation.messageCount === 1
                  ? "1 mensaje"
                  : `${conversation.messageCount} mensajes`
              }
              icon={MessageSquareTextIcon}
              onPress={() => onSelect(conversation)}
              className={cn(
                conversation.id === activeConversationId &&
                  "border-primary/40 ring-2 ring-primary/20"
              )}
            />
          ))}
        </div>
      )}
    </BottomSheet>
  )
}
