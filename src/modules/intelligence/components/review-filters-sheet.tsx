"use client"

import { useState } from "react"
import {
  ArrowDownWideNarrowIcon,
  ArrowUpNarrowWideIcon,
  CalendarDaysIcon,
  CheckIcon,
  CircleHelpIcon,
  EraserIcon,
  InboxIcon,
  Layers3Icon,
  MailIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  TagsIcon,
  XIcon,
} from "lucide-react"

import {
  ROUTE_LABELS,
  SEMANTIC_TYPE_LABELS,
} from "@/src/modules/intelligence/review-labels"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { SelectField } from "@/src/shared/components/forms/select-field"
import { SwitchFieldRow } from "@/src/shared/components/forms/switch-field-row"
import { WheelField } from "@/src/shared/components/forms/wheel-field"
import { DateWheels } from "@/src/shared/components/forms/wheel-picker"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import {
  formatReviewDay,
  patchReviewQueueDraft,
  reviewQueueDatePatch,
  REVIEW_QUEUE_FILTER_DEFAULTS,
  REVIEW_QUEUE_PARTITION_FILTERS,
  REVIEW_QUEUE_ROUTE_FILTERS,
  REVIEW_QUEUE_SEMANTIC_TYPE_FILTERS,
  REVIEW_QUEUE_STATUS_FILTERS,
  type ReviewQueueFilters,
  type ReviewQueueOrderFilter,
} from "@/src/modules/intelligence/review-queue-filters"

const ORDER_OPTIONS: {
  value: ReviewQueueOrderFilter
  label: string
  icon: typeof ArrowDownWideNarrowIcon
}[] = [
  { value: "OLDEST", label: "Más antiguos", icon: ArrowUpNarrowWideIcon },
  { value: "NEWEST", label: "Más recientes", icon: ArrowDownWideNarrowIcon },
  { value: "IMPACT", label: "Mayor impacto", icon: SparklesIcon },
]

const STATUS_OPTIONS = REVIEW_QUEUE_STATUS_FILTERS.map((value) => ({
  value,
  label:
    value === "ALL"
      ? "Todos"
      : value === "CONFIRMED"
        ? "Confirmados"
        : value === "CORRECTED"
          ? "Corregidos"
          : "Rechazados",
}))

const PARTITION_OPTIONS = REVIEW_QUEUE_PARTITION_FILTERS.map((value) => ({
  value,
  label:
    value === "ALL"
      ? "Todas"
      : value === "TRAIN"
        ? "Entrenamiento"
        : value === "VALIDATION"
          ? "Validación"
          : "Holdout",
}))

const SEMANTIC_TYPE_OPTIONS = REVIEW_QUEUE_SEMANTIC_TYPE_FILTERS.map(
  (value) => ({
    value,
    label: value === "ALL" ? "Todos los tipos" : SEMANTIC_TYPE_LABELS[value],
  })
)

const ROUTE_OPTIONS = REVIEW_QUEUE_ROUTE_FILTERS.map((value) => ({
  value,
  label: value === "ALL" ? "Todos los dominios" : ROUTE_LABELS[value],
}))

type ReviewFiltersSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ReviewQueueFilters
  onApply: (patch: Partial<ReviewQueueFilters>) => void
}

export function ReviewFiltersSheet(props: ReviewFiltersSheetProps) {
  return (
    <ReviewFiltersSheetForm key={props.open ? "open" : "closed"} {...props} />
  )
}

