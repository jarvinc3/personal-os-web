"use client"

import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui"
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import type { FinanceModuleConfig } from "@/src/modules/settings/types/module-config.types"
import {
  OptionRow,
  SwitchFieldRow,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { SummarySection, SummaryItem } from "@/src/shared/components/ui/summary"
import {
  DurationWheels,
  TimePairWheels,
} from "@/src/shared/components/ui/wheel-picker"
import { getModule } from "@/src/shared/constants/module-registry"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { appToast } from "@/src/shared/lib/app-toast"
import { formatTimeForDisplay } from "@/src/shared/lib/date-format"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { cn } from "@/src/shared/lib/utils"
import {
  durationMinutesToHm,
  hmToDurationMinutes,
} from "@/src/shared/types/wheels.type"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  BarChart3,
  CalendarClock,
  CalendarCog,
  CalendarDays,
  ChartBarIcon,
  CheckIcon,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  FileBarChart,
  Mail,
  PencilIcon,
  PlusIcon,
  Receipt,
  RefreshCw,
  ScanEyeIcon,
  Shrink,
  Sparkles,
  Tags,
  Timer,
  Trash2Icon,
  TriangleAlert,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

const scheduleTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/

const EMAIL_SYNC_SCHEDULE_MODES = {
  INTERVAL: "interval",
  TIMES: "times",
} as const

const DEFAULT_EMAIL_SYNC_TIMES = ["08:00", "18:00"]
const MAX_EMAIL_SYNC_TIMES = 8
const MIN_EMAIL_SYNC_INTERVAL_MINUTES = 15
const DEFAULT_EMAIL_SYNC_INTERVAL_MINUTES = 360

function formatSyncIntervalLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const leftover = minutes % 60
  if (leftover === 0) return `${hours} h`
  return `${hours} h ${leftover} min`
}

function parseSyncIntervalMinutes(value: string): number {
  const minutes = Number(value)
  if (!Number.isInteger(minutes) || minutes < MIN_EMAIL_SYNC_INTERVAL_MINUTES) {
    return DEFAULT_EMAIL_SYNC_INTERVAL_MINUTES
  }
  return minutes
}

function nextEmailSyncTime(existing: string[]): string {
  const taken = new Set(existing)
  const last = existing.at(-1) ?? DEFAULT_EMAIL_SYNC_TIMES[0]
  const [hoursText, minutesText = "00"] = last.split(":")
  let hour = Number(hoursText)
  for (let step = 0; step < 24; step += 1) {
    hour = (hour + 1) % 24
    const candidate = `${String(hour).padStart(2, "0")}:${minutesText}`
    if (!taken.has(candidate)) return candidate
  }
  return DEFAULT_EMAIL_SYNC_TIMES[0]
}

function emailSyncTimesFromConfig(config: FinanceModuleConfig): string[] {
  if (
    config.emailSync.schedule.mode === "times" &&
    config.emailSync.schedule.times.length > 0
  ) {
    return config.emailSync.schedule.times
  }
  return [...DEFAULT_EMAIL_SYNC_TIMES]
}

