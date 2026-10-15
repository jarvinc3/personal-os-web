"use client"

import {
  useAiSessions,
  useDeleteAiSession,
} from "@/src/modules/ai/hooks/use-ai-sessions"
import type { AiSessionSummary } from "@/src/modules/ai/types/chat.types"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Button } from "@/src/shared/components/ui/button"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { cn } from "@/src/shared/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react"
import { useState } from "react"

type ChatSessionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeSessionId: string | null
  onSelectSession: (session: AiSessionSummary) => void
  onNewChat: () => void
}

export function ChatSessionSheet({
  open,
  onOpenChange,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: ChatSessionSheetProps) {
  const sessionsQuery = useAiSessions()
  const deleteMutation = useDeleteAiSession()
  const items = sessionsQuery.data?.pages.flatMap((page) => page.items) ?? []

  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  )

  const handleDeleteSession = async (sessionId: string) => {
    const isActiveSession = sessionId === activeSessionId

    try {
      await deleteMutation.mutateAsync(sessionId)
      setDeletingSessionId(null)

      if (isActiveSession) {
        onNewChat()
        onOpenChange(false)
      }
    } catch {
      // Keep dialog open so the user can retry.
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Historial de conversaciones"
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            className="flex-1"
            onClick={() => {
              onNewChat()
              onOpenChange(false)
            }}
          >
            <PlusIcon className="size-4" />
            Nueva
          </Button>
        ),
      }}
    >
      {sessionsQuery.isLoading ? (
        <div className="flex flex-col gap-2 py-2" aria-hidden>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No hay conversaciones guardadas.
        </p>
      ) : (
        <div className="flex flex-col gap-1 pb-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex cursor-pointer flex-row items-center justify-between rounded-xl p-2 transition-all hover:bg-muted/50 active:scale-[0.99]",
                item.id === activeSessionId && "border border-border bg-muted"
              )}
            >
              <button
                type="button"
                onClick={() => {
                  onSelectSession(item)
                  onOpenChange(false)
                }}
                className="flex min-w-0 flex-1 flex-col gap-1 pr-2 text-left"
              >
                <span className="truncate font-medium">
                  {item.title ?? item.preview ?? "Conversación"}
                </span>
                <span className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                  <span>{item.contextType}</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(item.lastActiveAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={deleteMutation.isPending}
                onClick={() => setDeletingSessionId(item.id ?? null)}
              >
                <Trash2Icon className="text-destructive" />
              </Button>
            </div>
          ))}
          <InfiniteListSentinel
            hasNextPage={sessionsQuery.hasNextPage}
            isFetchingNextPage={sessionsQuery.isFetchingNextPage}
            onLoadMore={() => void sessionsQuery.fetchNextPage()}
          />
        </div>
      )}

      <AlertDialog
        open={!!deletingSessionId}
        onOpenChange={() => setDeletingSessionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de querer eliminar esta conversación?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esta conversación será eliminada
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingSessionId) {
                  void handleDeleteSession(deletingSessionId)
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BottomSheet>
  )
}
