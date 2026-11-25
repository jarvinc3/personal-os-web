import { ChoiceGrid } from "@/src/shared/components/forms/choice-grid"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldMedia,
} from "@/src/shared/components/ui/field"
import { Switch } from "@/src/shared/components/ui/switch"
import { DayListField } from "@/src/shared/components/forms/day-list-field"
import {
  SummaryGroup,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { CalendarDays, CalendarRange, HandCoins } from "lucide-react"
import { Controller, useWatch, type Control } from "react-hook-form"
import type { FinanceModuleFormValues } from "@/src/modules/finance/settings/lib/finance-module-form"
import { AccountChoiceList } from "./account-choice-list"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { FinanceAccount } from "@/src/modules/finance/shared/types/entities"

const MODULE_ACCENT = getModule("finance").accent

const FREQUENCY_OPTIONS = [
  { value: "BIWEEKLY", label: "Quincenal", icon: CalendarDays },
  { value: "MONTHLY", label: "Mensual", icon: CalendarRange },
] as const

type FixedIncomeSectionProps = {
  control: Control<FinanceModuleFormValues>
  baseCurrency: string
  accounts: FinanceAccount[]
  display: FinanceMoneyDisplay
}

export function FixedIncomeSection({
  control,
  baseCurrency,
  accounts,
  display,
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
          <Field
            variant="card"
            orientation="horizontal"
            style={field.value ? { borderColor: MODULE_ACCENT } : undefined}
          >
            <FieldMedia icon={HandCoins} color={MODULE_ACCENT} />
            <FieldContent>
              <FieldLabel htmlFor={field.name}>
                Tengo un ingreso fijo
              </FieldLabel>
              <FieldDescription className="text-xs">
                Se usa como monto sugerido cuando llega una nómina sin cifra.
              </FieldDescription>
            </FieldContent>
            <Switch
              id={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </Field>
        )}
      />
      {fixedIncomeEnabled ? (
        <>
          <Controller
            control={control}
            name="fixedIncomeAmount"
            render={({ field, fieldState }) => (
              <FinanceMoneyField
                calculatorKey="fixed-income-amount"
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
                  display={display}
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
