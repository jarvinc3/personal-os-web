"use client"

import {
  useDeleteKnowledge,
  useExportKnowledge,
} from "@/src/modules/intelligence/hooks/use-knowledge"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Database, Download, Trash2 } from "lucide-react"
import { useState } from "react"

const DELETE_CONSEQUENCES = [
  "Los correos importados y sus cuerpos.",
  "Tus inferencias y sus resultados.",
  "Los runs y el dataset de análisis.",
  "La conexión de Gmail y sus tokens.",
  "El consentimiento para contribuir al conocimiento global.",
] as const

type KnowledgeDataActionsProps = {
  canExport: boolean
  personalKnowledgeCount: number
}

export function KnowledgeDataActions({
  canExport,
  personalKnowledgeCount,
}: KnowledgeDataActionsProps) {
  const exportMutation = useExportKnowledge()
  const deleteMutation = useDeleteKnowledge()
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <SummarySection title="Tus datos" icon={Database}>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => exportMutation.mutate()}
          disabled={!canExport || exportMutation.isPending}
        >
          {exportMutation.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Download data-icon="inline-start" />
          )}
          {exportMutation.isPending ? "Exportando..." : "Exportar conocimiento"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          onClick={() => setDeleteOpen(true)}
          disabled={deleteMutation.isPending}
        >
          <Trash2 data-icon="inline-start" />
          Borrar mis datos de IA
        </Button>
        <p className="px-2 text-xs leading-relaxed text-muted-foreground">
          El archivo incluye tu conocimiento personal. El borrado es inmediato,
          no tiene papelera y elimina también tus correos, tus análisis, el
          consentimiento y la conexión de Gmail.
        </p>
      </SummarySection>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        tone="danger"
        icon={Trash2}
        wide
        title="¿Borrar todos tus datos de IA?"
        description={`Es inmediato y no se puede deshacer. Se borrarán tus ${personalKnowledgeCount} ${personalKnowledgeCount === 1 ? "elemento" : "elementos"} de conocimiento personal —los que ves y los que están en revisión— y también:`}
        confirmLabel="Borrar datos de IA"
        confirmIcon={Trash2}
        pending={deleteMutation.isPending}
        pendingLabel="Borrando..."
        onConfirm={() =>
          deleteMutation.mutate(undefined, {
            onSuccess: () => setDeleteOpen(false),
          })
        }
      >
        <ul className="flex max-h-60 list-disc flex-col gap-2 overflow-y-auto pl-5 text-sm text-muted-foreground">
          {DELETE_CONSEQUENCES.map((consequence) => (
            <li key={consequence}>{consequence}</li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Tus verificaciones y observaciones quedan anonimizadas, no se borran.
        </p>
      </ConfirmDialog>
    </>
  )
}
