import { ChoiceGrid } from "@/src/shared/components/forms/choice-grid"
import {
  SummaryGroup,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { Calculator, Keyboard, Landmark } from "lucide-react"
import { Controller, type Control } from "react-hook-form"
import type { FinanceModuleFormValues } from "@/src/modules/finance/settings/lib/finance-module-form"
import { AccountChoiceList } from "./account-choice-list"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"

const MODULE_ACCENT = getModule("finance").accent

const AMOUNT_ENTRY_OPTIONS = [
  { value: "keyboard", label: "Teclado", icon: Keyboard },
  { value: "calculator", label: "Calculadora", icon: Calculator },
] as const

type MovementDefaultsSectionProps = {
  control: Control<FinanceModuleFormValues>
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  display: FinanceMoneyDisplay
}

export function MovementDefaultsSection({
  control,
  institutions,
  accounts,
  display,
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
                pickerKey="default-account"
                institutions={institutions}
                accounts={accounts}
                display={display}
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
    </>
  )
}
