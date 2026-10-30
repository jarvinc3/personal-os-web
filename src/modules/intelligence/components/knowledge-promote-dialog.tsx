"use client"

import { usePromoteKnowledge } from "@/src/modules/intelligence/hooks/use-knowledge"
import { knowledgeTitle } from "@/src/modules/intelligence/knowledge"
import type { KnowledgeItem } from "@/src/modules/intelligence/types/knowledge.types"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { ShieldCheck } from "lucide-react"

type KnowledgePromoteDialogProps = {
  item: KnowledgeItem | null
  onClose: () => void
}

export function KnowledgePromoteDialog({
  item,
  onClose,
}: KnowledgePromoteDialogProps) {
  const promoteMutation = usePromoteKnowledge()

  return (
    <ConfirmDialog
      open={item !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      icon={ShieldCheck}
      title={`¿Promover ${item ? knowledgeTitle(item) : "este conocimiento"}?`}
      description="Quedará activo para todos y se conservará en los rebuilds. Puedes revertirlo después."
      confirmLabel="Promover"
      confirmIcon={ShieldCheck}
      pending={promoteMutation.isPending}
      pendingLabel="Promoviendo..."
      onConfirm={() => {
        if (!item) {
          return
        }
        promoteMutation.mutate(item.id, { onSuccess: onClose })
      }}
    />
  )
}
