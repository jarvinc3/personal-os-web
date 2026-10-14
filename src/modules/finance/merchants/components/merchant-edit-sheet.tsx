"use client"

import { z } from "zod"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { CategoryTrigger } from "@/src/modules/finance/shared/components/pickers/category-trigger"
import { CategoryPickerSheet } from "@/src/modules/finance/shared/components/pickers/category-picker-sheet"
import { FinanceSegmentedControl } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useDiscardChanges } from "@/src/modules/finance/shared/hooks/use-discard-changes"
import {
  useUpdateMerchant,
  useUploadMerchantLogo,
} from "@/src/modules/finance/shared/hooks/use-merchants"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceCategoryType } from "@/src/modules/finance/shared/types/entities"
import type { FinanceMerchant } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ImagePlusIcon,
  SaveIcon,
  StoreIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

const merchantSchema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(120),
  categoryId: z.string(),
})

type MerchantFormValues = z.infer<typeof merchantSchema>

const CATEGORY_TYPE_OPTIONS = [
  { value: "EXPENSE" as const, label: "Gasto" },
  { value: "INCOME" as const, label: "Ingreso" },
]

type MerchantEditSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  merchant: FinanceMerchant | null
}

export function MerchantEditSheet({
  open,
  onOpenChange,
  merchant,
}: MerchantEditSheetProps) {
  const categoriesQuery = useCategories(open)
  const categories = categoriesQuery.data ?? []
  const updateMutation = useUpdateMerchant()
  const logoMutation = useUploadMerchantLogo()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categoryType, setCategoryType] =
    useState<FinanceCategoryType>("EXPENSE")
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "category"
  >("none")

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<MerchantFormValues>({
    resolver: zodResolver(merchantSchema),
    defaultValues: { name: "", categoryId: CATALOG_NONE },
  })

  const { requestOpenChange, discardChangesDialog } = useDiscardChanges({
    isDirty,
    onOpenChange,
  })

  useEffect(() => {
    if (!open) {
      return
    }
    reset({
      name: merchant?.name ?? "",
      categoryId: merchant?.categoryId ?? CATALOG_NONE,
    })
  }, [open, merchant, reset])

  const categoryId = useWatch({ control, name: "categoryId" })
  const name = useWatch({ control, name: "name" })
  const selectedCategory =
    categories.find((category) => category.id === categoryId) ?? null
  const isPending = updateMutation.isPending || logoMutation.isPending

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    if (!merchant) {
      return
    }
    try {
      await updateMutation.mutateAsync({
        id: merchant.id,
        body: {
          name: values.name.trim(),
          categoryId:
            values.categoryId === CATALOG_NONE ? null : values.categoryId,
        },
      })
      appToast.success({ text1: "Comercio actualizado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  async function onPickLogo(file: File | undefined) {
    if (!merchant || !file) {
      return
    }
    try {
      await logoMutation.mutateAsync({ id: merchant.id, file })
      appToast.success({ text1: "Logo actualizado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={requestOpenChange}
        pending={isPending}
        title="Editar comercio"
        description="Cambia el nombre, el logo y la categoría que se sugiere."
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
              disabled={isPending || !isDirty || !merchant}
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
        <SummarySection title="Comercio" icon={StoreIcon}>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
            <BrandLogo
              name={name.trim() || merchant?.name || "Comercio"}
              logoUrl={merchant?.logoUrl}
              size={40}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {name.trim() || "Comercio"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {merchant?.normalizedKey ?? "—"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlusIcon className="size-4 shrink-0" />
              Logo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => {
                void onPickLogo(event.target.files?.[0])
                event.target.value = ""
              }}
            />
          </div>

          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <FormTextField
                label="Nombre"
                icon={StoreIcon}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.name?.message}
              />
            )}
          />

          <FinanceSegmentedControl
            value={categoryType}
            onChange={(next) => {
              setCategoryType(next)
              setValue("categoryId", CATALOG_NONE)
            }}
            options={CATEGORY_TYPE_OPTIONS}
          />

          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Categoría por defecto
            </FieldLabel>
            <CategoryTrigger
              category={selectedCategory}
              onClick={() => openPicker("category")}
            />
            {errors.categoryId?.message ? (
              <FieldError>{errors.categoryId.message}</FieldError>
            ) : null}
          </Field>
        </SummarySection>
      </BottomSheet>

      <CategoryPickerSheet
        open={picker === "category"}
        onOpenChange={closeHandlerFor("category")}
        categories={categories}
        categoryType={categoryType}
        onSelect={(next) => setValue("categoryId", next, { shouldDirty: true })}
      />

      {discardChangesDialog}
    </>
  )
}
