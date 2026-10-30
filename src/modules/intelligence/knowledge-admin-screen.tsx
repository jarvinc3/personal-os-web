"use client"

import { ApiError } from "@/src/config/api-client"
import { KnowledgeItemRow } from "@/src/modules/intelligence/components/knowledge-item-row"
import { KnowledgeListSkeleton } from "@/src/modules/intelligence/components/knowledge-list-skeleton"
import { KnowledgePromoteDialog } from "@/src/modules/intelligence/components/knowledge-promote-dialog"
import { KnowledgeRevertDialog } from "@/src/modules/intelligence/components/knowledge-revert-dialog"
import { useKnowledgeAdminQueue } from "@/src/modules/intelligence/hooks/use-knowledge"
import {
  canPromoteKnowledge,
  canRevertKnowledge,
  groupKnowledgeByState,
} from "@/src/modules/intelligence/knowledge"
import type { KnowledgeItem } from "@/src/modules/intelligence/types/knowledge.types"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import {
  Ban,
  CheckCircle2,
  Clock3,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Undo2,
} from "lucide-react"
import { useState, type ReactNode } from "react"

const STATE_ICONS = {
  REVIEW_REQUIRED: Clock3,
  STABLE: CheckCircle2,
  BLOCKED: Ban,
  OBSERVED: Eye,
} as const

function QueueSection({ children }: { children: ReactNode }) {
  return (
    <SummarySection title="Conocimiento global" icon={ShieldCheck}>
      {children}
    </SummarySection>
  )
}

export function KnowledgeAdminScreen() {
  usePageHeader({ title: "Cola de conocimiento" })
  const queueQuery = useKnowledgeAdminQueue()
  const [reverting, setReverting] = useState<KnowledgeItem | null>(null)
  const [promoting, setPromoting] = useState<KnowledgeItem | null>(null)

  const queueItems = queueQuery.data ?? []
  const groups = groupKnowledgeByState(queueItems)
  const forbidden =
    queueQuery.isError &&
    queueQuery.error instanceof ApiError &&
    queueQuery.error.status === 403

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 pb-10 md:px-6">
      {queueQuery.isPending ? (
        <QueueSection>
          <KnowledgeListSkeleton />
        </QueueSection>
      ) : forbidden ? (
        <QueueSection>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldAlert aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Solo administradores</EmptyTitle>
              <EmptyDescription>
                Necesitas el rol ADMIN para ver, promover y revertir el
                conocimiento global. El conocimiento personal de otros usuarios
                nunca se muestra aquí.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </QueueSection>
      ) : queueQuery.isError ? (
        <QueueSection>
          <ErrorState
            message="No se pudo cargar la cola de conocimiento."
            onRetry={() => void queueQuery.refetch()}
            isRetrying={queueQuery.isFetching}
          />
        </QueueSection>
      ) : groups.length === 0 ? (
        <QueueSection>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldCheck aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Sin conocimiento global</EmptyTitle>
              <EmptyDescription>
                Todavía no hay conocimiento promovido ni pendiente de revisión.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </QueueSection>
      ) : (
        groups.map((group) => {
          const GroupIcon = STATE_ICONS[group.state]
          return (
            <SummarySection
              key={group.state}
              title={group.title}
              subtitle={group.description}
              icon={GroupIcon}
            >
              {group.items.map((item, index) => (
                <KnowledgeItemRow
                  key={item.id}
                  item={item}
                  isLast={index === group.items.length - 1}
                  showState={false}
                  trailing={
                    canPromoteKnowledge(item) || canRevertKnowledge(item) ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        {canPromoteKnowledge(item) ? (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setPromoting(item)}
                          >
                            <ShieldCheck data-icon="inline-start" />
                            Promover
                          </Button>
                        ) : null}
                        {canRevertKnowledge(item) ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setReverting(item)}
                          >
                            <Undo2 data-icon="inline-start" />
                            Revertir
                          </Button>
                        ) : null}
                      </div>
                    ) : undefined
                  }
                />
              ))}
            </SummarySection>
          )
        })
      )}

      <KnowledgePromoteDialog
        item={promoting}
        onClose={() => setPromoting(null)}
      />
      <KnowledgeRevertDialog
        item={reverting}
        onClose={() => setReverting(null)}
      />
    </main>
  )
}
