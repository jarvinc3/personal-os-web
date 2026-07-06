'use client';

import {
  useAiSessions,
  useDeleteAiSession,
} from '@/src/modules/ai/hooks/use-ai-sessions';
import type { AiSessionSummary } from '@/src/modules/ai/types/chat.types';
import { BottomSheet } from '@/src/shared/components/layout/bottom-sheet';
import { Button } from '@/src/shared/components/ui/button';
import { Spinner } from '@/src/shared/components/ui/spinner';
import { cn } from '@/src/shared/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2Icon } from 'lucide-react';

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

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Conversaciones"
      actions={{
        submit: (
          <Button
            size="sm"
            onClick={() => {
              onNewChat();
              onOpenChange(false);
            }}
          >
            Nueva
          </Button>
        ),
      }}
    >
      {sessionsQuery.isLoading ? (
        <div className="flex items-center justify-center py-8">
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
                'flex flex-row items-center justify-between rounded-xl p-2',
                item.id === activeSessionId && 'border border-border bg-muted',
              )}
            >
              <button
                type="button"
                onClick={() => {
                  onSelectSession(item);
                  onOpenChange(false);
                }}
                className="flex min-w-0 flex-1 flex-col gap-1 pr-2 text-left"
              >
                <span className="truncate font-medium">
                  {item.title ?? item.preview ?? 'Conversación'}
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
                onClick={() => void deleteMutation.mutateAsync(item.id)}
              >
                <Trash2Icon className="text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
