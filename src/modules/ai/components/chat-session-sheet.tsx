'use client';

import {
  useAiSessions,
  useDeleteAiSession,
} from '@/src/modules/ai/hooks/use-ai-sessions';
import type { AiSessionSummary } from '@/src/modules/ai/types/chat.types';
import { BottomSheet } from '@/src/shared/components/layout/bottom-sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/src/shared/components/ui/alert-dialog";
import { Button } from '@/src/shared/components/ui/button';
import { Spinner } from '@/src/shared/components/ui/spinner';
import { cn } from '@/src/shared/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';

type ChatSessionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSessionId: string | null;
  onSelectSession: (session: AiSessionSummary) => void;
  onNewChat: () => void;
};

export function ChatSessionSheet({
  open,
  onOpenChange,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: ChatSessionSheetProps) {
  const sessionsQuery = useAiSessions();
  const deleteMutation = useDeleteAiSession();
  const items = sessionsQuery.data?.items ?? [];

  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const handleDeleteSession = async (sessionId: string) => {
    const isActiveSession = sessionId === activeSessionId;

    try {
      await deleteMutation.mutateAsync(sessionId);
      setDeletingSessionId(null);

      if (isActiveSession) {
        onNewChat();
        onOpenChange(false);
      }
    } catch {
      // Keep dialog open so the user can retry.
    }
  };

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
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            className="flex-1"
            onClick={() => {
              onNewChat();
              onOpenChange(false);
            }}
          >
            <PlusIcon
              className="size-4"
            />
            Nueva
          </Button>
        ),
      }}
    >
      {sessionsQuery.isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner />
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
                'flex flex-row items-center justify-between rounded-xl p-2 hover:bg-muted/50 active:scale-[0.99] transition-all cursor-pointer',
                item.id === activeSessionId && 'border border-border bg-muted',
              )}
            >
              <button
                type="button"
                onClick={() => {
                  onSelectSession(item);
                  onOpenChange(false);
                }}
                className="flex flex-col flex-1 gap-1 pr-2 min-w-0 text-left"
              >
                <span className="font-medium truncate">
                  {item.title ?? item.preview ?? 'Conversación'}
                </span>
                <span className="flex flex-row gap-1 items-center text-xs text-muted-foreground">
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
        </div>
      )}

      <AlertDialog open={!!deletingSessionId} onOpenChange={() => setDeletingSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de querer eliminar esta conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esta conversación será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingSessionId) {
                  void handleDeleteSession(deletingSessionId);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BottomSheet>
  );
}
