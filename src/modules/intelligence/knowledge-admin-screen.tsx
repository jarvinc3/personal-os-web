"use client"

import { ApiError } from "@/src/config/api-client"
import { KnowledgeItemRow } from "@/src/modules/intelligence/components/knowledge-item-row"
import {
  useKnowledgeAdminQueue,
  usePromoteKnowledge,
  useRevertKnowledge,
} from "@/src/modules/intelligence/hooks/use-knowledge"
import { useIntelligenceRole } from "@/src/modules/intelligence/hooks/use-intelligence"
import {
  canPromoteKnowledge,
  canRevertKnowledge,
  groupKnowledgeByState,
  knowledgeTitle,
} from "@/src/modules/intelligence/knowledge"
import type { KnowledgeItem } from "@/src/modules/intelligence/types/knowledge.types"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { Button } from "@/src/shared/components/ui/button"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Spinner } from "@/src/shared/components/ui/spinner"
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
  XIcon,
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
  const roleQuery = useIntelligenceRole()
  const isAdmin = roleQuery.data === "ADMIN"
  const queueQuery = useKnowledgeAdminQueue(isAdmin)
  const [reverting, setReverting] = useState<KnowledgeItem | null>(null)
  const [promoting, setPromoting] = useState<KnowledgeItem | null>(null)
  const promoteMutation = usePromoteKnowledge()
  const revertMutation = useRevertKnowledge()

  const queueItems = queueQuery.data ?? []
  const groups = groupKnowledgeByState(queueItems)
  const forbidden =
    (roleQuery.isSuccess && !isAdmin) ||
    (queueQuery.isError &&
      queueQuery.error instanceof ApiError &&
      queueQuery.error.status === 403)

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 pb-10 md:px-6">
      {roleQuery.isPending || (isAdmin && queueQuery.isPending) ? (
        <QueueSection>
          <div
            className="flex flex-col gap-2 p-2"
            aria-label="Cargando conocimiento"
          >
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
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
      ) : roleQuery.isError || queueQuery.isError ? (
        <QueueSection>
          <ErrorState
            message="No se pudo cargar la cola de conocimiento."
            onRetry={() => {
              void roleQuery.refetch()
              if (isAdmin) {
                void queueQuery.refetch()
              }
            }}
            isRetrying={roleQuery.isFetching || queueQuery.isFetching}
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

      <AlertDialog
        open={promoting !== null}
        onOpenChange={(open) => {
          if (!open && !promoteMutation.isPending) {
            setPromoting(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-muted text-muted-foreground">
              <ShieldCheck aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              ¿Promover{" "}
              {promoting ? knowledgeTitle(promoting) : "este conocimiento"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Quedará activo para todos y se conservará en los rebuilds. Puedes
              revertirlo después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={promoteMutation.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={promoteMutation.isPending}
              onClick={() => {
                if (!promoting) {
                  return
                }
                promoteMutation.mutate(promoting.id, {
                  onSuccess: () => setPromoting(null),
                })
              }}
            >
              {promoteMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
              )}
              {promoteMutation.isPending ? "Promoviendo..." : "Promover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={reverting !== null}
        onOpenChange={(open) => {
          if (!open && !revertMutation.isPending) {
            setReverting(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Undo2 aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              ¿Revertir{" "}
              {reverting ? knowledgeTitle(reverting) : "esta promoción"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Dejará de aplicarse a todos y quedará bloqueado. La evidencia se
              conserva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revertMutation.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={revertMutation.isPending}
              onClick={() => {
                if (!reverting) {
                  return
                }
                revertMutation.mutate(reverting.id, {
                  onSuccess: () => setReverting(null),
                })
              }}
            >
              {revertMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Undo2 className="size-4 shrink-0" aria-hidden="true" />
              )}
              {revertMutation.isPending ? "Revirtiendo..." : "Revertir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
