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
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { cn } from "@/src/shared/lib/utils"
import { CheckIcon, SparklesIcon, XIcon } from "lucide-react"

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
    <div className="my-2 w-full max-w-sm">
      <SummarySection
        title={action.label ?? action.actionType}
        icon={SparklesIcon}
        right={<ActionStatusBadge status={action.status} />}
      >
        {isPending ? (
          <div className="flex flex-row gap-2 px-1">
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
          </div>
        ) : confirmationMessage ? (
          <p className="px-1 text-xs text-muted-foreground">
            {confirmationMessage}
          </p>
        ) : null}
      </SummarySection>
    </div>
  )
}
