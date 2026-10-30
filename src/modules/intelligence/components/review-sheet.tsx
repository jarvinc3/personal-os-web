"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, type ReactNode } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useIntelligenceMessage } from "@/src/modules/intelligence/hooks/use-intelligence"
import { useReviewShortcutListener } from "@/src/modules/intelligence/hooks/use-review-shortcuts"
import { shortMessageId } from "@/src/modules/intelligence/message-id"
import { cleanPreviewText } from "@/src/modules/intelligence/preview-text"
import {
  REVIEW_SHORTCUT_HELP,
  type ReviewShortcut,
} from "@/src/modules/intelligence/review-shortcuts"
import {
  buildCorrection,
  RELEVANCE_LABELS,
  REVIEW_FORM_DEFAULTS,
  reviewFormSchema,
  reviewSelectLabel,
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
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { DateWheels } from "@/src/shared/components/forms/wheel-picker"
import { WheelField } from "@/src/shared/components/forms/wheel-field"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Textarea } from "@/src/shared/components/ui/textarea"
import { formatDate, formatDateTime } from "@/src/shared/lib/date-format"
import {
  AlertCircle,
  ArrowLeftRight,
  Building2,
  CalendarDays,
  Check,
  Coins,
  FileText,
  Hash,
  Layers3,
  NotebookText,
  Pencil,
  ReceiptText,
  RefreshCw,
  Tag,
  X,
} from "lucide-react"

type ReviewSheetShortcuts = {
  onNext: () => void
  onPrevious: () => void
}

type ReviewSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  messageId: string | null
  partition?: AiReviewQueueItem["partition"]
  pendingVerdict?: AiHumanVerificationInput["verdict"]
  onSubmit: (messageId: string, input: AiHumanVerificationInput) => void
  /** Posición y navegación encima del formulario, en el modo foco. */
  formHeader?: ReactNode
  /** Activa los atajos de teclado y su ayuda visible. */
  shortcuts?: ReviewSheetShortcuts
  closeLabel?: string
}

