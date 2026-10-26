import { SwitchFieldRow } from "@/src/shared/components/forms/switch-field-row"
import { ChoiceGrid } from "@/src/shared/components/forms/choice-grid"
import { DayWheel } from "@/src/shared/components/forms/wheel-picker"
import {
  SummaryGroup,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import type { FinanceModuleConfig } from "@/src/modules/settings/types/module-config.types"
import {
  BellRing,
  CalendarDays,
  Coins,
  CreditCard,
  FileBarChart,
  Receipt,
  Repeat,
  Sparkles,
  Tags,
  TriangleAlert,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { Controller, useWatch, type Control } from "react-hook-form"
import type { FinanceModuleFormValues } from "@/src/modules/finance/settings/lib/finance-module-form"

const MODULE_ACCENT = getModule("finance").accent

const NOTIFICATION_GROUPS = [
  {
    title: "Movimientos",
    rows: [
      {
        key: "transactionDetected",
        label: "Transacciones detectadas",
        icon: Receipt,
      },
      { key: "unusualExpense", label: "Gastos inusuales", icon: TriangleAlert },
      { key: "budgetAlerts", label: "Alertas de presupuesto", icon: Wallet },
    ],
  },
  {
    title: "Reportes",
    rows: [
      { key: "monthlyReport", label: "Reporte mensual", icon: FileBarChart },
      { key: "weeklySummary", label: "Resumen semanal", icon: CalendarDays },
    ],
  },
  {
    title: "Tarjetas",
    rows: [
      {
        key: "cardDueDate",
        label: "Vencimiento de tarjetas",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Cobros y suscripciones",
    rows: [
      { key: "recurringAlerts", label: "Cobros recurrentes", icon: Repeat },
      {
        key: "subscriptionReminders",
        label: "Renovación de suscripciones",
        icon: Repeat,
      },
      {
        key: "priceIncreaseAlerts",
        label: "Subidas de precio",
        icon: TriangleAlert,
      },
    ],
  },
  {
    title: "IA y saldos",
    rows: [
      { key: "aiSuggestions", label: "Sugerencias de IA", icon: Sparkles },
      { key: "balanceIntegrity", label: "Saldos descuadrados", icon: Coins },
    ],
  },
] as const satisfies readonly {
  title: string
  rows: readonly {
    key: keyof FinanceModuleConfig["notifications"]
    label: string
    icon: LucideIcon
  }[]
}[]

const WEEKDAY_OPTIONS = [
  { value: "1", label: "Lunes", short: "Lun" },
  { value: "2", label: "Martes", short: "Mar" },
  { value: "3", label: "Miércoles", short: "Mié" },
  { value: "4", label: "Jueves", short: "Jue" },
  { value: "5", label: "Viernes", short: "Vie" },
  { value: "6", label: "Sábado", short: "Sáb" },
  { value: "0", label: "Domingo", short: "Dom" },
] as const

const WEEKDAY_CHOICES = WEEKDAY_OPTIONS.map((option) => ({
  value: option.value,
  label: option.short,
  icon: CalendarDays,
}))

function WeeklySummaryDayField({
  control,
}: {
  control: Control<FinanceModuleFormValues>
}) {
  return (
    <Controller
      control={control}
      name="weeklySummaryDay"
      render={({ field }) => (
        <ChoiceGrid
          ariaLabel="Día del resumen semanal"
          accentColor={MODULE_ACCENT}
          columns={7}
          value={field.value}
          onValueChange={field.onChange}
          options={WEEKDAY_CHOICES}
        />
      )}
    />
  )
}

export function NotificationsSection({
  control,
}: {
  control: Control<FinanceModuleFormValues>
}) {
  const weeklySummary = useWatch({ control, name: "weeklySummary" })
  const cardDueDate = useWatch({ control, name: "cardDueDate" })

  return (
    <SummarySection title="Alertas de la app" icon={Tags}>
      {NOTIFICATION_GROUPS.map((group) => (
        <SummaryGroup key={group.title} title={group.title}>
          {group.rows.map((row) => (
            <Controller
              key={row.key}
              control={control}
              name={row.key}
              render={({ field }) => (
                <SwitchFieldRow
                  icon={row.icon}
                  iconColor={MODULE_ACCENT}
                  accentColor={MODULE_ACCENT}
                  label={row.label}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          ))}
          {group.title === "Reportes" && weeklySummary ? (
            <SummaryGroup title="Día del resumen semanal">
              <WeeklySummaryDayField control={control} />
            </SummaryGroup>
          ) : null}
          {group.title === "Tarjetas" && cardDueDate ? (
            <Controller
              control={control}
              name="cardDueDaysBefore"
              render={({ field, fieldState }) => (
                <DayWheel
                  label="Días antes del vencimiento"
                  icon={BellRing}
                  value={field.value}
                  min={0}
                  max={30}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          ) : null}
        </SummaryGroup>
      ))}
    </SummarySection>
  )
}
