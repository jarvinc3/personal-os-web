import { ChoiceGrid } from "@/src/shared/components/ui/choice-grid"
import { DayWheel } from "@/src/shared/components/ui/wheel-picker"
import {
  SummaryGroup,
  SummarySection,
} from "@/src/shared/components/ui/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { Calculator, CalendarRange, Keyboard, Landmark } from "lucide-react"
import { Controller, type Control } from "react-hook-form"
import type { FinanceModuleFormValues } from "@/src/modules/finance/settings/lib/finance-module-form"
import { AccountChoiceList, type AccountOption } from "./account-choice-list"

const MODULE_ACCENT = getModule("finance").accent

const AMOUNT_ENTRY_OPTIONS = [
  { value: "keyboard", label: "Teclado", icon: Keyboard },
  { value: "calculator", label: "Calculadora", icon: Calculator },
] as const

type MovementDefaultsSectionProps = {
  control: Control<FinanceModuleFormValues>
  accounts: AccountOption[]
}

/** How a new movement starts: which account it charges, how the amount is
 * captured and where the financial month begins. */
export function MovementDefaultsSection({
  control,
  accounts,
}: MovementDefaultsSectionProps) {
  return (
    <>
      <SummarySection title="Cuenta por defecto" icon={Landmark}>
        <SummaryGroup title="Cuenta de los movimientos nuevos">
          <Controller
            control={control}
            name="defaultAccountId"
            render={({ field }) => (
              <AccountChoiceList
                accounts={accounts}
                selectedId={field.value}
                onSelect={field.onChange}
                noneLabel="Sin cuenta por defecto"
              />
            )}
          />
        </SummaryGroup>
      </SummarySection>

      <SummarySection title="Entrada de monto" icon={Keyboard}>
        <SummaryGroup title="Forma de capturar el monto">
          <Controller
            control={control}
            name="amountEntry"
            render={({ field }) => (
              <ChoiceGrid
                accentColor={MODULE_ACCENT}
                ariaLabel="Forma de capturar el monto"
                value={field.value}
                onValueChange={field.onChange}
                options={AMOUNT_ENTRY_OPTIONS}
              />
            )}
          />
        </SummaryGroup>
      </SummarySection>

      <SummarySection title="Mes financiero" icon={CalendarRange}>
        <SummaryGroup title="Inicio del mes financiero">
          <Controller
            control={control}
            name="monthStartDay"
            render={({ field, fieldState }) => (
              <DayWheel
                icon={CalendarRange}
                value={field.value}
                min={1}
                max={28}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </SummaryGroup>
      </SummarySection>
    </>
  )
}
