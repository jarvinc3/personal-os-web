import { ChoiceGrid } from "@/src/shared/components/forms/choice-grid"
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldMedia,
  activeRowStyle,
} from "@/src/shared/components/ui/field"
import { Switch } from "@/src/shared/components/ui/switch"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import Link from "next/link"
import {
  SummaryGroup,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { getModule } from "@/src/shared/constants/module-registry"
import type { FinanceModuleConfig } from "@/src/modules/settings/types/module-config.types"
import {
  Calendar,
  CalendarCog,
  CalendarDays,
  CalendarRange,
  ChartBarIcon,
  ChevronRightIcon,
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
        <Item
          variant="default"
          render={<Link href={APP_ROUTES.app.settingsFinanceCurrencies} />}
        >
          <ItemMedia
            variant="icon"
            style={{
              backgroundColor: `color-mix(in srgb, ${MODULE_ACCENT} 18%, transparent)`,
            }}
          >
            <DollarSign style={{ color: MODULE_ACCENT }} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Moneda principal"}</ItemTitle>
            <ItemDescription className="truncate text-xs">
              {"Monedas y tasas del ledger."}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {baseCurrency}
            </span>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
            <LinkPendingOverlay />
          </ItemActions>
        </Item>
      </SummarySection>

      <SummarySection title="Inicio de semana" icon={CalendarCog}>
        <Item
          variant="default"
          render={<Link href={APP_ROUTES.app.settingsRegional} />}
        >
          <ItemMedia
            variant="icon"
            style={{
              backgroundColor: `color-mix(in srgb, ${MODULE_ACCENT} 18%, transparent)`,
            }}
          >
            <CalendarCog style={{ color: MODULE_ACCENT }} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Primer día de la semana"}</ItemTitle>
            <ItemDescription className="truncate text-xs">
              {"Se configura en Preferencias › Región."}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
            <LinkPendingOverlay />
          </ItemActions>
        </Item>
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
              <Field
                variant="card"
                orientation="horizontal"
                style={activeRowStyle(MODULE_ACCENT, field.value)}
              >
                <FieldMedia icon={Coins} color={MODULE_ACCENT} />
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Mostrar centavos</FieldLabel>
                </FieldContent>
                <Switch
                  id={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="compactNumbers"
            render={({ field }) => (
              <Field
                variant="card"
                orientation="horizontal"
                style={activeRowStyle(MODULE_ACCENT, field.value)}
              >
                <FieldMedia icon={Shrink} color={MODULE_ACCENT} />
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>
                    Números compactos
                  </FieldLabel>
                </FieldContent>
                <Switch
                  id={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />
        </SummaryGroup>
      </SummarySection>
    </>
  )
}
