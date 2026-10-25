"use client"

import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAiEvidence } from "@/src/modules/intelligence/hooks/use-ai-evidence"
import {
  buildCorrection,
  REVIEW_FORM_DEFAULTS,
  reviewFormSchema,
  ROUTE_LABELS,
  SEMANTIC_TYPE_LABELS,
  TRANSACTION_DIRECTION_LABELS,
  TRANSACTION_KIND_LABELS,
  type ReviewFormValues,
  type SemanticRoute,
  type SemanticType,
  type TransactionDirection,
  type TransactionKind,
} from "@/src/modules/intelligence/review-labels"
import type {
  AiHumanVerificationInput,
  AiReviewQueueItem,
} from "@/src/modules/intelligence/types/intelligence.types"
import { Button } from "@/src/shared/components/ui/button"
import { Badge } from "@/src/shared/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/src/shared/components/ui/field"
import { Input } from "@/src/shared/components/ui/input"
import { Textarea } from "@/src/shared/components/ui/textarea"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { DateWheels } from "@/src/shared/components/forms/wheel-picker"
import { WheelField } from "@/src/shared/components/forms/wheel-field"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import { formatDate, formatDateTime } from "@/src/shared/lib/date-format"
import {
  AlertCircle,
  CalendarDays,
  Check,
  Clock3,
  Coins,
  Layers3,
  Mail,
  NotebookText,
  Pencil,
  ReceiptText,
  RotateCcw,
  Tag,
  X,
  Hash,
  ArrowLeftRight,
  Building2,
} from "lucide-react"

type AiEvidenceSectionProps = {
  enabled: boolean
  view: "review" | "runs"
  onOpenMessage: (messageId: string) => void
}

type ReviewPartitionFilter = "ALL" | "TRAIN" | "VALIDATION" | "HOLDOUT"

