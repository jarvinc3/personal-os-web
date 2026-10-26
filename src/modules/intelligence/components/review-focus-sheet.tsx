"use client"

import { useEffect, useState } from "react"
import { ReviewSheet } from "@/src/modules/intelligence/components/review-sheet"
import type {
  AiHumanVerificationInput,
  AiReviewQueueItem,
} from "@/src/modules/intelligence/types/intelligence.types"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"

type ReviewFocusPending = {
  messageId: string | undefined
  verdict: AiHumanVerificationInput["verdict"]
}

type ReviewFocusSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  messages: AiReviewQueueItem[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  pending?: ReviewFocusPending
  onSubmit: (messageId: string, input: AiHumanVerificationInput) => void
}

/**
 * Un correo a la vez. La cola de atrás se queda cargada, así salir del foco
 * devuelve a la lista en el mismo punto, y el filtro de partición sigue activo.
 */
export function ReviewFocusSheet({
  open,
  onOpenChange,
  messages,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  pending,
  onSubmit,
}: ReviewFocusSheetProps) {
  const [position, setPosition] = useState(0)
  const [wasOpen, setWasOpen] = useState(open)
  const total = messages.length
  const current = messages[position]
  const waitingForMore =
    open && current === undefined && (hasNextPage || isFetchingNextPage)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setPosition(0)
    }
  }

  useEffect(() => {
    if (!open || !hasNextPage || isFetchingNextPage) {
      return
    }
    if (position + 1 < total) {
      return
    }
    onLoadMore()
  }, [open, position, total, hasNextPage, isFetchingNextPage, onLoadMore])

  function goToPrevious() {
    setPosition((previous) => Math.max(0, previous - 1))
  }

  function goToNext() {
    setPosition((previous) => Math.min(previous + 1, Math.max(0, total - 1)))
  }

  const formHeader = (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">
        {total === 0
          ? "Sin pendientes"
          : `${Math.min(position + 1, total)} de ${total} pendientes`}
      </span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Correo anterior"
          onClick={goToPrevious}
          disabled={position === 0}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Correo siguiente"
          onClick={goToNext}
          disabled={position + 1 >= total}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <ReviewSheet
        open={open && current !== undefined}
        onOpenChange={onOpenChange}
        messageId={current?.id ?? null}
        partition={current?.partition}
        pendingVerdict={
          pending && pending.messageId === current?.id
            ? pending.verdict
            : undefined
        }
        onSubmit={onSubmit}
        formHeader={formHeader}
        shortcuts={{ onNext: goToNext, onPrevious: goToPrevious }}
        closeLabel="Salir del modo foco"
      />
      <BottomSheet
        open={waitingForMore}
        onOpenChange={onOpenChange}
        title="Cargando pendientes"
        pending
      >
        <div />
      </BottomSheet>
      <BottomSheet
        open={open && current === undefined && !waitingForMore}
        onOpenChange={onOpenChange}
        title="Cola terminada"
        description="No quedan correos pendientes con los filtros activos."
        closeLabel="Salir"
      >
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckCircle2 aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Revisaste todos los pendientes</EmptyTitle>
            <EmptyDescription>
              Los correos nuevos aparecerán aquí cuando lleguen.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </BottomSheet>
    </>
  )
}
