'use client';

import {
  useCancelAiAction,
  useExecuteAiAction,
} from '@/src/modules/ai/hooks/use-ai-actions';
import type { AiActionSummary } from '@/src/modules/ai/types/chat.types';
import { Button } from '@/src/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/shared/components/ui/card';
import { Spinner } from '@/src/shared/components/ui/spinner';
import { appToast } from '@/src/shared/lib/app-toast';
import { cn } from '@/src/shared/lib/utils';

type ChatActionCardProps = {
  action: AiActionSummary;
};

function ActionStatusBadge({ status }: { status: string }) {
  const isDone = status === 'SUCCESS';
  const isPending = status === 'PENDING';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium',
        isDone && 'border-transparent bg-secondary text-secondary-foreground',
        isPending && 'border-border bg-background text-foreground',
        !isDone && !isPending && 'border-transparent bg-primary text-primary-foreground',
      )}
    >
      {status}
    </span>
  );
}

export function ChatActionCard({ action }: ChatActionCardProps) {
  const executeMutation = useExecuteAiAction();
  const cancelMutation = useCancelAiAction();
  const isPending = action.status === 'PENDING';

  const handleExecute = async () => {
    try {
      await executeMutation.mutateAsync(action.id);
      appToast.success({ text1: 'Acción aplicada' });
    } catch (error) {
      appToast.error({
        text1: 'No se pudo ejecutar',
        text2: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(action.id);
    } catch (error) {
      appToast.error({
        text1: 'No se pudo cancelar',
        text2: error instanceof Error ? error.message : undefined,
      });
    }
  };

  return (
    <Card className="my-2 border-border">
      <CardHeader className="pb-2">
        <div className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex-1 text-sm">
            {action.label ?? action.actionType}
          </CardTitle>
          <ActionStatusBadge status={action.status} />
        </div>
      </CardHeader>
      {isPending ? (
        <CardContent className="flex flex-row gap-2 pt-0">
          <Button
            size="sm"
            onClick={() => void handleExecute()}
            disabled={executeMutation.isPending}
          >
            {executeMutation.isPending ? <Spinner /> : null}
            Confirmar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void handleCancel()}
            disabled={cancelMutation.isPending}
          >
            Cancelar
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