function ReviewFiltersSheetForm({
  open,
  onOpenChange,
  filters,
  onApply,
}: ReviewFiltersSheetProps) {
  const formatLocale = useFormatLocale()
  const [draft, setDraft] = useState(filters)
  const [confidenceMin, setConfidenceMin] = useState(
    toConfidencePercent(filters.confidenceMin)
  )
  const [confidenceMax, setConfidenceMax] = useState(
    toConfidencePercent(filters.confidenceMax)
  )
  const [confidenceError, setConfidenceError] = useState<string | null>(null)

  function patchDraft(patch: Partial<ReviewQueueFilters>) {
    setDraft((current) => patchReviewQueueDraft(current, patch))
  }

  function changeDate(field: "dateFrom" | "dateTo", day: string) {
    setDraft((current) =>
      patchReviewQueueDraft(current, reviewQueueDatePatch(field, day, current))
    )
  }

  function clearDraft() {
    setDraft({ ...REVIEW_QUEUE_FILTER_DEFAULTS, tab: filters.tab })
    setConfidenceMin("")
    setConfidenceMax("")
    setConfidenceError(null)
  }

  function applyDraft() {
    const min = parseConfidencePercent(confidenceMin)
    const max = parseConfidencePercent(confidenceMax)
    if (min === undefined || max === undefined) {
      setConfidenceError("Usa un porcentaje entre 0 y 100")
      return
    }
    setConfidenceError(null)
    onApply({ ...draft, confidenceMin: min, confidenceMax: max })
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filtros de revisión"
      description="Combina filtros para acotar los correos de esta pestaña."
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon data-icon="inline-start" /> Cancelar
          </Button>
        ),
        submit: (
          <Button type="button" className="flex-1" onClick={applyDraft}>
            <CheckIcon data-icon="inline-start" /> Aplicar
          </Button>
        ),
      }}
    >
      <div className="flex flex-col gap-4">
        <SummarySection title="Cola" icon={InboxIcon}>
          {filters.tab === "reviewed" ? (
            <SelectField
              label="Estado"
              icon={CheckIcon}
              value={draft.status}
              onChange={(value) =>
                patchDraft({ status: value as ReviewQueueFilters["status"] })
              }
              options={STATUS_OPTIONS}
            />
          ) : null}
          <SelectField
            label="Conjunto"
            icon={Layers3Icon}
            value={draft.partition}
            onChange={(value) =>
              patchDraft({
                partition: value as ReviewQueueFilters["partition"],
              })
            }
            options={PARTITION_OPTIONS}
          />
          <Field className="gap-1">
            <FieldLabel>Orden</FieldLabel>
            <ToggleGroup
              value={[draft.order]}
              onValueChange={(next) => {
                if (next.length > 0) {
                  patchDraft({ order: next[0] })
                }
              }}
              variant="outline"
              size="sm"
              orientation="vertical"
              aria-label="Orden"
              className="w-full flex-col items-stretch"
            >
              {ORDER_OPTIONS.map((option) => {
                const OptionIcon = option.icon
                return (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="h-11 w-full flex-none justify-start rounded-full text-base"
                  >
                    <OptionIcon />
                    {option.label}
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>
          </Field>
        </SummarySection>

        <SummarySection title="Correo" icon={MailIcon}>
          <FormTextField
            label="Remitente"
            icon={MailIcon}
            autoComplete="off"
            value={draft.sender}
            onChange={(sender) => patchDraft({ sender })}
          />
          <FormTextField
            label="Asunto"
            icon={MailIcon}
            autoComplete="off"
            value={draft.subject}
            onChange={(subject) => patchDraft({ subject })}
          />
        </SummarySection>

        <SummarySection title="Fecha del correo" icon={CalendarDaysIcon}>
          <ReviewDateField
            label="Desde"
            value={draft.dateFrom}
            locale={formatLocale}
            onChange={(day) => changeDate("dateFrom", day)}
          />
          <ReviewDateField
            label="Hasta"
            value={draft.dateTo}
            locale={formatLocale}
            onChange={(day) => changeDate("dateTo", day)}
          />
        </SummarySection>

        <SummarySection title="Clasificación" icon={TagsIcon}>
          <SelectField
            label="Tipo semántico"
            icon={TagsIcon}
            value={draft.semanticType}
            onChange={(value) =>
              patchDraft({
                semanticType: value as ReviewQueueFilters["semanticType"],
              })
            }
            options={SEMANTIC_TYPE_OPTIONS}
          />
          <SelectField
            label="Dominio"
            icon={Layers3Icon}
            value={draft.route}
            onChange={(value) =>
              patchDraft({ route: value as ReviewQueueFilters["route"] })
            }
            options={ROUTE_OPTIONS}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormTextField
              label="Confianza mínima (%)"
              icon={SlidersHorizontalIcon}
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={confidenceMin}
              onChange={setConfidenceMin}
              error={confidenceError ?? undefined}
            />
            <FormTextField
              label="Confianza máxima (%)"
              icon={SlidersHorizontalIcon}
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={confidenceMax}
              onChange={setConfidenceMax}
              error={confidenceError ?? undefined}
            />
          </div>
          <SwitchFieldRow
            label="Solo inciertos"
            description="Muestra correos con baja confianza o sin predicción."
            checked={draft.uncertain}
            onCheckedChange={(uncertain) => patchDraft({ uncertain })}
            icon={CircleHelpIcon}
          />
        </SummarySection>

        <Button type="button" variant="outline" onClick={clearDraft}>
          <EraserIcon data-icon="inline-start" /> Limpiar filtros
        </Button>
      </div>
    </BottomSheet>
  )
}

function ReviewDateField({
  label,
  value,
  locale,
  onChange,
}: {
  label: string
  value: string
  locale: string
  onChange: (day: string) => void
}) {
  return (
    <WheelField
      label={label}
      valueLabel={value ? formatReviewDay(value, locale) : "Sin fecha"}
      icon={CalendarDaysIcon}
      footer={(close) => (
        <div className="mt-3 flex w-full items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={!value}
            onClick={() => {
              onChange("")
              close()
            }}
          >
            <XIcon data-icon="inline-start" /> Sin fecha
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={close}
          >
            <CheckIcon data-icon="inline-start" /> Listo
          </Button>
        </div>
      )}
    >
      <DateWheels
        value={value || todayDay()}
        onChange={onChange}
        maxYear={new Date().getFullYear() + 1}
      />
    </WheelField>
  )
}

function toConfidencePercent(value: number | null): string {
  return value === null ? "" : String(Number((value * 100).toFixed(2)))
}

function parseConfidencePercent(value: string): number | null | undefined {
  if (!value.trim()) {
    return null
  }
  const percent = Number(value)
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    return undefined
  }
  return Number((percent / 100).toFixed(4))
}

/** `YYYY-MM-DD` de hoy en el reloj local, que es el día que elige la rueda. */
function todayDay(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}