function EmailSyncTimesField({
  times,
  onChange,
  error,
  disabled = false,
}: {
  times: string[]
  onChange: (times: string[]) => void
  error?: string
  disabled?: boolean
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  return (
    <Field
      data-invalid={error ? true : undefined}
      className="flex flex-col gap-3"
    >
      <FieldLabel className="text-sm text-muted-foreground">
        Horas del día
      </FieldLabel>
      {times.map((time, index) => {
        const isEditing = editingIndex === index
        return (
          <div
            key={index}
            className={cn(
              "flex flex-col rounded-xl border bg-card p-2",
              isEditing ? "border-primary" : "border-border"
            )}
          >
            <div className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 text-sm font-medium tabular-nums">
                {formatTimeForDisplay(time)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={
                  isEditing
                    ? `Cerrar hora ${index + 1}`
                    : `Editar hora ${index + 1}`
                }
                aria-pressed={isEditing}
                disabled={disabled}
                onClick={() => setEditingIndex(isEditing ? null : index)}
              >
                {isEditing ? <CheckIcon /> : <PencilIcon />}
              </Button>
              {times.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Quitar hora ${index + 1}`}
                  disabled={disabled}
                  onClick={() => {
                    onChange(
                      times.filter((_, itemIndex) => itemIndex !== index)
                    )
                    setEditingIndex((current) => {
                      if (current === null) return null
                      if (current === index) return null
                      if (current > index) return current - 1
                      return current
                    })
                  }}
                >
                  <Trash2Icon />
                </Button>
              ) : null}
            </div>
            {isEditing ? (
              <div className="pt-2">
                <TimePairWheels
                  value={time}
                  onChange={(next) => {
                    const nextTimes = [...times]
                    nextTimes[index] = next
                    onChange(nextTimes)
                  }}
                  disabled={disabled}
                />
              </div>
            ) : null}
          </div>
        )
      })}
      {times.length < MAX_EMAIL_SYNC_TIMES ? (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => {
            const nextTimes = [...times, nextEmailSyncTime(times)]
            onChange(nextTimes)
            setEditingIndex(nextTimes.length - 1)
          }}
        >
          <PlusIcon data-icon="inline-start" />
          Agregar hora
        </Button>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}

function EmailSyncIntervalField({
  value,
  onChange,
  error,
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const minutes = parseSyncIntervalMinutes(value)

  return (
    <Field
      data-invalid={error ? true : undefined}
      className="flex flex-col gap-3"
    >
      <FieldLabel className="text-sm text-muted-foreground">
        Tiempo entre revisiones
      </FieldLabel>
      <div
        className={cn(
          "flex flex-col rounded-xl border bg-card p-2",
          editing ? "border-primary" : "border-border"
        )}
      >
        <div className="flex items-center gap-2">
          <Timer className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 text-sm font-medium tabular-nums">
            {formatSyncIntervalLabel(minutes)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={editing ? "Cerrar intervalo" : "Editar intervalo"}
            aria-pressed={editing}
            disabled={disabled}
            onClick={() => setEditing((current) => !current)}
          >
            {editing ? <CheckIcon /> : <PencilIcon />}
          </Button>
        </div>
        {editing ? (
          <div className="pt-2">
            <DurationWheels
              value={durationMinutesToHm(minutes)}
              minuteStep={5}
              disabled={disabled}
              onChange={(next) => {
                const nextMinutes = Math.max(
                  MIN_EMAIL_SYNC_INTERVAL_MINUTES,
                  hmToDurationMinutes(next)
                )
                onChange(String(nextMinutes))
              }}
            />
          </div>
        ) : null}
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}

const schema = z
  .object({
    weekStartsOn: z.enum(["0", "1"]),
    dashboardPeriod: z.enum(["week", "month", "year"]),
    showCents: z.boolean(),
    compactNumbers: z.boolean(),
    emailSyncEnabled: z.boolean(),
    emailSyncAutomatic: z.boolean(),
    emailSyncScheduleMode: z.enum([
      EMAIL_SYNC_SCHEDULE_MODES.INTERVAL,
      EMAIL_SYNC_SCHEDULE_MODES.TIMES,
    ]),
    emailSyncEveryMinutes: z.string(),
    emailSyncTimes: z.array(z.string()),
    autoCategorize: z.boolean(),
    budgetAlerts: z.boolean(),
    aiSuggestions: z.boolean(),
    transactionDetected: z.boolean(),
    monthlyReport: z.boolean(),
    cardDueDate: z.boolean(),
    unusualExpense: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.emailSyncScheduleMode === EMAIL_SYNC_SCHEDULE_MODES.INTERVAL) {
      const minutes = Number(values.emailSyncEveryMinutes)
      if (
        !Number.isInteger(minutes) ||
        minutes < MIN_EMAIL_SYNC_INTERVAL_MINUTES
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["emailSyncEveryMinutes"],
          message: "Mínimo 15 minutos",
        })
      }
      return
    }
    const times = values.emailSyncTimes
      .map((time) => time.trim())
      .filter(Boolean)
    if (times.length === 0 || times.length > MAX_EMAIL_SYNC_TIMES) {
      ctx.addIssue({
        code: "custom",
        path: ["emailSyncTimes"],
        message: "Pon de 1 a 8 horas",
      })
      return
    }
    if (times.some((time) => !scheduleTimePattern.test(time))) {
      ctx.addIssue({
        code: "custom",
        path: ["emailSyncTimes"],
        message: "Hora no válida",
      })
      return
    }
    if (new Set(times).size !== times.length) {
      ctx.addIssue({
        code: "custom",
        path: ["emailSyncTimes"],
        message: "No repitas horas",
      })
    }
  })

type FormValues = z.infer<typeof schema>
const MODULE_ACCENT = getModule("finance").accent

const FINANCE_NOTIFICATION_ROWS = [
  { key: "budgetAlerts", label: "Alertas de presupuesto", icon: Wallet },
  { key: "aiSuggestions", label: "Sugerencias de IA", icon: Sparkles },
  {
    key: "transactionDetected",
    label: "Transacciones detectadas",
    icon: Receipt,
  },
  { key: "monthlyReport", label: "Reporte mensual", icon: FileBarChart },
  { key: "cardDueDate", label: "Vencimiento de tarjetas", icon: CreditCard },
  { key: "unusualExpense", label: "Gastos inusuales", icon: TriangleAlert },
] as const satisfies readonly {
  key: keyof FinanceModuleConfig["notifications"]
  label: string
  icon: LucideIcon
}[]

const WEEK_OPTIONS = [
  { value: "1", label: "Lunes", description: "Semana laboral estándar." },
  { value: "0", label: "Domingo", description: "Semana tipo calendario US." },
] as const

const PERIOD_OPTIONS: {
  value: FinanceModuleConfig["dashboardPeriod"]
  label: string
  description: string
}[] = [
  { value: "week", label: "Semana", description: "Vista agregada por semana." },
  { value: "month", label: "Mes", description: "Vista agregada por mes." },
  { value: "year", label: "Año", description: "Vista agregada por año." },
]

function configToFormValues(config: FinanceModuleConfig): FormValues {
  return {
    weekStartsOn: String(config.weekStartsOn) as "0" | "1",
    dashboardPeriod: config.dashboardPeriod,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    emailSyncEnabled: config.emailSync.enabled,
    emailSyncAutomatic: config.emailSync.automatic,
    emailSyncScheduleMode: config.emailSync.schedule.mode,
    emailSyncEveryMinutes:
      config.emailSync.schedule.mode === "interval"
        ? String(config.emailSync.schedule.everyMinutes)
        : "360",
    emailSyncTimes: emailSyncTimesFromConfig(config),
    autoCategorize: config.emailSync.autoCategorize,
    budgetAlerts: config.notifications.budgetAlerts,
    aiSuggestions: config.notifications.aiSuggestions,
    transactionDetected: config.notifications.transactionDetected,
    monthlyReport: config.notifications.monthlyReport,
    cardDueDate: config.notifications.cardDueDate,
    unusualExpense: config.notifications.unusualExpense,
  }
}

export function FinanceModuleSettingsForm({ onDone }: { onDone: () => void }) {
  const { config, updateConfig, updateMutation } =
    useUserModuleConfig("finance")
  const moduleEnable = useModuleSheetEnable("finance")

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: configToFormValues(config),
  })

  const weekStartsOn = useWatch({ control, name: "weekStartsOn" })
  const dashboardPeriod = useWatch({ control, name: "dashboardPeriod" })
  const emailSyncEnabledWatch = useWatch({
    control,
    name: "emailSyncEnabled",
  })
  const emailSyncScheduleMode = useWatch({
    control,
    name: "emailSyncScheduleMode",
  })
  const formValues = useMemo(() => configToFormValues(config), [config])
  useProfileSheetFormSync(true, reset, formValues)

  useEffect(() => {
    moduleEnable.syncPendingOnSheetOpen()
  }, [moduleEnable.syncPendingOnSheetOpen])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    await updateConfig(
      {
        weekStartsOn: Number(values.weekStartsOn) as 0 | 1,
        dashboardPeriod: values.dashboardPeriod,
        display: {
          showCents: values.showCents,
          compactNumbers: values.compactNumbers,
        },
        emailSync: {
          enabled: values.emailSyncEnabled,
          automatic: values.emailSyncAutomatic,
          autoCategorize: values.autoCategorize,
          schedule:
            values.emailSyncScheduleMode === EMAIL_SYNC_SCHEDULE_MODES.INTERVAL
              ? {
                  mode: EMAIL_SYNC_SCHEDULE_MODES.INTERVAL,
                  everyMinutes: Number(values.emailSyncEveryMinutes),
                }
              : {
                  mode: EMAIL_SYNC_SCHEDULE_MODES.TIMES,
                  times: values.emailSyncTimes
                    .map((time) => time.trim())
                    .filter(Boolean),
                },
        },
        notifications: {
          budgetAlerts: values.budgetAlerts,
          aiSuggestions: values.aiSuggestions,
          transactionDetected: values.transactionDetected,
          monthlyReport: values.monthlyReport,
          cardDueDate: values.cardDueDate,
          unusualExpense: values.unusualExpense,
        },
      },
      { isEnabled: moduleEnable.pendingEnabled }
    )
    appToast.success({
      text1: "Finanzas actualizadas",
      text2: "La configuración del módulo se guardó.",
    })
    onDone()
  })

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <ModuleSheetEnableRow
        state={moduleEnable.state}
        isEnabled={moduleEnable.sheetEnabled}
        onEnabledChange={moduleEnable.handleEnabledChange}
        disabled={updateMutation.isPending}
      />
      <SummarySection title="Moneda" icon={DollarSign}>
        <SummaryItem
          href={APP_ROUTES.app.settingsFinanceCurrencies}
          icon={DollarSign}
          accentColor={MODULE_ACCENT}
          title="Moneda principal"
          description="Monedas y tasas del ledger."
          value={config.baseCurrency}
          showChevron
          isLast
        />
      </SummarySection>

      <SummarySection title="Inicio de semana" icon={CalendarCog}>
        <RadioGroup
          value={weekStartsOn}
          onValueChange={(v) =>
            setValue("weekStartsOn", v as "0" | "1", { shouldDirty: true })
          }
        >
          {WEEK_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              icon={CalendarDays}
              iconColor={MODULE_ACCENT}
              label={option.label}
              description={option.description}
              selected={weekStartsOn === option.value}
              onPress={() =>
                setValue("weekStartsOn", option.value, { shouldDirty: true })
              }
              trailing={<RadioGroupItem value={option.value} />}
            />
          ))}
        </RadioGroup>
      </SummarySection>

      <SummarySection title="Período del panel" icon={ChartBarIcon}>
        <RadioGroup
          value={dashboardPeriod}
          onValueChange={(v) =>
            setValue(
              "dashboardPeriod",
              v as FinanceModuleConfig["dashboardPeriod"],
              {
                shouldDirty: true,
              }
            )
          }
        >
          {PERIOD_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              icon={BarChart3}
              iconColor={MODULE_ACCENT}
              label={option.label}
              description={option.description}
              selected={dashboardPeriod === option.value}
              onPress={() =>
                setValue("dashboardPeriod", option.value, { shouldDirty: true })
              }
              trailing={<RadioGroupItem value={option.value} />}
            />
          ))}
        </RadioGroup>
      </SummarySection>

      <SummarySection title="Visualización" icon={ScanEyeIcon}>
        <Controller
          control={control}
          name="showCents"
          render={({ field }) => (
            <SwitchFieldRow
              icon={Coins}
              iconColor={MODULE_ACCENT}
              label="Mostrar centavos"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="compactNumbers"
          render={({ field }) => (
            <SwitchFieldRow
              icon={Shrink}
              iconColor={MODULE_ACCENT}
              label="Números compactos"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Sincronización de email" icon={Mail}>
        <Controller
          control={control}
          name="emailSyncEnabled"
          render={({ field }) => (
            <SwitchFieldRow
              icon={Mail}
              iconColor={MODULE_ACCENT}
              label="Activar sync"
              description="Permite conectar Gmail y sincronizar."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="emailSyncAutomatic"
          render={({ field }) => (
            <SwitchFieldRow
              icon={RefreshCw}
              iconColor={MODULE_ACCENT}
              label="Sync automático"
              description="Se leen correos cada cierto tiempo."
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={!emailSyncEnabledWatch}
            />
          )}
        />
        <Controller
          control={control}
          name="autoCategorize"
          render={({ field }) => (
            <SwitchFieldRow
              icon={Tags}
              iconColor={MODULE_ACCENT}
              label="Auto-categorizar"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Horarios de sincronización" icon={Clock}>
        <Controller
          control={control}
          name="emailSyncScheduleMode"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={(value) =>
                setValue(
                  "emailSyncScheduleMode",
                  value as "interval" | "times",
                  { shouldDirty: true }
                )
              }
            >
              <OptionRow
                icon={Clock}
                iconColor={MODULE_ACCENT}
                label="Cada cierto tiempo"
                description="Se configura un periodo de tiempo."
                selected={field.value === EMAIL_SYNC_SCHEDULE_MODES.INTERVAL}
                onPress={() =>
                  setValue(
                    "emailSyncScheduleMode",
                    EMAIL_SYNC_SCHEDULE_MODES.INTERVAL,
                    {
                      shouldDirty: true,
                    }
                  )
                }
                trailing={
                  <RadioGroupItem value={EMAIL_SYNC_SCHEDULE_MODES.INTERVAL} />
                }
              />
              <OptionRow
                icon={CalendarClock}
                iconColor={MODULE_ACCENT}
                label="A horas fijas del día"
                description="Se configuran varias horas en el día."
                selected={field.value === EMAIL_SYNC_SCHEDULE_MODES.TIMES}
                onPress={() =>
                  setValue(
                    "emailSyncScheduleMode",
                    EMAIL_SYNC_SCHEDULE_MODES.TIMES,
                    {
                      shouldDirty: true,
                    }
                  )
                }
                trailing={
                  <RadioGroupItem value={EMAIL_SYNC_SCHEDULE_MODES.TIMES} />
                }
              />
            </RadioGroup>
          )}
        />
        {emailSyncScheduleMode === EMAIL_SYNC_SCHEDULE_MODES.INTERVAL ? (
          <Controller
            control={control}
            name="emailSyncEveryMinutes"
            render={({ field, fieldState }) => (
              <EmailSyncIntervalField
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                disabled={updateMutation.isPending}
              />
            )}
          />
        ) : (
          <Controller
            control={control}
            name="emailSyncTimes"
            render={({ field, fieldState }) => (
              <EmailSyncTimesField
                times={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                disabled={updateMutation.isPending}
              />
            )}
          />
        )}
      </SummarySection>

      <SummarySection title="Alertas del módulo" icon={Tags}>
        {FINANCE_NOTIFICATION_ROWS.map((row) => (
          <Controller
            key={row.key}
            control={control}
            name={row.key}
            render={({ field }) => (
              <SwitchFieldRow
                icon={row.icon}
                iconColor={MODULE_ACCENT}
                label={row.label}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        ))}
      </SummarySection>

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={
          !(isDirty || moduleEnable.isEnabledDirty) || updateMutation.isPending
        }
      >
        {updateMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
        {updateMutation.isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  )
}
