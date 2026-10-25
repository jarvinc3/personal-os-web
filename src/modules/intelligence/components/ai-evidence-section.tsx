"use client"

import { useMemo, useState } from "react"
import { useAiEvidence } from "@/src/modules/intelligence/hooks/use-ai-evidence"
import type {
  AiHumanVerificationInput,
  AiReviewQueueItem,
} from "@/src/modules/intelligence/types/intelligence.types"
import { Button } from "@/src/shared/components/ui/button"
import { Badge } from "@/src/shared/components/ui/badge"
import { Checkbox } from "@/src/shared/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/src/shared/components/ui/field"
import { Input } from "@/src/shared/components/ui/input"
import { Textarea } from "@/src/shared/components/ui/textarea"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { formatDateTime } from "@/src/shared/lib/date-format"
import {
  AlertCircle,
  CalendarDays,
  Check,
  CircleHelp,
  Clock3,
  Coins,
  Database,
  FileCheck2,
  Inbox,
  Layers3,
  Mail,
  Pencil,
  ReceiptText,
  RotateCcw,
  Tag,
  X,
} from "lucide-react"

type AiEvidenceSectionProps = {
  enabled: boolean
  onOpenMessage: (messageId: string) => void
}

export function AiEvidenceSection({
  enabled,
  onOpenMessage,
}: AiEvidenceSectionProps) {
  const { datasetQuery, reviewQueueQuery, runsQuery, verifyMutation } =
    useAiEvidence(enabled)
  const messages = useMemo(
    () => reviewQueueQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [reviewQueueQuery.data?.pages]
  )
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = reviewQueueQuery

  if (!enabled) {
    return null
  }

  return (
    <>
      <SummarySection
        title="Dataset de correo EMAIL_V1"
        subtitle="Particiones deterministas por cuenta; HOLDOUT se conserva como referencia."
        icon={Database}
      >
        {datasetQuery.isPending ? (
          <div
            className="flex flex-col gap-2 p-2"
            aria-label="Cargando dataset"
          >
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : datasetQuery.isError || !datasetQuery.data ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No se pudo cargar el dataset</EmptyTitle>
              <EmptyDescription>
                Inténtalo de nuevo en unos momentos.
              </EmptyDescription>
            </EmptyHeader>
            <Button type="button" onClick={() => void datasetQuery.refetch()}>
              <RotateCcw data-icon="inline-start" /> Reintentar
            </Button>
          </Empty>
        ) : (
          <>
            <SummaryItem
              title="Entrenamiento"
              icon={Layers3}
              value={String(datasetQuery.data.partitions.TRAIN)}
            />
            <SummaryItem
              title="Validación"
              icon={CircleHelp}
              value={String(datasetQuery.data.partitions.VALIDATION)}
            />
            <SummaryItem
              title="Holdout · verdad de referencia"
              icon={FileCheck2}
              value={String(datasetQuery.data.partitions.HOLDOUT)}
              isLast
            />
          </>
        )}
      </SummarySection>

      <SummarySection
        title="Cola de revisión"
        subtitle="Tus mensajes y tus verificaciones permanecen privados."
        icon={Inbox}
      >
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
      </SummarySection>

      <SummarySection
        title="Runs de análisis"
        subtitle="Cada ejecución conserva su configuración y watermark."
        icon={Clock3}
      >
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
              <EmptyTitle>No se pudieron cargar los runs</EmptyTitle>
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
              <EmptyTitle>Aún no hay runs</EmptyTitle>
              <EmptyDescription>
                Se mostrarán aquí cuando se ejecute un análisis.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </SummarySection>
    </>
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
  const [relevance, setRelevance] = useState("")
  const [semanticType, setSemanticType] = useState("")
  const [routes, setRoutes] = useState("")
  const [hasTransaction, setHasTransaction] = useState(false)
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("")
  const [date, setDate] = useState("")
  const [notes, setNotes] = useState("")

  function submit(verdict: AiHumanVerificationInput["verdict"]) {
    const input: AiHumanVerificationInput = {
      verdict,
      ...(relevance ? { relevance: relevance === "relevant" } : {}),
      ...(semanticType.trim() ? { semanticType: semanticType.trim() } : {}),
      ...(routes.trim()
        ? {
            routes: routes
              .split(",")
              .map((route) => route.trim())
              .filter(Boolean),
          }
        : {}),
      ...(hasTransaction
        ? {
            transaction: {
              present: true,
              ...(amount ? { amount } : {}),
              ...(currency ? { currency: currency.trim().toUpperCase() } : {}),
              ...(date ? { date } : {}),
            },
          }
        : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    }
    onSubmit(input)
  }

  const partitionVariant =
    message.partition === "HOLDOUT" ? "warning" : "secondary"

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border p-2">
      <div className="flex min-w-0 items-start gap-2">
        <SummaryItem
          title={message.subject || "(sin asunto)"}
          description={`${message.fromAddress} · ${formatDateTime(message.receivedAt)}`}
          icon={Mail}
          onPress={() => onOpenMessage(message.id)}
          showChevron
          className="min-w-0 flex-1"
        />
        <Badge variant={partitionVariant}>{message.partition}</Badge>
      </div>
      {message.partition === "HOLDOUT" ? (
        <p className="px-2 text-xs text-muted-foreground">
          La verificación quedará marcada como verdad de referencia.
        </p>
      ) : null}
      {editing ? (
        <div className="flex flex-col gap-3 px-2 pb-2">
          <FieldGroup className="gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor={`relevance-${message.id}`}>
                  <Tag data-icon="inline-start" /> Relevancia
                </FieldLabel>
                <Select
                  value={relevance}
                  onValueChange={(value) => setRelevance(value ?? "")}
                >
                  <SelectTrigger
                    id={`relevance-${message.id}`}
                    className="w-full"
                  >
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
                  <Tag data-icon="inline-start" /> Tipo semántico
                </FieldLabel>
                <Input
                  id={`semantic-${message.id}`}
                  value={semanticType}
                  onChange={(event) => setSemanticType(event.target.value)}
                  placeholder="p. ej. recibo, aviso, OTP"
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor={`routes-${message.id}`}>
                <Layers3 data-icon="inline-start" /> Rutas
              </FieldLabel>
              <Input
                id={`routes-${message.id}`}
                value={routes}
                onChange={(event) => setRoutes(event.target.value)}
                placeholder="Separadas por coma"
              />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor={`transaction-${message.id}`}>
                <Checkbox
                  id={`transaction-${message.id}`}
                  checked={hasTransaction}
                  onCheckedChange={(checked) =>
                    setHasTransaction(checked === true)
                  }
                />
                Contiene una transacción
              </FieldLabel>
            </Field>
            {hasTransaction ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor={`amount-${message.id}`}>
                    <ReceiptText data-icon="inline-start" /> Monto
                  </FieldLabel>
                  <Input
                    id={`amount-${message.id}`}
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`currency-${message.id}`}>
                    <Coins data-icon="inline-start" /> Moneda
                  </FieldLabel>
                  <Input
                    id={`currency-${message.id}`}
                    maxLength={3}
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    placeholder="USD"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`date-${message.id}`}>
                    <CalendarDays data-icon="inline-start" /> Fecha
                  </FieldLabel>
                  <Input
                    id={`date-${message.id}`}
                    inputMode="numeric"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    placeholder="AAAA-MM-DD"
                  />
                </Field>
              </div>
            ) : null}
            <Field>
              <FieldLabel htmlFor={`notes-${message.id}`}>
                Nota o motivo del rechazo
              </FieldLabel>
              <Textarea
                id={`notes-${message.id}`}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Obligatorio para rechazar"
              />
            </Field>
          </FieldGroup>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => submit("CONFIRMED")}
              disabled={disabled}
            >
              <Check data-icon="inline-start" /> Confirmar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => submit("CORRECTED")}
              disabled={disabled}
            >
              <Pencil data-icon="inline-start" /> Corregir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => submit("REJECTED")}
              disabled={disabled || !notes.trim()}
            >
              <X data-icon="inline-start" /> Rechazar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setEditing(false)}
              disabled={disabled}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end px-2 pb-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditing(true)}
          >
            <Pencil data-icon="inline-start" /> Revisar
          </Button>
        </div>
      )}
    </div>
  )
}
