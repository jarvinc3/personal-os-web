"use client"

import { useState } from "react"
import { SETTINGS_REGISTRY } from "@/src/modules/settings"
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldMedia,
  activeRowStyle,
} from "@/src/shared/components/ui/field"
import { Switch } from "@/src/shared/components/ui/switch"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { WheelField } from "@/src/shared/components/forms/wheel-field"
import { DateWheels } from "@/src/shared/components/forms/wheel-picker"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Filtros de revisión"
          description="Combina filtros para acotar los correos de esta pestaña."
        />
        <SheetBody>
          <div className="flex flex-col gap-4">
            <SummarySection title="Cola" icon={InboxIcon}>
              {filters.tab === "reviewed" ? (
                <Field className="flex flex-col gap-1">
                  <FieldLabel
                    htmlFor="review-status-select"
                    className="text-sm text-muted-foreground"
                  >
                    Estado
                  </FieldLabel>
                  <Select
                    value={draft.status}
                    onValueChange={(next) =>
                      patchDraft({
                        status: (next ?? "") as ReviewQueueFilters["status"],
                      })
                    }
                    items={STATUS_OPTIONS}
                    modal={false}
                  >
                    <SelectTrigger
                      id="review-status-select"
                      icon={CheckIcon}
                      className="w-full max-w-full cursor-pointer"
                    >
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} side="bottom">
                      <SelectGroup>
                        <SelectLabel>Estado</SelectLabel>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}
              <Field className="flex flex-col gap-1">
                <FieldLabel
                  htmlFor="review-partition-select"
                  className="text-sm text-muted-foreground"
                >
                  Conjunto
                </FieldLabel>
                <Select
                  value={draft.partition}
                  onValueChange={(next) =>
                    patchDraft({
                      partition: (next ??
                        "") as ReviewQueueFilters["partition"],
                    })
                  }
                  items={PARTITION_OPTIONS}
                  modal={false}
                >
                  <SelectTrigger
                    id="review-partition-select"
                    icon={Layers3Icon}
                    className="w-full max-w-full cursor-pointer"
                  >
                    <SelectValue placeholder="Conjunto" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} side="bottom">
                    <SelectGroup>
                      <SelectLabel>Conjunto</SelectLabel>
                      {PARTITION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
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
              <Field className="gap-0.5">
                <FieldLabel
                  htmlFor="review-sender"
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Remitente
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <MailIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="review-sender"
                    autoComplete="off"
                    value={draft.sender}
                    onChange={(event) =>
                      patchDraft({ sender: event.target.value })
                    }
                  />
                </InputGroup>
              </Field>
              <Field className="gap-0.5">
                <FieldLabel
                  htmlFor="review-subject"
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Asunto
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <MailIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="review-subject"
                    autoComplete="off"
                    value={draft.subject}
                    onChange={(event) =>
                      patchDraft({ subject: event.target.value })
                    }
                  />
                </InputGroup>
              </Field>
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
              <Field className="flex flex-col gap-1">
                <FieldLabel
                  htmlFor="review-semantic-select"
                  className="text-sm text-muted-foreground"
                >
                  Tipo semántico
                </FieldLabel>
                <Select
                  value={draft.semanticType}
                  onValueChange={(next) =>
                    patchDraft({
                      semanticType: (next ??
                        "") as ReviewQueueFilters["semanticType"],
                    })
                  }
                  items={SEMANTIC_TYPE_OPTIONS}
                  modal={false}
                >
                  <SelectTrigger
                    id="review-semantic-select"
                    icon={TagsIcon}
                    className="w-full max-w-full cursor-pointer"
                  >
                    <SelectValue placeholder="Tipo semántico" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} side="bottom">
                    <SelectGroup>
                      <SelectLabel>Tipo semántico</SelectLabel>
                      {SEMANTIC_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field className="flex flex-col gap-1">
                <FieldLabel
                  htmlFor="review-route-select"
                  className="text-sm text-muted-foreground"
                >
                  Dominio
                </FieldLabel>
                <Select
                  value={draft.route}
                  onValueChange={(next) =>
                    patchDraft({
                      route: (next ?? "") as ReviewQueueFilters["route"],
                    })
                  }
                  items={ROUTE_OPTIONS}
                  modal={false}
                >
                  <SelectTrigger
                    id="review-route-select"
                    icon={Layers3Icon}
                    className="w-full max-w-full cursor-pointer"
                  >
                    <SelectValue placeholder="Dominio" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} side="bottom">
                    <SelectGroup>
                      <SelectLabel>Dominio</SelectLabel>
                      {ROUTE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  data-invalid={confidenceError ? true : undefined}
                  className="gap-0.5"
                >
                  <FieldLabel
                    htmlFor="review-confidence-min"
                    className="pl-2 text-sm text-muted-foreground"
                  >
                    Confianza mínima (%)
                  </FieldLabel>
                  <InputGroup className="h-10 overflow-hidden px-1">
                    <InputGroupAddon align="inline-start">
                      <SlidersHorizontalIcon className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="review-confidence-min"
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={confidenceMin}
                      onChange={(event) => setConfidenceMin(event.target.value)}
                      aria-invalid={confidenceError ? true : undefined}
                    />
                  </InputGroup>
                  {confidenceError ? (
                    <FieldError>{confidenceError}</FieldError>
                  ) : null}
                </Field>
                <Field
                  data-invalid={confidenceError ? true : undefined}
                  className="gap-0.5"
                >
                  <FieldLabel
                    htmlFor="review-confidence-max"
                    className="pl-2 text-sm text-muted-foreground"
                  >
                    Confianza máxima (%)
                  </FieldLabel>
                  <InputGroup className="h-10 overflow-hidden px-1">
                    <InputGroupAddon align="inline-start">
                      <SlidersHorizontalIcon className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="review-confidence-max"
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={confidenceMax}
                      onChange={(event) => setConfidenceMax(event.target.value)}
                      aria-invalid={confidenceError ? true : undefined}
                    />
                  </InputGroup>
                  {confidenceError ? (
                    <FieldError>{confidenceError}</FieldError>
                  ) : null}
                </Field>
              </div>
              <Field
                variant="card"
                orientation="horizontal"
                style={activeRowStyle(
                  SETTINGS_REGISTRY.ai.accent,
                  draft.uncertain
                )}
              >
                <FieldMedia icon={CircleHelpIcon} />
                <FieldContent>
                  <FieldLabel htmlFor="review-uncertain">
                    Solo inciertos
                  </FieldLabel>
                  <FieldDescription className="text-xs">
                    Muestra correos con baja confianza o sin predicción.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="review-uncertain"
                  checked={draft.uncertain}
                  onCheckedChange={(uncertain) => patchDraft({ uncertain })}
                />
              </Field>
            </SummarySection>

            <Button type="button" variant="outline" onClick={clearDraft}>
              <EraserIcon data-icon="inline-start" /> Limpiar filtros
            </Button>
          </div>
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon data-icon="inline-start" /> Cancelar
          </Button>
          <Button type="button" className="flex-1" onClick={applyDraft}>
            <CheckIcon data-icon="inline-start" /> Aplicar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
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
