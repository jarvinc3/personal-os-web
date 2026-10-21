"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  CircleAlertIcon,
  InfoIcon,
  LinkIcon,
  RepeatIcon,
  SaveIcon,
  StickyNoteIcon,
  TagIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { BrandPicker } from "@/src/modules/finance/shared/components/brand-picker"
import {
  BrandLogo,
  brandPreviewUrl,
} from "@/src/modules/finance/shared/components/brand-logo"
import { CategoryTrigger } from "@/src/modules/finance/shared/components/pickers/category-trigger"
import { CategoryPickerSheet } from "@/src/modules/finance/shared/components/pickers/category-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { FinanceSegmentedControl } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useDiscardChanges } from "@/src/modules/finance/shared/hooks/use-discard-changes"
import { useFinanceAmountEntry } from "@/src/modules/finance/shared/hooks/use-finance-amount-entry"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import {
  useCreateSubscription,
  useUpdateSubscription,
} from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  BILLING_CYCLE_OPTIONS,
  hasPaymentMethodTarget,
  subscriptionFormSchema,
  subscriptionPayload,
  toSubscriptionFormValues,
  type SubscriptionDraft,
  type SubscriptionFormValues,
} from "@/src/modules/finance/subscriptions/lib/subscription-form"
import type { FinanceSubscription } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"

type SubscriptionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: FinanceSubscription | null
  draft?: SubscriptionDraft
  display: FinanceMoneyDisplay
}

