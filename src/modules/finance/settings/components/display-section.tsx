import { SwitchFieldRow } from "@/src/shared/components/layout/form-blocks"
import { ChoiceGrid } from "@/src/shared/components/ui/choice-grid"
import {
  SummaryGroup,
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { getModule } from "@/src/shared/constants/module-registry"
import type { FinanceModuleConfig } from "@/src/modules/settings/types/module-config.types"
import {
  Calendar,
  CalendarCog,
  CalendarDays,
  CalendarRange,
  ChartBarIcon,
  Coins,
  DollarSign,
  ScanEyeIcon,
  Shrink,
  Sun,
  type LucideIcon,
} from "lucide-react"
import { Controller, type Control } from "react-hook-form"
import type { FinanceModuleFormValues } from "@/src/modules/finance/settings/lib/finance-module-form"

const MODULE_ACCENT = getModule("finance").accent

const WEEK_OPTIONS = [
  { value: "1", label: "Lunes", icon: CalendarDays },
  { value: "0", label: "Domingo", icon: Sun },
] as const

const PERIOD_OPTIONS = [
  { value: "week", label: "Semana", icon: CalendarDays },
  { value: "month", label: "Mes", icon: CalendarRange },
  { value: "year", label: "Año", icon: Calendar },
] as const satisfies readonly {
  value: FinanceModuleConfig["dashboardPeriod"]
  label: string
  icon: LucideIcon
}[]

type DisplaySectionProps = {
  control: Control<FinanceModuleFormValues>
  baseCurrency: string
}

export function DisplaySection({ control, baseCurrency }: DisplaySectionProps) {
  return (
    <>
      <SummarySection title="Moneda" icon={DollarSign}>
        <SummaryItem
          href={APP_ROUTES.app.settingsFinanceCurrencies}
          icon={DollarSign}
          accentColor={MODULE_ACCENT}
          title="Moneda principal"
          description="Monedas y tasas del ledger."
          value={baseCurrency}
          showChevron
          isLast
        />
      </SummarySection>

      <SummarySection title="Inicio de semana" icon={CalendarCog}>
        <SummaryGroup title="Primer día de la semana">
          <Controller
            control={control}
            name="weekStartsOn"
            render={({ field }) => (
              <ChoiceGrid
                ariaLabel="Primer día de la semana"
                accentColor={MODULE_ACCENT}
                value={field.value}
                onValueChange={field.onChange}
                options={WEEK_OPTIONS}
              />
            )}
          />
        </SummaryGroup>
      </SummarySection>

      <SummarySection title="Período del panel" icon={ChartBarIcon}>
        <SummaryGroup title="Vista por defecto">
          <Controller
            control={control}
            name="dashboardPeriod"
            render={({ field }) => (
              <ChoiceGrid
                ariaLabel="Vista por defecto"
                accentColor={MODULE_ACCENT}
                value={field.value}
                onValueChange={field.onChange}
                options={PERIOD_OPTIONS}
              />
            )}
          />
        </SummaryGroup>
      </SummarySection>

      <SummarySection title="Visualización" icon={ScanEyeIcon}>
        <SummaryGroup title="Formato de las cantidades">
          <Controller
            control={control}
            name="showCents"
            render={({ field }) => (
              <SwitchFieldRow
                icon={Coins}
                iconColor={MODULE_ACCENT}
                accentColor={MODULE_ACCENT}
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
                accentColor={MODULE_ACCENT}
                label="Números compactos"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </SummaryGroup>
      </SummarySection>
    </>
  )
}
