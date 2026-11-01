"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { ReviewLabelFields } from "@/src/modules/intelligence/components/review-label-fields"
import {
  buildReviewGroupVerification,
  canBatchReviewGroup,
  canCorrectReviewGroup,
  countLabel,
  pendingOutsideHoldout,
  REVIEW_GROUP_BATCH_DEFAULTS,
  REVIEW_GROUP_SEMANTIC_TYPES,
  reviewGroupBatchResultLines,
  reviewGroupBatchSchema,
  reviewGroupKey,
  type ReviewGroupBatchValues,
  type ReviewGroupSemanticType,
} from "@/src/modules/intelligence/review-groups"
import type { SemanticRoute } from "@/src/modules/intelligence/review-labels"
import type {
  AiReviewGroup,
  AiReviewGroupVerdict,
  AiReviewGroupVerificationInput,
  AiReviewGroupVerificationResult,
} from "@/src/modules/intelligence/types/intelligence.types"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Check, CheckCircle2, FileText, Pencil, X } from "lucide-react"

type ReviewGroupBatchSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: AiReviewGroup | null
  result: AiReviewGroupVerificationResult | null
  pending: boolean
  pendingVerdict?: AiReviewGroupVerdict
  onApply: (input: AiReviewGroupVerificationInput) => void
}

/** Remonta el formulario cuando cambia el grupo, la hoja o el resultado. */
export function ReviewGroupBatchSheet(props: ReviewGroupBatchSheetProps) {
  const state = props.result
    ? "result"
    : props.group
      ? reviewGroupKey(props.group)
      : "pending"

  return <ReviewGroupBatchSheetBody key={state} {...props} />
}