export function ReviewSheet({
  open,
  onOpenChange,
  messageId,
  partition,
  pendingVerdict,
  onSubmit,
  formHeader,
  shortcuts,
  closeLabel = "Cerrar sin verificar",
}: ReviewSheetProps) {
  const messageQuery = useIntelligenceMessage(messageId)
  const message = messageQuery.data
  const {
    control,
    register,
    setValue,
    getValues,
    reset,
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
  const canCorrect = reviewFormSchema.safeParse(values).success
  const isPending = pendingVerdict !== undefined

  useEffect(() => {
    if (open) {
      reset(REVIEW_FORM_DEFAULTS)
    }
  }, [messageId, open, reset])

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
    if (!messageId) {
      return
    }
    const form = getValues()
    if (verdict === "CORRECTED") {
      if (canCorrect) {
        onSubmit(messageId, buildCorrection(form))
      }
      return
    }
    onSubmit(messageId, {
      verdict,
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    })
  }

  const fieldId = messageId ?? "review"

  function focusField(fieldName: string) {
    document.getElementById(fieldName)?.focus()
  }

  function handleShortcut(shortcut: ReviewShortcut) {
    if (shortcut === "next") {
      shortcuts?.onNext()
      return
    }
    if (shortcut === "previous") {
      shortcuts?.onPrevious()
      return
    }
    if (shortcut === "confirm") {
      submit("CONFIRMED")
      return
    }
    if (shortcut === "correct") {
      if (!canCorrect) {
        focusField(`semantic-${fieldId}`)
        return
      }
      submit("CORRECTED")
      return
    }
    if (!getValues().notes.trim()) {
      focusField(`notes-${fieldId}`)
      return
    }
    submit("REJECTED")
  }

  useReviewShortcutListener({
    enabled: open && shortcuts !== undefined,
    onShortcut: handleShortcut,
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      size="wide"
      showClose={false}
      title={message?.subject || "Revisar correo"}
      description={
        message
          ? `${message.fromAddress} · ${formatDateTime(message.receivedAt)} · #${shortMessageId(message.id)}`
          : undefined
      }
      headerAction={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={closeLabel}
          onClick={() => onOpenChange(false)}
        >
          <X aria-hidden="true" />
        </Button>
      }
      actions={{
        submit: (
          <div className="flex w-full gap-2">
            <Button
              type="button"
              className="flex-1"
              onClick={() => submit("CONFIRMED")}
              disabled={isPending}
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
              onClick={() => submit("CORRECTED")}
              disabled={!canCorrect || isPending}
            >
              {pendingVerdict === "CORRECTED" ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Pencil data-icon="inline-start" />
              )}
              Corregir
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={() => submit("REJECTED")}
              disabled={isPending || !values.notes?.trim()}
            >
              {pendingVerdict === "REJECTED" ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <X data-icon="inline-start" />
              )}
              Rechazar
            </Button>
          </div>
        ),
      }}
    >
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start">
        <ReviewPreview
          messageId={messageId}
          partition={partition}
          isPending={messageQuery.isPending}
          isError={messageQuery.isError}
          subject={message?.subject}
          fromAddress={message?.fromAddress}
          receivedAt={message?.receivedAt}
          sanitizedBody={message?.content?.sanitizedBody}
          rawBody={message?.content?.rawBody}
          onRetry={() => void messageQuery.refetch()}
        />
        <div className="flex flex-col gap-3">
          {formHeader}
          {shortcuts ? <ReviewShortcutHelp /> : null}
          <FieldGroup className="gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor={`relevance-${fieldId}`}>
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
                  <SelectTrigger id={`relevance-${fieldId}`} className="w-full">
                    <Tag className="size-4" aria-hidden="true" />
                    <SelectValue placeholder="Sin etiqueta">
                      {(value: string | null) =>
                        reviewSelectLabel(
                          value,
                          RELEVANCE_LABELS,
                          "Sin etiqueta"
                        )
                      }
                    </SelectValue>
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
                <FieldLabel htmlFor={`semantic-${fieldId}`}>
                  <Tag data-icon="inline-start" className="size-4" /> Tipo
                  semántico
                </FieldLabel>
                <Select
                  value={semanticType}
                  onValueChange={(value) =>
                    value && selectSemanticType(value as SemanticType)
                  }
                >
                  <SelectTrigger id={`semantic-${fieldId}`} className="w-full">
                    <Tag className="size-4" aria-hidden="true" />
                    <SelectValue placeholder="Elige un tipo">
                      {(value: string | null) =>
                        reviewSelectLabel(
                          value,
                          SEMANTIC_TYPE_LABELS,
                          "Elige un tipo"
                        )
                      }
                    </SelectValue>
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
                    <FieldLabel htmlFor={`kind-${fieldId}`}>
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
                      <SelectTrigger id={`kind-${fieldId}`} className="w-full">
                        <ReceiptText className="size-4" aria-hidden="true" />
                        <SelectValue placeholder="Elige un tipo">
                          {(value: string | null) =>
                            reviewSelectLabel(
                              value,
                              TRANSACTION_KIND_LABELS,
                              "Elige un tipo"
                            )
                          }
                        </SelectValue>
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
                  <FieldLabel htmlFor={`amount-${fieldId}`}>
                    <ReceiptText data-icon="inline-start" className="size-4" />{" "}
                    Monto (opcional)
                  </FieldLabel>
                  <Input
                    id={`amount-${fieldId}`}
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
                  <FieldLabel htmlFor={`currency-${fieldId}`}>
                    <Coins data-icon="inline-start" className="size-4" /> Moneda
                    (opcional)
                  </FieldLabel>
                  <Input
                    id={`currency-${fieldId}`}
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
                  <FieldLabel htmlFor={`direction-${fieldId}`}>
                    <ArrowLeftRight className="size-4" aria-hidden="true" />{" "}
                    Dirección (opcional)
                  </FieldLabel>
                  <Select
                    value={values.direction ?? ""}
                    onValueChange={(value) =>
                      setValue(
                        "direction",
                        (value ?? "") as TransactionDirection,
                        { shouldDirty: true }
                      )
                    }
                  >
                    <SelectTrigger
                      id={`direction-${fieldId}`}
                      className="w-full"
                    >
                      <ArrowLeftRight className="size-4" aria-hidden="true" />
                      <SelectValue placeholder="Sin dirección">
                        {(value: string | null) =>
                          reviewSelectLabel(
                            value,
                            TRANSACTION_DIRECTION_LABELS,
                            "Sin dirección"
                          )
                        }
                      </SelectValue>
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
                  <FieldLabel htmlFor={`merchant-${fieldId}`}>
                    <Building2 className="size-4" aria-hidden="true" /> Comercio
                    (opcional)
                  </FieldLabel>
                  <Input id={`merchant-${fieldId}`} {...register("merchant")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`bank-reference-${fieldId}`}>
                    <Hash className="size-4" aria-hidden="true" /> Referencia
                    bancaria (opcional)
                  </FieldLabel>
                  <Input
                    id={`bank-reference-${fieldId}`}
                    {...register("bankReference")}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`last4-${fieldId}`}>
                    <Hash className="size-4" aria-hidden="true" /> Últimos 4
                    dígitos (opcional)
                  </FieldLabel>
                  <Input
                    id={`last4-${fieldId}`}
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
              <FieldLabel htmlFor={`notes-${fieldId}`}>
                <NotebookText data-icon="inline-start" className="size-4" />{" "}
                Nota o motivo del rechazo
              </FieldLabel>
              <Textarea
                id={`notes-${fieldId}`}
                {...register("notes")}
                placeholder="Obligatoria para Otro o al rechazar"
              />
              {errors.notes?.message ? (
                <FieldError>{errors.notes.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </div>
      </div>
    </BottomSheet>
  )
}

function ReviewShortcutHelp() {
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1"
      aria-label="Atajos de teclado"
    >
      {REVIEW_SHORTCUT_HELP.map((shortcut) => (
        <span
          key={shortcut.key}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground"
        >
          <kbd className="rounded border border-border bg-muted px-1.5 font-mono text-[0.7rem] leading-5">
            {shortcut.key}
          </kbd>
          {shortcut.label}
        </span>
      ))}
    </div>
  )
}

