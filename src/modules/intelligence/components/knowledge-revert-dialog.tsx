"use client"

import { useRevertKnowledge } from "@/src/modules/intelligence/hooks/use-knowledge"
import { knowledgeTitle } from "@/src/modules/intelligence/knowledge"
import type { KnowledgeItem } from "@/src/modules/intelligence/types/knowledge.types"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { Undo2 } from "lucide-react"

type KnowledgeRevertDialogProps = {
  item: KnowledgeItem | null
  onClose: () => void
}

export function KnowledgeRevertDialog({
  item,
  onClose,
}: KnowledgeRevertDialogProps) {
  const revertMutation = useRevertKnowledge()

  return (
    <ConfirmDialog
      open={item !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      tone="danger"
      icon={Undo2}
      title={`¿Revertir ${item ? knowledgeTitle(item) : "esta promoción"}?`}
      description="Dejará de aplicarse a todos y quedará bloqueado. La evidencia se conserva."
      confirmLabel="Revertir"
      confirmIcon={Undo2}
      pending={revertMutation.isPending}
      pendingLabel="Revirtiendo..."
      onConfirm={() => {
        if (!item) {
          return
        }
        revertMutation.mutate(item.id, { onSuccess: onClose })
      }}
    />
  )
}
