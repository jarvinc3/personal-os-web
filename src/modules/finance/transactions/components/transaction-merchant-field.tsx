"use client"

import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
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
          <Field
            data-invalid={errors.merchant ? true : undefined}
            className="gap-0.5"
          >
            <FieldLabel
              htmlFor="transaction-merchant"
              className="pl-2 text-sm text-muted-foreground"
            >
              {type === "CREDIT" ? "Origen" : "Comercio"}
            </FieldLabel>
            <InputGroup className="h-10 overflow-hidden px-1">
              <InputGroupAddon align="inline-start">
                {type === "CREDIT" ? (
                  <HandCoinsIcon className="text-muted-foreground" />
                ) : (
                  <StoreIcon className="text-muted-foreground" />
                )}
              </InputGroupAddon>
              <InputGroupInput
                id="transaction-merchant"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                aria-invalid={errors.merchant ? true : undefined}
              />
            </InputGroup>
            {errors.merchant?.message ? (
              <FieldError>{errors.merchant.message}</FieldError>
            ) : null}
          </Field>
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