type ReviewPreviewProps = {
  messageId: string | null
  partition?: AiReviewQueueItem["partition"]
  isPending: boolean
  isError: boolean
  subject?: string
  fromAddress?: string
  receivedAt?: string
  sanitizedBody?: string | null
  rawBody?: string | null
  onRetry: () => void
}

function ReviewPreview({
  messageId,
  partition,
  isPending,
  isError,
  subject,
  fromAddress,
  receivedAt,
  sanitizedBody,
  rawBody,
  onRetry,
}: ReviewPreviewProps) {
  if (isPending) {
    return (
      <div className="flex flex-col gap-2" aria-label="Cargando el correo">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No se pudo cargar el correo</EmptyTitle>
          <EmptyDescription>
            La vista previa no está disponible ahora.
          </EmptyDescription>
        </EmptyHeader>
        <Button type="button" onClick={onRetry}>
          <RefreshCw data-icon="inline-start" /> Reintentar
        </Button>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          {partition ? (
            <Badge variant={partition === "HOLDOUT" ? "warning" : "secondary"}>
              {partition}
            </Badge>
          ) : null}
          {messageId ? (
            <span className="font-mono text-xs text-muted-foreground">
              #{shortMessageId(messageId)}
            </span>
          ) : null}
        </div>
        <p className="text-sm font-medium wrap-break-word">
          {subject || "(sin asunto)"}
        </p>
        <p className="text-xs wrap-break-word text-muted-foreground">
          {fromAddress} · {receivedAt ? formatDateTime(receivedAt) : ""}
        </p>
      </div>
      {partition === "HOLDOUT" ? (
        <p className="text-xs text-muted-foreground">
          Esta verificación quedará marcada como verdad de referencia.
        </p>
      ) : null}
      <div className="max-h-52 overflow-auto rounded-lg bg-muted p-3 text-sm wrap-break-word whitespace-pre-wrap md:max-h-96">
        {cleanPreviewText(sanitizedBody ?? null) || "Sin contenido"}
      </div>
      <SummarySection
        title="Cruda (retención limitada)"
        icon={FileText}
        collapsible
      >
        <pre className="max-h-60 overflow-auto rounded-lg bg-muted p-3 font-sans text-sm wrap-break-word whitespace-pre-wrap">
          {rawBody || "No disponible"}
        </pre>
      </SummarySection>
    </div>
  )
}
