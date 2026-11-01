"use client"

import { useState } from "react"
import {
  ArrowDownWideNarrowIcon,
  ArrowUpNarrowWideIcon,
  CalendarDaysIcon,
  CheckIcon,
  EraserIcon,
  MailIcon,
  XIcon,
} from "lucide-react"

import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { WheelField } from "@/src/shared/components/forms/wheel-field"
import { DateWheels } from "@/src/shared/components/forms/wheel-picker"
import { Button } from "@/src/shared/components/ui/button"
import {
  formatReviewDay,
  reviewQueueDatePatch,
  REVIEW_QUEUE_ORDER_FILTERS,
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
]

type ReviewFiltersSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ReviewQueueFilters
  onApply: (patch: Partial<ReviewQueueFilters>) => void
}

/**
 * Filtros secundarios de la cola: remitente, rango de días y orden. Se editan
 * en un borrador y se aplican juntos al cerrar la hoja, para no cambiar la
 * lista ni la URL con cada tecla.
 */
export function ReviewFiltersSheet({
  open,
  onOpenChange,
  filters,
  onApply,
}: ReviewFiltersSheetProps) {
  return (
    <ReviewFiltersSheetForm
      key={open ? "open" : "closed"}
      open={open}
      onOpenChange={onOpenChange}
      filters={filters}
      onApply={onApply}
    />
  )
}

function ReviewFiltersSheetForm({
  open,
  onOpenChange,
  filters,
  onApply,
}: ReviewFiltersSheetProps) {
  const formatLocale = useFormatLocale()
  const [sender, setSender] = useState(filters.sender)
  const [dateFrom, setDateFrom] = useState(filters.dateFrom)
  const [dateTo, setDateTo] = useState(filters.dateTo)
  const [order, setOrder] = useState(filters.order)

  function changeDate(field: "dateFrom" | "dateTo", day: string) {
    const patch = reviewQueueDatePatch(field, day, {
      ...filters,
      dateFrom,
      dateTo,
    })
    setDateFrom(patch.dateFrom ?? dateFrom)
    setDateTo(patch.dateTo ?? dateTo)
  }

  function clearDraft() {
    setSender("")
    setDateFrom("")
    setDateTo("")
    setOrder(REVIEW_QUEUE_ORDER_FILTERS[0])
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filtros de revisión"
      description="Se aplican a la cola de la pestaña actual."
      actions={{
        submit: (
          <Button
            type="button"
            onClick={() => onApply({ sender, dateFrom, dateTo, order })}
          >
            <CheckIcon data-icon="inline-start" /> Aplicar
          </Button>
        ),
      }}
    >
      <FormTextField
        label="Remitente"
        icon={MailIcon}
        placeholder="notificaciones@banco.com"
        autoComplete="off"
        value={sender}
        onChange={setSender}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            onApply({ sender, dateFrom, dateTo, order })
          }
        }}
      />

      <ReviewDateField
        label="Desde"
        value={dateFrom}
        locale={formatLocale}
        onChange={(day) => changeDate("dateFrom", day)}
      />
      <ReviewDateField
        label="Hasta"
        value={dateTo}
        locale={formatLocale}
        onChange={(day) => changeDate("dateTo", day)}
      />

      <SegmentedControl
        label="Orden"
        value={order}
        onChange={setOrder}
        options={ORDER_OPTIONS}
        fullWidth
      />

      <Button type="button" variant="outline" onClick={clearDraft}>
        <EraserIcon data-icon="inline-start" /> Limpiar filtros
      </Button>
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

/** `YYYY-MM-DD` de hoy en el reloj local, que es el día que elige la rueda. */
function todayDay(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}
