"use client"

import {
  ChevronRightIcon,
  HistoryIcon,
  MessageSquareTextIcon,
  PlusIcon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react"

import { useAgentConversations } from "@/src/modules/intelligence/hooks/use-agent-chat"
import type { AgentConversationSummary } from "@/src/modules/intelligence/types/agent-chat.types"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Alert, AlertDescription } from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
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
  const items = conversations.data?.pages.flatMap((page) => page.items) ?? []

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent layerClassName="z-[100]">
        <SheetHeader
          title="Conversaciones"
          description="Retoma una conversación o empieza otra."
        />
        <SheetBody>
          {conversations.isPending && items.length === 0 ? (
            <div className="flex flex-col gap-2" aria-hidden>
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          ) : conversations.isError && items.length === 0 ? (
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
                <Item
                  key={conversation.id}
                  variant="default"
                  className={cn(
                    conversation.id === activeConversationId &&
                      "border-primary/40 ring-2 ring-primary/20"
                  )}
                  render={
                    <button
                      type="button"
                      onClick={() => onSelect(conversation)}
                    />
                  }
                >
                  <ItemMedia variant="icon">
                    <MessageSquareTextIcon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{conversation.title}</ItemTitle>
                    <ItemDescription className="truncate text-xs">
                      {formatDateTime(conversation.updatedAt, locale)}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <span className="text-sm font-semibold tabular-nums">
                      {conversation.messageCount === 1
                        ? "1 mensaje"
                        : `${conversation.messageCount} mensajes`}
                    </span>
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                  </ItemActions>
                </Item>
              ))}
              <InfiniteListSentinel
                hasNextPage={
                  Boolean(conversations.hasNextPage) && !conversations.error
                }
                isFetchingNextPage={conversations.isFetchingNextPage}
                onLoadMore={() => void conversations.fetchNextPage()}
              />
              {conversations.error ? (
                <Alert variant="destructive">
                  <AlertDescription className="flex flex-col gap-3">
                    <span>No se pudieron cargar más conversaciones.</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      disabled={conversations.isFetchingNextPage}
                      onClick={() => void conversations.fetchNextPage()}
                    >
                      <RotateCcwIcon />
                      Reintentar
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
          )}
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon />
            Cerrar
          </Button>
          <Button type="button" className="flex-1" onClick={onNewChat}>
            <PlusIcon />
            Nuevo chat
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
