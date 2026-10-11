"use client"

import {
  useCancelAiAction,
  useExecuteAiAction,
} from "@/src/modules/ai/hooks/use-ai-actions"
import {
  getActionConfirmationMessage,
  getActionStatusLabel,
} from "@/src/modules/ai/lib/action-status-label"
import type { AiActionSummary } from "@/src/modules/ai/types/chat.types"
import { Button } from "@/src/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { appToast } from "@/src/shared/lib/app-toast"
import { cn } from "@/src/shared/lib/utils"
import { CheckIcon, XIcon } from "lucide-react"

type ChatActionCardProps = {
  action: AiActionSummary
  sessionId?: string | null
  onActionUpdated?: (action: AiActionSummary) => void
}

function ActionStatusBadge({ status }: { status: string }) {
  const isDone = status === "SUCCESS"
  const isPending = status === "PENDING"
  const isCancelled = status === "CANCELLED"
  const isFailed = status === "FAILED"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium",
        isDone && "border-transparent bg-secondary text-secondary-foreground",
        isPending && "border-border bg-background text-foreground",
        isCancelled && "border-border bg-muted text-muted-foreground",
        isFailed &&
          "text-destructive-foreground border-transparent bg-destructive",
        !isDone &&
          !isPending &&
          !isCancelled &&
          !isFailed &&
          "border-transparent bg-primary text-primary-foreground"
      )}
    >
      {getActionStatusLabel(status)}
    </span>
  )
}

export function ChatActionCard({
  action,
  sessionId,
  onActionUpdated,
}: ChatActionCardProps) {
  const executeMutation = useExecuteAiAction(sessionId)
  const cancelMutation = useCancelAiAction(sessionId)
  const isPending = action.status === "PENDING"
  const confirmationMessage = getActionConfirmationMessage(action.status)

  const handleExecute = async () => {
    try {
      const result = await executeMutation.mutateAsync({
        actionId: action.id,
        sessionId,
      })
      onActionUpdated?.(result.action)
      appToast.success({ text1: "Acción aplicada" })
    } catch (error) {
      appToast.error({
        text1: "No se pudo ejecutar",
        text2: error instanceof Error ? error.message : undefined,
      })
    }
  }

  const handleCancel = async () => {
    try {
      const updated = await cancelMutation.mutateAsync({
        actionId: action.id,
        sessionId,
      })
      onActionUpdated?.(updated)
    } catch (error) {
      appToast.error({
        text1: "No se pudo cancelar",
        text2: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Card className="my-2 w-full max-w-sm border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="flex-1 text-sm">
          {action.label ?? action.actionType}
        </CardTitle>
        <ActionStatusBadge status={action.status} />
      </CardHeader>
      {isPending ? (
        <CardContent className="flex flex-row gap-2 pt-0">
          <Button
            size="sm"
            className="flex-1"
            variant="outline"
            onClick={() => void handleCancel()}
            disabled={cancelMutation.isPending}
          >
            <XIcon />
            Cancelar
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => void handleExecute()}
            disabled={executeMutation.isPending}
          >
            {executeMutation.isPending ? <Spinner /> : <CheckIcon />}
            Confirmar
          </Button>
        </CardContent>
      ) : confirmationMessage ? (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">{confirmationMessage}</p>
        </CardContent>
      ) : null}
    </Card>
  )
}