function ReviewGroupBatchSheetBody({
  open,
  onOpenChange,
  group,
  result,
  pending,
  pendingVerdict,
  onApply,
}: ReviewGroupBatchSheetProps) {
  const {
    control,
    resetField,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ReviewGroupBatchValues>({
    resolver: zodResolver(reviewGroupBatchSchema),
    mode: "onTouched",
    defaultValues: REVIEW_GROUP_BATCH_DEFAULTS,
  })
  const watched = useWatch({ control })
  const values: ReviewGroupBatchValues = {
    relevance: watched.relevance ?? "",
    semanticType: watched.semanticType ?? "",
    routes: watched.routes ?? [],
  }
  const [requestedVerdict, setRequestedVerdict] =
    useState<AiReviewGroupVerdict | null>(null)
  const verifiable = group ? pendingOutsideHoldout(group) : 0

  function selectSemanticType(value: ReviewGroupSemanticType) {
    setValue("semanticType", value, { shouldDirty: true, shouldValidate: true })
    if (value === "SECURITY_ALERT") {
      setValue("relevance", "relevant")
      return
    }
    if (value === "SECURITY_OTP") {
      setValue("relevance", "irrelevant")
      return
    }
    resetField("relevance")
  }

  function toggleRoute(route: SemanticRoute) {
    const routes = values.routes
    setValue(
      "routes",
      routes.includes(route)
        ? routes.filter((selected) => selected !== route)
        : [...routes, route],
      { shouldDirty: true, shouldValidate: true }
    )
  }

  function confirmBatch() {
    if (!requestedVerdict || !group) {
      return
    }
    onApply(
      buildReviewGroupVerification({
        group,
        verdict: requestedVerdict,
        values: getValues(),
      })
    )
  }

  const closeAction = (
    <Button
      type="button"
      variant="outline"
      className="flex-1"
      onClick={() => onOpenChange(false)}
      disabled={pending}
    >
      <X className="size-4 shrink-0" aria-hidden="true" />
      {result ? "Cerrar" : "Cancelar"}
    </Button>
  )

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      showClose={false}
      pending={open && group === null && result === null}
      title="Etiquetar grupo"
      description={
        group
          ? `${group.fromAddress} · ${countLabel(group.total, "correo", "correos")}`
          : undefined
      }
      actions={{
        close: closeAction,
        submit: result ? undefined : (
          <div className="flex w-full gap-2">
            <Button
              type="button"
              className="flex-1"
              onClick={() => setRequestedVerdict("CONFIRMED")}
              disabled={pending || verifiable === 0}
            >
              {pendingVerdict === "CONFIRMED" ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Check data-icon="inline-start" />
              )}
              Confirmar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setRequestedVerdict("CORRECTED")}
              disabled={
                pending || verifiable === 0 || !canCorrectReviewGroup(values)
              }
            >
              {pendingVerdict === "CORRECTED" ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Pencil data-icon="inline-start" />
              )}
              Corregir
            </Button>
          </div>
        ),
      }}
    >
      {result ? (
        <SummarySection title="Resultado del lote" icon={CheckCircle2}>
          <ul className="flex flex-col gap-1 p-2 text-sm" aria-live="polite">
            {reviewGroupBatchResultLines(result).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </SummarySection>
      ) : group ? (
        <div className="flex flex-col gap-4">
          <SummarySection title="Asuntos de muestra" icon={FileText}>
            <ul className="list-disc py-2 pr-2 pl-6 text-sm text-muted-foreground">
              {group.sampleSubjects.map((subject) => (
                <li key={subject} className="break-words">
                  {subject || "(sin asunto)"}
                </li>
              ))}
            </ul>
          </SummarySection>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {countLabel(verifiable, "por verificar", "por verificar")}
            </Badge>
            {group.pendingHoldout > 0 ? (
              <Badge variant="warning">
                {countLabel(
                  group.pendingHoldout,
                  "HOLDOUT fuera",
                  "HOLDOUT fuera"
                )}
              </Badge>
            ) : null}
            {canBatchReviewGroup(group) ? null : (
              <span className="text-xs text-muted-foreground">
                Solo quedan HOLDOUT: se revisan uno a uno en la cola.
              </span>
            )}
          </div>
          <ReviewLabelFields
            fieldId="review-group"
            relevance={values.relevance}
            semanticType={values.semanticType}
            routes={values.routes}
            semanticTypes={REVIEW_GROUP_SEMANTIC_TYPES}
            relevanceError={errors.relevance?.message}
            semanticTypeError={errors.semanticType?.message}
            onRelevanceChange={(relevance) =>
              setValue("relevance", relevance, { shouldDirty: true })
            }
            onSemanticTypeChange={selectSemanticType}
            onToggleRoute={toggleRoute}
          />
          <p className="text-xs text-muted-foreground">
            Confirmar registra el acierto del sistema sin cambiar etiquetas.
            Corregir exige relevancia o tipo y guarda los dominios marcados en
            todos los pendientes fuera de HOLDOUT.
          </p>
        </div>
      ) : null}

      <ConfirmDialog
        open={requestedVerdict !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setRequestedVerdict(null)
          }
        }}
        icon={requestedVerdict === "CORRECTED" ? Pencil : Check}
        title={
          group
            ? `¿Verificar ${countLabel(verifiable, "correo", "correos")} de ${group.fromAddress}?`
            : "¿Verificar el lote?"
        }
        description={
          <>
            {requestedVerdict === "CORRECTED"
              ? `Se registra la corrección con las etiquetas elegidas en ${countLabel(verifiable, "correo pendiente", "correos pendientes")}. `
              : `Se registra la verificación en ${countLabel(verifiable, "correo pendiente", "correos pendientes")}. `}
            {group && group.pendingHoldout > 0
              ? `${countLabel(group.pendingHoldout, "HOLDOUT queda", "HOLDOUT quedan")} fuera del lote y siguen en la cola individual. `
              : null}
            La verificación no se puede deshacer.
          </>
        }
        confirmLabel="Verificar"
        confirmIcon={Check}
        pending={pending}
        pendingLabel="Verificando..."
        onConfirm={confirmBatch}
      />
    </BottomSheet>
  )
}
