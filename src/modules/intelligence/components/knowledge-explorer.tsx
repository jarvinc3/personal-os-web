"use client"

import { KnowledgeDataActions } from "@/src/modules/intelligence/components/knowledge-data-actions"
import { KnowledgeItemRow } from "@/src/modules/intelligence/components/knowledge-item-row"
import { useKnowledge } from "@/src/modules/intelligence/hooks/use-knowledge"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { Badge } from "@/src/shared/components/ui/badge"
import { BrainCircuit, Globe, Mail } from "lucide-react"

export function KnowledgeExplorer() {
  const knowledgeQuery = useKnowledge()

  const personal = knowledgeQuery.data?.personal ?? []
  const global = knowledgeQuery.data?.global ?? []
  const empty = personal.length === 0 && global.length === 0

  return (
    <div className="flex flex-col gap-3">
      {!knowledgeQuery.isPending && !knowledgeQuery.isError && !empty ? (
        <p className="px-1 text-xs leading-relaxed text-muted-foreground">
          Lo que está en revisión no lo ves: lo revisa un administrador, que
          puede promoverlo al conocimiento global o revertirlo.
        </p>
      ) : null}

      {knowledgeQuery.isPending ? (
        <div
          className="flex flex-col gap-2 p-2"
          aria-label="Cargando conocimiento"
        >
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : knowledgeQuery.isError ? (
        <ErrorState
          message="No se pudo cargar tu conocimiento."
          onRetry={() => void knowledgeQuery.refetch()}
          isRetrying={knowledgeQuery.isFetching}
        />
      ) : empty ? (
        <Empty className="rounded-2xl border border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BrainCircuit aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Sin conocimiento todavía</EmptyTitle>
            <EmptyDescription>
              Aparecerá cuando verifiques correos en Revisión. Lo que quede en
              revisión lo resuelve un administrador.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {personal.length > 0 ? (
            <SummarySection
              title="Mi conocimiento"
              subtitle="Lo que la IA aprendió de tus correos verificados."
              icon={Mail}
              right={<Badge variant="secondary">{personal.length}</Badge>}
            >
              {personal.map((item, index) => (
                <KnowledgeItemRow
                  key={item.id}
                  item={item}
                  isLast={index === personal.length - 1}
                />
              ))}
            </SummarySection>
          ) : null}

          {global.length > 0 ? (
            <SummarySection
              title="Conocimiento global"
              subtitle="Solo lo estable y sin datos personales."
              icon={Globe}
              right={<Badge variant="secondary">{global.length}</Badge>}
            >
              {global.map((item, index) => (
                <KnowledgeItemRow
                  key={item.id}
                  item={item}
                  isLast={index === global.length - 1}
                />
              ))}
            </SummarySection>
          ) : null}
        </>
      )}

      <KnowledgeDataActions
        canExport={personal.length > 0}
        personalKnowledgeCount={personal.length}
      />
    </div>
  )
}
