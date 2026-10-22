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
  type LucideIcon,
} from "lucide-react"
import { Controller, type Control } from "react-hook-form"
import type { FinanceModuleFormValues } from "@/src/modules/finance/settings/lib/finance-module-form"

const MODULE_ACCENT = getModule("finance").accent

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
        <SummaryItem
          href={APP_ROUTES.app.settingsRegional}
          icon={CalendarCog}
          accentColor={MODULE_ACCENT}
          title="Primer día de la semana"
          description="Se configura en Preferencias › Región."
          showChevron
          isLast
        />
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