export function AiEvidenceSection({
  enabled,
  view,
  onOpenMessage,
}: AiEvidenceSectionProps) {
  const [partitionFilter, setPartitionFilter] =
    useState<ReviewPartitionFilter>("ALL")
  const { reviewQueueQuery, runsQuery, verifyMutation } = useAiEvidence(
    enabled,
    view,
    partitionFilter
  )
  const messages = useMemo(
    () => reviewQueueQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [reviewQueueQuery.data?.pages]
  )
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = reviewQueueQuery
  const reviewCounts = reviewQueueQuery.data?.pages[0]?.counts

  if (!enabled) {
    return null
  }

  if (view === "runs") {
    return (
      <div className="flex flex-col gap-2">
        {runsQuery.isPending ? (
          <div className="flex flex-col gap-2 p-2" aria-label="Cargando runs">
            <Skeleton className="h-14 w-full" />
          </div>
        ) : runsQuery.isError ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No se pudieron cargar las ejecuciones</EmptyTitle>
              <EmptyDescription>
                Inténtalo de nuevo en unos momentos.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : runsQuery.data?.length ? (
          runsQuery.data.map((run, index) => (
            <SummaryItem
              key={run.id}
              title={`${run.mode} · ${run.status}`}
              description={`Pipeline ${run.pipelineVersion} · observaciones ${run.observationSequence} · verificaciones ${run.verificationSequence}`}
              icon={Clock3}
              value={
                run.completedAt ? formatDateTime(run.completedAt) : "En curso"
              }
              isLast={index === runsQuery.data!.length - 1}
            />
          ))
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Clock3 aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Aún no hay ejecuciones</EmptyTitle>
              <EmptyDescription>
                Aparecerán aquí cuando se ejecute un análisis.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {reviewQueueQuery.isPending ? (
        <div className="flex flex-wrap gap-2" aria-label="Cargando filtros">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      ) : reviewQueueQuery.isError ? null : (
        <ToggleGroup
          value={[partitionFilter]}
          onValueChange={(next) => {
            const selected = next[0]
            if (
              selected === "ALL" ||
              selected === "TRAIN" ||
              selected === "VALIDATION" ||
              selected === "HOLDOUT"
            ) {
              setPartitionFilter(selected)
            }
          }}
          variant="outline"
          size="sm"
          aria-label="Filtrar correos por partición"
          className="w-full flex-wrap justify-start"
        >
          <ToggleGroupItem value="ALL" className="h-8 gap-2 rounded-full px-3">
            Todos <Badge variant="secondary">{reviewCounts?.all ?? 0}</Badge>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="TRAIN"
            className="h-8 gap-2 rounded-full px-3"
          >
            Entrenamiento{" "}
            <Badge variant="secondary">{reviewCounts?.TRAIN ?? 0}</Badge>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="VALIDATION"
            className="h-8 gap-2 rounded-full px-3"
          >
            Validación{" "}
            <Badge variant="secondary">{reviewCounts?.VALIDATION ?? 0}</Badge>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="HOLDOUT"
            className="h-8 gap-2 rounded-full px-3"
          >
            Holdout{" "}
            <Badge variant="secondary">{reviewCounts?.HOLDOUT ?? 0}</Badge>
          </ToggleGroupItem>
        </ToggleGroup>
      )}

      <div className="flex flex-col gap-2">
        {reviewQueueQuery.isPending ? (
          <div
            className="flex flex-col gap-2 p-2"
            aria-label="Cargando cola de revisión"
          >
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : reviewQueueQuery.isError ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No se pudo cargar la cola</EmptyTitle>
              <EmptyDescription>
                Tu correo ya importado se conserva.
              </EmptyDescription>
            </EmptyHeader>
            <Button
              type="button"
              onClick={() => void reviewQueueQuery.refetch()}
            >
              <RotateCcw data-icon="inline-start" /> Reintentar
            </Button>
          </Empty>
        ) : messages.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Check aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>La cola está al día</EmptyTitle>
              <EmptyDescription>
                Los mensajes nuevos aparecerán aquí para revisión.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {messages.map((message) => (
              <ReviewMessage
                key={message.id}
                message={message}
                disabled={verifyMutation.isPending}
                onOpenMessage={onOpenMessage}
                onSubmit={(input) =>
                  verifyMutation.mutate({ messageId: message.id, input })
                }
              />
            ))}
            {verifyMutation.isError ? (
              <p className="px-2 text-sm text-destructive" role="alert">
                No se pudo guardar la verificación. Revisa los datos e inténtalo
                otra vez.
              </p>
            ) : null}
            <InfiniteListSentinel
              hasNextPage={Boolean(hasNextPage)}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  void fetchNextPage()
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}

function ReviewMessage({
  message,
  disabled,
  onOpenMessage,
  onSubmit,
}: {
  message: AiReviewQueueItem
  disabled: boolean
  onOpenMessage: (messageId: string) => void
  onSubmit: (input: AiHumanVerificationInput) => void
}) {
  const [editing, setEditing] = useState(false)
  const {
    control,
    register,
    setValue,
    getValues,
    resetField,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    mode: "onTouched",
    defaultValues: REVIEW_FORM_DEFAULTS,
  })
  const values = useWatch({ control })
  const semanticType = values.semanticType ?? ""
  const selectedRoutes = values.routes ?? []
  const hasTransaction =
    semanticType === "FIN_TRANSACTION" ||
    semanticType === "PURCHASE_RECEIPT" ||
    semanticType === "SUBSCRIPTION_BILLING"
  const canCorrect = reviewFormSchema.safeParse(values).success && !disabled

  function selectSemanticType(value: SemanticType) {
    setValue("semanticType", value, { shouldValidate: true, shouldDirty: true })
    if (value === "SECURITY_ALERT" || value === "SECURITY_OTP") {
      setValue(
        "relevance",
        value === "SECURITY_ALERT" ? "relevant" : "irrelevant"
      )
    } else if (
      semanticType === "SECURITY_ALERT" ||
      semanticType === "SECURITY_OTP"
    ) {
      resetField("relevance")
    }
    if (value !== "FIN_TRANSACTION") {
      resetField("kind")
    }
    if (
      value !== "FIN_TRANSACTION" &&
      value !== "PURCHASE_RECEIPT" &&
      value !== "SUBSCRIPTION_BILLING"
    ) {
      for (const field of [
        "amount",
        "currency",
        "transactionDate",
        "direction",
        "merchant",
        "bankReference",
        "last4",
      ] as const) {
        resetField(field)
      }
    }
  }

  function toggleRoute(route: SemanticRoute) {
    setValue(
      "routes",
      selectedRoutes.includes(route)
        ? selectedRoutes.filter((selected) => selected !== route)
        : [...selectedRoutes, route],
      { shouldDirty: true, shouldValidate: true }
    )
  }

  function submit(verdict: AiHumanVerificationInput["verdict"]) {
    const form = getValues()
    if (verdict === "CORRECTED") {
      if (canCorrect) {
        onSubmit(buildCorrection(form))
      }
      return
    }
    onSubmit({
      verdict,
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    })
  }

  const partitionVariant =
    message.partition === "HOLDOUT" ? "warning" : "secondary"

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-2">
      <div className="flex min-w-0 items-start gap-2">
        <SummaryItem
          title={message.subject || "(sin asunto)"}
          description={`${message.fromAddress} · ${formatDateTime(message.receivedAt)}`}
          icon={Mail}
          onPress={() => onOpenMessage(message.id)}
          showChevron
          className="min-w-0 flex-1"
        />
        <div className="flex flex-col gap-2">
          <Badge variant={partitionVariant}>{message.partition}</Badge>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditing((editing) => !editing)}
          >
            <Pencil data-icon="inline-start" /> Revisar
          </Button>
        </div>
      </div>
      {message.partition === "HOLDOUT" ? (
        <p className="px-2 text-xs text-muted-foreground">
          La verificación quedará marcada como verdad de referencia.
        </p>
      ) : null}
      {editing && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-2 px-2 pb-2">
          <FieldGroup className="gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor={`relevance-${message.id}`}>
                  <Tag data-icon="inline-start" className="size-4" /> Relevancia
                </FieldLabel>
                <Select
                  value={values.relevance ?? ""}
                  onValueChange={(value) =>
                    setValue(
                      "relevance",
                      (value ?? "") as ReviewFormValues["relevance"],
                      { shouldDirty: true }
                    )
                  }
                  disabled={
                    semanticType === "SECURITY_ALERT" ||
                    semanticType === "SECURITY_OTP"
                  }
                >
                  <SelectTrigger
                    id={`relevance-${message.id}`}
                    className="w-full"
                  >
                    <Tag className="size-4" aria-hidden="true" />
                    <SelectValue placeholder="Sin etiqueta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="relevant">Relevante</SelectItem>
                      <SelectItem value="irrelevant">No relevante</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor={`semantic-${message.id}`}>
                  <Tag data-icon="inline-start" className="size-4" /> Tipo
                  semántico
                </FieldLabel>
                <Select
                  value={semanticType}
                  onValueChange={(value) =>
                    value && selectSemanticType(value as SemanticType)
                  }
                >
                  <SelectTrigger
                    id={`semantic-${message.id}`}
                    className="w-full"
                  >
                    <Tag className="size-4" aria-hidden="true" />
                    <SelectValue placeholder="Elige un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(
                        Object.entries(SEMANTIC_TYPE_LABELS) as [
                          SemanticType,
                          string,
                        ][]
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.semanticType?.message ? (
                  <FieldError>{errors.semanticType.message}</FieldError>
                ) : null}
              </Field>
            </div>
            <Field>
              <FieldLabel>
                <Layers3 data-icon="inline-start" className="size-4" /> Dominios
              </FieldLabel>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Dominios"
              >
                {(
                  Object.entries(ROUTE_LABELS) as [SemanticRoute, string][]
                ).map(([route, label]) => (
                  <Button
                    key={route}
                    type="button"
                    size="sm"
                    variant={
                      selectedRoutes.includes(route) ? "default" : "outline"
                    }
                    aria-pressed={selectedRoutes.includes(route)}
                    onClick={() => toggleRoute(route)}
                  >
                    <Layers3 className="size-4" aria-hidden="true" /> {label}
                  </Button>
                ))}
              </div>
              {!selectedRoutes.length ? (
                <p className="text-xs text-muted-foreground">Sin dominios</p>
              ) : null}
            </Field>
            {hasTransaction ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {semanticType === "FIN_TRANSACTION" ? (
                  <Field>
                    <FieldLabel htmlFor={`kind-${message.id}`}>
                      <ReceiptText className="size-4" aria-hidden="true" /> Tipo
                      de transacción
                    </FieldLabel>
                    <Select
                      value={values.kind ?? ""}
                      onValueChange={(value) =>
                        setValue("kind", (value ?? "") as TransactionKind, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger
                        id={`kind-${message.id}`}
                        className="w-full"
                      >
                        <ReceiptText className="size-4" aria-hidden="true" />
                        <SelectValue placeholder="Elige un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {(
                            Object.entries(TRANSACTION_KIND_LABELS) as [
                              TransactionKind,
                              string,
                            ][]
                          ).map(([kind, label]) => (
                            <SelectItem key={kind} value={kind}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.kind?.message ? (
                      <FieldError>{errors.kind.message}</FieldError>
                    ) : null}
                  </Field>
                ) : null}
                <Field>
                  <FieldLabel htmlFor={`amount-${message.id}`}>
                    <ReceiptText data-icon="inline-start" className="size-4" />{" "}
                    Monto (opcional)
                  </FieldLabel>
                  <Input
                    id={`amount-${message.id}`}
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    {...register("amount")}
                  />
                  {errors.amount?.message ? (
                    <FieldError>{errors.amount.message}</FieldError>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor={`currency-${message.id}`}>
                    <Coins data-icon="inline-start" className="size-4" /> Moneda
                    (opcional)
                  </FieldLabel>
                  <Input
                    id={`currency-${message.id}`}
                    maxLength={3}
                    placeholder="DOP"
                    {...register("currency", {
                      onChange: (event) =>
                        setValue("currency", event.target.value.toUpperCase()),
                    })}
                  />
                  {errors.currency?.message ? (
                    <FieldError>{errors.currency.message}</FieldError>
                  ) : null}
                </Field>
                <WheelField
                  label="Fecha (opcional)"
                  valueLabel={
                    values.transactionDate
                      ? formatDate(values.transactionDate)
                      : "Sin fecha"
                  }
                  icon={CalendarDays}
                  footer={(close) => (
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setValue("transactionDate", "", { shouldDirty: true })
                          close()
                        }}
                      >
                        <X className="size-4" aria-hidden="true" /> Sin fecha
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="ml-auto"
                        disabled={!values.transactionDate}
                        onClick={close}
                      >
                        <Check className="size-4" aria-hidden="true" /> Listo
                      </Button>
                    </div>
                  )}
                >
                  <DateWheels
                    value={values.transactionDate ?? ""}
                    onChange={(next) =>
                      setValue("transactionDate", next, { shouldDirty: true })
                    }
                  />
                </WheelField>
                <Field>
                  <FieldLabel htmlFor={`direction-${message.id}`}>
                    <ArrowLeftRight className="size-4" aria-hidden="true" />{" "}
                    Dirección (opcional)
                  </FieldLabel>
                  <Select
                    value={values.direction ?? ""}
                    onValueChange={(value) =>
                      setValue(
                        "direction",
                        (value ?? "") as TransactionDirection,
                        {
                          shouldDirty: true,
                        }
                      )
                    }
                  >
                    <SelectTrigger
                      id={`direction-${message.id}`}
                      className="w-full"
                    >
                      <ArrowLeftRight className="size-4" aria-hidden="true" />
                      <SelectValue placeholder="Sin dirección" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(
                          Object.entries(TRANSACTION_DIRECTION_LABELS) as [
                            TransactionDirection,
                            string,
                          ][]
                        ).map(([direction, label]) => (
                          <SelectItem key={direction} value={direction}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor={`merchant-${message.id}`}>
                    <Building2 className="size-4" aria-hidden="true" /> Comercio
                    (opcional)
                  </FieldLabel>
                  <Input
                    id={`merchant-${message.id}`}
                    {...register("merchant")}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`bank-reference-${message.id}`}>
                    <Hash className="size-4" aria-hidden="true" /> Referencia
                    bancaria (opcional)
                  </FieldLabel>
                  <Input
                    id={`bank-reference-${message.id}`}
                    {...register("bankReference")}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`last4-${message.id}`}>
                    <Hash className="size-4" aria-hidden="true" /> Últimos 4
                    dígitos (opcional)
                  </FieldLabel>
                  <Input
                    id={`last4-${message.id}`}
                    inputMode="numeric"
                    maxLength={4}
                    {...register("last4")}
                  />
                  {errors.last4?.message ? (
                    <FieldError>{errors.last4.message}</FieldError>
                  ) : null}
                </Field>
              </div>
            ) : null}
            <Field>
              <FieldLabel htmlFor={`notes-${message.id}`}>
                <NotebookText data-icon="inline-start" className="size-4" />{" "}
                Nota o motivo del rechazo
              </FieldLabel>
              <Textarea
                id={`notes-${message.id}`}
                {...register("notes")}
                placeholder="Obligatoria para Otro o al rechazar"
              />
              {errors.notes?.message ? (
                <FieldError>{errors.notes.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="flex-1"
              onClick={() => submit("CONFIRMED")}
              disabled={disabled}
            >
              <Check data-icon="inline-start" /> Confirmar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => submit("CORRECTED")}
              disabled={!canCorrect}
            >
              <Pencil data-icon="inline-start" /> Corregir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => submit("REJECTED")}
              disabled={disabled || !values.notes?.trim()}
            >
              <X data-icon="inline-start" /> Rechazar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
