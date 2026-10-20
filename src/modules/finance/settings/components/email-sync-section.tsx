import {
  OptionRow,
  SwitchFieldRow,
} from "@/src/shared/components/layout/form-blocks"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import {
  SummaryGroup,
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { getModule } from "@/src/shared/constants/module-registry"
import { CalendarClock, Clock, Mail, RefreshCw, Tags } from "lucide-react"
import { Controller, useWatch, type Control } from "react-hook-form"
import { EmailSyncScheduleFields } from "@/src/modules/finance/settings/email-sync-schedule-fields"
import {
  EMAIL_SYNC_SCHEDULE_MODES,
  type FinanceModuleFormValues,
} from "@/src/modules/finance/settings/lib/finance-module-form"

const MODULE_ACCENT = getModule("finance").accent

type EmailSyncSectionProps = {
  control: Control<FinanceModuleFormValues>
  isSubmitting: boolean
}

export function EmailSyncSection({
  control,
  isSubmitting,
}: EmailSyncSectionProps) {
  const emailSyncEnabled = useWatch({ control, name: "emailSyncEnabled" })
  const emailSyncAutomatic = useWatch({
    control,
    name: "emailSyncAutomatic",
  })

  return (
    <>
      <SummarySection title="Sincronización de correo" icon={Mail}>
        <Controller
          control={control}
          name="emailSyncEnabled"
          render={({ field }) => (
            <SwitchFieldRow
              icon={Mail}
              iconColor={MODULE_ACCENT}
              accentColor={MODULE_ACCENT}
              label="Sincronizar correo"
              description="Conecta Gmail y trae los movimientos del banco."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        {emailSyncEnabled ? (
          <>
            <SummaryGroup title="Sincronización automática">
              <Controller
                control={control}
                name="emailSyncAutomatic"
                render={({ field }) => (
                  <SwitchFieldRow
                    icon={RefreshCw}
                    iconColor={MODULE_ACCENT}
                    accentColor={MODULE_ACCENT}
                    label="Sincronizar automáticamente"
                    description="Busca correos nuevos cada cierto tiempo."
                    checked={field.value}
                    onCheckedChange={field.onChange}
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
                    accentColor={MODULE_ACCENT}
                    label="Asignar categoría automáticamente"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </SummaryGroup>
            <SummaryGroup title="Cómo entran los movimientos">
              <Controller
                control={control}
                name="emailSyncMode"
                render={({ field }) => (
                  <RadioGroup
                    aria-label="Cómo entran los movimientos"
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as "DIRECT" | "PENDING")
                    }
                  >
                    <OptionRow
                      icon={Mail}
                      iconColor={MODULE_ACCENT}
                      accentColor={MODULE_ACCENT}
                      label="Entran confirmados"
                      description="Se registran directo en el saldo."
                      selected={field.value === "DIRECT"}
                      onPress={() => field.onChange("DIRECT")}
                      trailing={<RadioGroupItem value="DIRECT" />}
                    />
                    <OptionRow
                      icon={Mail}
                      iconColor={MODULE_ACCENT}
                      accentColor={MODULE_ACCENT}
                      label="Entran pendientes"
                      description="Los revisas y confirmas después."
                      selected={field.value === "PENDING"}
                      onPress={() => field.onChange("PENDING")}
                      trailing={<RadioGroupItem value="PENDING" />}
                    />
                  </RadioGroup>
                )}
              />
            </SummaryGroup>
            <SummaryItem
              href={APP_ROUTES.app.financeSync}
              icon={Mail}
              accentColor={MODULE_ACCENT}
              title="Bancos y remitentes"
              description="Elige qué correos leer."
              showChevron
              isLast
            />
          </>
        ) : null}
      </SummarySection>

      {emailSyncEnabled && emailSyncAutomatic ? (
        <SummarySection title="Horarios de sincronización" icon={Clock}>
          <SummaryGroup title="Modo de horario">
            <Controller
              control={control}
              name="emailSyncScheduleMode"
              render={({ field }) => (
                <RadioGroup
                  aria-label="Modo de horario"
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as "interval" | "times")
                  }
                >
                  <OptionRow
                    icon={Clock}
                    iconColor={MODULE_ACCENT}
                    accentColor={MODULE_ACCENT}
                    label="Cada cierto tiempo"
                    description="Se configura un periodo de tiempo."
                    selected={
                      field.value === EMAIL_SYNC_SCHEDULE_MODES.INTERVAL
                    }
                    onPress={() =>
                      field.onChange(EMAIL_SYNC_SCHEDULE_MODES.INTERVAL)
                    }
                    trailing={
                      <RadioGroupItem
                        value={EMAIL_SYNC_SCHEDULE_MODES.INTERVAL}
                      />
                    }
                  />
                  <OptionRow
                    icon={CalendarClock}
                    iconColor={MODULE_ACCENT}
                    accentColor={MODULE_ACCENT}
                    label="A horas fijas del día"
                    description="Se configuran varias horas en el día."
                    selected={field.value === EMAIL_SYNC_SCHEDULE_MODES.TIMES}
                    onPress={() =>
                      field.onChange(EMAIL_SYNC_SCHEDULE_MODES.TIMES)
                    }
                    trailing={
                      <RadioGroupItem value={EMAIL_SYNC_SCHEDULE_MODES.TIMES} />
                    }
                  />
                </RadioGroup>
              )}
            />
            <EmailSyncScheduleFields
              control={control}
              disabled={isSubmitting}
            />
          </SummaryGroup>
        </SummarySection>
      ) : null}
    </>
  )
}