export function SubscriptionSheet({
  open,
  onOpenChange,
  subscription,
  draft,
  display,
}: SubscriptionSheetProps) {
  const isEdit = Boolean(subscription)
  const accountsQuery = useAccounts(open)
  const cardsQuery = useCards(open)
  const institutionsQuery = useInstitutions(open)
  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []
  const institutions = institutionsQuery.data ?? []
  const createMutation = useCreateSubscription()
  const updateMutation = useUpdateSubscription()
  const { amountEntry, setAmountEntry } = useFinanceAmountEntry()
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "currency" | "destination" | "category"
  >("none")
  const categoriesQuery = useCategories(open)
  const categories = categoriesQuery.data ?? []

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: toSubscriptionFormValues(subscription, {
      defaultCurrency: display.currency,
      draft,
    }),
  })

  const { requestOpenChange, discardChangesDialog } = useDiscardChanges({
    isDirty,
    onOpenChange,
  })

  useEffect(() => {
    if (open) {
      reset(
        toSubscriptionFormValues(subscription, {
          defaultCurrency: display.currency,
          draft,
        })
      )
    }
  }, [open, subscription, draft, display.currency, reset])

  const currency = useWatch({ control, name: "currency" })
  const name = useWatch({ control, name: "name" })
  const domain = useWatch({ control, name: "domain" })
  const cardId = useWatch({ control, name: "cardId" })
  const accountId = useWatch({ control, name: "accountId" })
  const categoryId = useWatch({ control, name: "categoryId" })
  const category = categories.find((item) => item.id === categoryId) ?? null
  const destination =
    cardId !== CATALOG_NONE
      ? encodeLedgerTarget("card", cardId)
      : accountId !== CATALOG_NONE
        ? encodeLedgerTarget("account", accountId)
        : CATALOG_NONE
  const hasPaymentMethod = hasPaymentMethodTarget({ cardId, accountId })
  const logoUrl =
    brandPreviewUrl(domain) ??
    (subscription?.domain === domain ? subscription?.logoUrl : null)

  const isPending = createMutation.isPending || updateMutation.isPending

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    try {
      if (subscription) {
        await updateMutation.mutateAsync({
          id: subscription.id,
          body: subscriptionPayload(values),
        })
      } else {
        await createMutation.mutateAsync(subscriptionPayload(values))
      }
      if (hasPaymentMethodTarget(values)) {
        appToast.success({
          text1: subscription
            ? "Suscripción actualizada"
            : "Suscripción creada",
        })
      } else {
        appToast.warning({
          text1: subscription
            ? "Guardada sin método de pago"
            : "Creada sin método de pago",
          text2: "Registrar un pago no moverá ningún saldo.",
        })
      }
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={requestOpenChange}
        pending={isPending}
        title={isEdit ? "Editar suscripción" : "Nueva suscripción"}
        description="Monto fijo, ciclo de facturación y próximo cobro."
        actions={{
          close: (
            <Button
              key="cancel"
              variant="outline"
              className="flex-1"
              onClick={() => requestOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" />
              Cancelar
            </Button>
          ),
          submit: (
            <Button
              key="submit"
              className="flex-1"
              disabled={isPending}
              onClick={onSubmit}
            >
              {isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SaveIcon className="size-4 shrink-0" />
              )}
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          ),
        }}
      >
        <div className="flex items-center gap-3">
          <BrandLogo name={name || "Suscripción"} logoUrl={logoUrl} size={44} />
          <div className="min-w-0 flex-1">
            <BrandPicker
              onSelect={(brand) => {
                setValue("name", brand.name, { shouldDirty: true })
                setValue("domain", brand.domain, { shouldDirty: true })
              }}
            />
          </div>
        </div>

        <SummarySection title="Cobro" icon={RepeatIcon}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <FormTextField
                label="Nombre"
                icon={TagIcon}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <FinanceMoneyField
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={field.onChange}
                amountError={errors.amount?.message}
                currency={currency || display.currency}
                currencyError={errors.currency?.message}
                onCurrencyPress={() => openPicker("currency")}
                disabled={isPending}
                entryMode={amountEntry}
                onEntryModeChange={setAmountEntry}
              />
            )}
          />
          <Controller
            control={control}
            name="billingCycle"
            render={({ field }) => (
              <FinanceSegmentedControl
                label="Ciclo"
                value={field.value}
                onChange={field.onChange}
                options={BILLING_CYCLE_OPTIONS}
              />
            )}
          />
          <Controller
            control={control}
            name="billingInterval"
            render={({ field }) => (
              <FormTextField
                label="Cada cuántos ciclos"
                icon={RepeatIcon}
                value={field.value}
                onChange={field.onChange}
                error={errors.billingInterval?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="anchorDate"
            render={({ field }) => (
              <FinanceDateField
                label="Primer cobro"
                value={field.value}
                onChange={field.onChange}
                error={errors.anchorDate?.message}
              />
            )}
          />
          <div className="flex flex-col gap-1">
            <Field className="gap-1">
              <FieldLabel className="text-sm text-muted-foreground">
                Cuenta o tarjeta
              </FieldLabel>
              <DestinationTrigger
                destination={destination}
                accounts={accounts}
                cards={cards}
                display={display}
                disabled={isPending}
                onClick={() => openPicker("destination")}
              />
            </Field>
            {hasPaymentMethod ? null : (
              <p className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-500">
                <CircleAlertIcon className="mt-px size-3.5 shrink-0" />
                Sin método de pago: registrar un pago no moverá ningún saldo.
              </p>
            )}
          </div>
        </SummarySection>

        <SummarySection
          title="Detalles opcionales"
          icon={InfoIcon}
          collapsible
          defaultOpen={isEdit}
        >
          <Controller
            control={control}
            name="trialEndsAt"
            render={({ field }) => (
              <FinanceDateField
                label="Fin de la prueba"
                value={field.value}
                onChange={field.onChange}
                error={errors.trialEndsAt?.message}
              />
            )}
          />
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Categoría
            </FieldLabel>
            <CategoryTrigger
              category={category}
              disabled={isPending}
              onClick={() => openPicker("category")}
            />
          </Field>
          <Controller
            control={control}
            name="manageUrl"
            render={({ field }) => (
              <FormTextField
                label="Enlace de gestión"
                icon={LinkIcon}
                value={field.value}
                onChange={field.onChange}
                error={errors.manageUrl?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <FormTextField
                label="Notas"
                icon={StickyNoteIcon}
                value={field.value}
                onChange={field.onChange}
                error={errors.notes?.message}
              />
            )}
          />
        </SummarySection>
      </BottomSheet>

      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={currency || display.currency}
        onSelect={(next) =>
          setValue("currency", next, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />

      <DestinationPickerSheet
        open={picker === "destination"}
        onOpenChange={closeHandlerFor("destination")}
        institutions={institutions}
        accounts={accounts}
        cards={cards}
        display={display}
        onSelect={(next) => {
          const target = splitLedgerTarget(next)
          setValue("cardId", target.cardId ?? CATALOG_NONE, {
            shouldDirty: true,
          })
          setValue("accountId", target.accountId ?? CATALOG_NONE, {
            shouldDirty: true,
          })
        }}
      />

      <CategoryPickerSheet
        open={picker === "category"}
        onOpenChange={closeHandlerFor("category")}
        categories={categories}
        categoryType="EXPENSE"
        value={categoryId}
        onSelect={(next) => setValue("categoryId", next, { shouldDirty: true })}
      />

      {discardChangesDialog}
    </>
  )
}
