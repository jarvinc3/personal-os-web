"use client"

import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import type { FinanceMerchantSuggestion } from "@/src/modules/finance/shared/types/entities"
import type { TransactionFormValues } from "@/src/modules/finance/transactions/lib/transaction-form"
import type { MovementType } from "@/src/modules/finance/transactions/lib/transaction-form-values"
import { HandCoinsIcon, StoreIcon } from "lucide-react"
import { Controller, type Control, type FieldErrors } from "react-hook-form"

type TransactionMerchantFieldProps = {
  control: Control<TransactionFormValues>
  errors: FieldErrors<TransactionFormValues>
  type: MovementType
  suggestion: FinanceMerchantSuggestion | null
  suggestionCategoryName: string | null
  onApplySuggestion: (name: string, categoryId: string | null) => void
}

export function TransactionMerchantField({
  control,
  errors,
  type,
  suggestion,
  suggestionCategoryName,
  onApplySuggestion,
}: TransactionMerchantFieldProps) {
  return (
    <Controller
      control={control}
      name="merchant"
      render={({ field }) => (
        <div className="flex flex-col gap-1">
          <FormTextField
            label={type === "CREDIT" ? "Origen" : "Comercio"}
            icon={type === "CREDIT" ? HandCoinsIcon : StoreIcon}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.merchant?.message}
          />
          {suggestion &&
          suggestion.name.trim().toLowerCase() !==
            field.value.trim().toLowerCase() ? (
            <button
              type="button"
              className="flex items-center gap-2 self-start rounded-lg bg-muted px-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
              onClick={() =>
                onApplySuggestion(suggestion.name, suggestion.categoryId)
              }
            >
              <StoreIcon className="size-3.5 shrink-0" aria-hidden />
              Usar «{suggestion.name}»
              {suggestionCategoryName ? ` · ${suggestionCategoryName}` : ""}
            </button>
          ) : null}
        </div>
      )}
    />
  )
}
