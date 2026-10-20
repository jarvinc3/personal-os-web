import { SwitchFieldRow } from "@/src/shared/components/layout/form-blocks"
import { ChoiceGrid } from "@/src/shared/components/ui/choice-grid"
import { DayListField } from "@/src/shared/components/ui/day-list-field"
import {
  SummaryGroup,
  SummarySection,
} from "@/src/shared/components/ui/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { CalendarDays, CalendarRange, HandCoins } from "lucide-react"
import { Controller, useWatch, type Control } from "react-hook-form"
import type { FinanceModuleFormValues } from "@/src/modules/finance/settings/lib/finance-module-form"
import { AccountChoiceList, type AccountOption } from "./account-choice-list"

const MODULE_ACCENT = getModule("finance").accent

const FREQUENCY_OPTIONS = [
  { value: "BIWEEKLY", label: "Quincenal", icon: CalendarDays },
  { value: "MONTHLY", label: "Mensual", icon: CalendarRange },
] as const

type FixedIncomeSectionProps = {
  control: Control<FinanceModuleFormValues>
  baseCurrency: string
  accounts: AccountOption[]
}

export function FixedIncomeSection({
  control,
  baseCurrency,
  accounts,
}: FixedIncomeSectionProps) {
  const fixedIncomeEnabled = useWatch({
    control,
    name: "fixedIncomeEnabled",
  })

  return (
    <SummarySection title="Ingreso fijo" icon={HandCoins}>
      <Controller
        control={control}
        name="fixedIncomeEnabled"
        render={({ field }) => (
          <SwitchFieldRow
            icon={HandCoins}
            iconColor={MODULE_ACCENT}
            accentColor={MODULE_ACCENT}
            label="Tengo un ingreso fijo"
            description="Se usa como monto sugerido cuando llega una nómina sin cifra."
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      {fixedIncomeEnabled ? (
        <>
          <Controller
            control={control}
            name="fixedIncomeAmount"
            render={({ field, fieldState }) => (
              <FinanceMoneyField
                label="Monto"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={field.onChange}
                onAmountBlur={field.onBlur}
                amountError={fieldState.error?.message}
                currency={baseCurrency}
              />
            )}
          />

          <SummaryGroup title="Frecuencia del ingreso">
            <Controller
              control={control}
              name="fixedIncomeFrequency"
              render={({ field }) => (
                <ChoiceGrid
                  ariaLabel="Frecuencia del ingreso"
                  accentColor={MODULE_ACCENT}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={FREQUENCY_OPTIONS}
                />
              )}
            />
          </SummaryGroup>

          <Controller
            control={control}
            name="fixedIncomePayDays"
            render={({ field, fieldState }) => (
              <DayListField
                label="Días de pago"
                icon={CalendarDays}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <SummaryGroup title="Cuenta asignada al ingreso por defecto">
            <Controller
              control={control}
              name="fixedIncomeAccountId"
              render={({ field }) => (
                <AccountChoiceList
                  accounts={accounts}
                  selectedId={field.value}
                  onSelect={field.onChange}
                  noneLabel="Sin cuenta"
                />
              )}
            />
          </SummaryGroup>
        </>
      ) : null}
    </SummarySection>
  )
}
