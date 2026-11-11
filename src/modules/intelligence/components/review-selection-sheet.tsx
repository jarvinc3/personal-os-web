"use client"

import { useState } from "react"
import {
  CheckIcon,
  CheckCircle2Icon,
  FileTextIcon,
  PencilIcon,
  XIcon,
} from "lucide-react"

import { ReviewLabelFields } from "@/src/modules/intelligence/components/review-label-fields"
import {
  buildReviewSelectionVerification,
  canCorrectReviewSelection,
  REVIEW_SELECTION_DEFAULTS,
  REVIEW_SELECTION_SEMANTIC_TYPES,
  type ReviewSelectionValues,
} from "@/src/modules/intelligence/review-selection"
import type { SemanticRoute } from "@/src/modules/intelligence/review-labels"
import type { AiReviewSelectionVerificationInput } from "@/src/modules/intelligence/types/intelligence.types"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"

type ReviewSelectionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  messageIds: readonly string[]
  holdoutCount: number
  pending: boolean
  pendingVerdict?: "CONFIRMED" | "CORRECTED"
  onApply: (input: AiReviewSelectionVerificationInput) => void
}

export function ReviewSelectionSheet(props: ReviewSelectionSheetProps) {
  return (
    <ReviewSelectionSheetBody key={props.open ? "open" : "closed"} {...props} />
  )
}

function ReviewSelectionSheetBody({
  open,
  onOpenChange,
  messageIds,
  holdoutCount,
  pending,
  pendingVerdict,
  onApply,
}: ReviewSelectionSheetProps) {
  const [values, setValues] = useState<ReviewSelectionValues>(
    REVIEW_SELECTION_DEFAULTS
  )
  const [requestedVerdict, setRequestedVerdict] = useState<
    "CONFIRMED" | "CORRECTED" | null
  >(null)

  function selectSemanticType(
    semanticType: (typeof REVIEW_SELECTION_SEMANTIC_TYPES)[number]
  ) {
    setValues((current) => ({
      ...current,
      semanticType,
      relevance:
        semanticType === "SECURITY_ALERT"
          ? "relevant"
          : semanticType === "SECURITY_OTP"
            ? "irrelevant"
            : "",
    }))
  }

  function toggleRoute(route: SemanticRoute) {
    setValues((current) => ({
      ...current,
      routes: current.routes.includes(route)
        ? current.routes.filter((selected) => selected !== route)
        : [...current.routes, route],
    }))
  }

  function confirmSelection() {
    if (!requestedVerdict) {
      return
    }
    onApply(
      buildReviewSelectionVerification({
        messageIds,
        verdict: requestedVerdict,
        values,
      })
    )
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      showClose={false}
      title="Verificar selección"
      description={`${messageIds.length} correos seleccionados`}
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            <XIcon data-icon="inline-start" /> Cancelar
          </Button>
        ),
        submit: (
          <div className="flex w-full gap-2">
            <Button
              type="button"
              className="flex-1"
              onClick={() => setRequestedVerdict("CONFIRMED")}
              disabled={pending || messageIds.length === 0}
            >
              {pendingVerdict === "CONFIRMED" ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <CheckIcon data-icon="inline-start" />
              )}
              Confirmar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setRequestedVerdict("CORRECTED")}
              disabled={
                pending ||
                messageIds.length === 0 ||
                !canCorrectReviewSelection(values)
              }
            >
              {pendingVerdict === "CORRECTED" ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <PencilIcon data-icon="inline-start" />
              )}
              Corregir
            </Button>
          </div>
        ),
      }}
    >
      <div className="flex flex-col gap-4">
        <SummarySection title="Selección" icon={CheckCircle2Icon}>
          <div className="flex flex-wrap items-center gap-2 p-2">
            <Badge variant="secondary">
              {messageIds.length}{" "}
              {messageIds.length === 1 ? "correo" : "correos"}
            </Badge>
            {holdoutCount > 0 ? (
              <Badge variant="warning">
                {holdoutCount} HOLDOUT como verdad de referencia
              </Badge>
            ) : null}
            <span className="text-xs text-muted-foreground">
              La selección se procesa como un solo lote.
            </span>
          </div>
        </SummarySection>

        <SummarySection title="Etiquetas corregidas" icon={FileTextIcon}>
          <ReviewLabelFields
            fieldId="review-selection"
            relevance={values.relevance}
            semanticType={values.semanticType}
            routes={values.routes}
            semanticTypes={REVIEW_SELECTION_SEMANTIC_TYPES}
            onRelevanceChange={(relevance) =>
              setValues((current) => ({ ...current, relevance }))
            }
            onSemanticTypeChange={selectSemanticType}
            onToggleRoute={toggleRoute}
          />
        </SummarySection>
      </div>

      <ConfirmDialog
        open={requestedVerdict !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setRequestedVerdict(null)
          }
        }}
        icon={requestedVerdict === "CORRECTED" ? PencilIcon : CheckCircle2Icon}
        title={`¿Verificar ${messageIds.length} ${messageIds.length === 1 ? "correo" : "correos"}?`}
        description={
          requestedVerdict === "CORRECTED"
            ? "Se guardarán las etiquetas elegidas en cada correo seleccionado. La verificación no se puede deshacer."
            : "Se confirmará la clasificación actual de cada correo seleccionado. La verificación no se puede deshacer."
        }
        confirmLabel="Verificar"
        confirmIcon={CheckIcon}
        pending={pending}
        pendingLabel="Verificando..."
        onConfirm={confirmSelection}
      />
    </BottomSheet>
  )
}
