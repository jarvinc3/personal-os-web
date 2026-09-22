"use client"

import {
  FinancePreviewRow,
  FinanceSegmentedControl,
} from "@/src/modules/finance/components/forms/finance-form-blocks"
import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/src/modules/finance/hooks/use-categories"
import { buildCreateCategoryBody } from "@/src/modules/finance/lib/catalog-payloads"
import { filterCategoriesByType } from "@/src/modules/finance/lib/category-tree"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import type {
  FinanceCategory,
  FinanceCategoryType,
} from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker"
import { Label } from "@/src/shared/components/ui/label"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Palette, TagsIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

const TYPE_OPTIONS = [
  { value: "EXPENSE" as const, label: "Gasto" },
  { value: "INCOME" as const, label: "Ingreso" },
]

const schema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(80),
  icon: z.string().trim().min(1, "El icono debe ser un emoji"),
  color: z.string().trim().max(20),
  parentId: z.string(),
  type: z.enum(["EXPENSE", "INCOME"]),
})

type FormValues = z.infer<typeof schema>

function toFormValues(
  category: FinanceCategory | null,
  defaultType: FinanceCategoryType,
): FormValues {
  return {
    name: category?.name ?? "",
    icon: category?.icon ?? "",
    color: category?.color ?? "",
    parentId: category?.parentId ?? CATALOG_NONE,
    type: category?.type ?? defaultType,
  }
}

type CategorySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: FinanceCategory | null
  categories: FinanceCategory[]
  defaultType?: FinanceCategoryType
  pending?: boolean
}

export function CategorySheet({
  open,
  onOpenChange,
  category,
  categories,
  defaultType = "EXPENSE",
  pending = false,
}: CategorySheetProps) {
  const isEdit = Boolean(category)
  const isSystem = Boolean(category?.isSystem)
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(category, defaultType),
  })
  const categoryName = useWatch({ control, name: "name" })
  const categoryIcon = useWatch({ control, name: "icon" })
  const categoryColor = useWatch({ control, name: "color" })
  const selectedType = useWatch({ control, name: "type" })
  const parentId = useWatch({ control, name: "parentId" })

  const parentOptions = useMemo(
    () => [
      { value: CATALOG_NONE, label: "Sin padre" },
      ...filterCategoriesByType(categories, selectedType)
        .filter((item) => item.id !== category?.id)
        .map((item) => ({
          value: item.id,
          label: `${item.icon ? `${item.icon} ` : ""}${item.name}`,
        })),
    ],
    [categories, category?.id, selectedType]
  )

  useEffect(() => {
    if (open) {
      reset(toFormValues(category, defaultType))
    }
  }, [open, category, defaultType, reset])

  useEffect(() => {
    if (!open || isEdit) return
    const parent = categories.find((item) => item.id === parentId)
    if (parent && parent.type !== selectedType) {
      setValue("parentId", CATALOG_NONE)
    }
  }, [open, isEdit, parentId, selectedType, categories, setValue])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    const payload = buildCreateCategoryBody(values)
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      if (category) {
        const { type: _type, ...body } = payload.body
        await updateMutation.mutateAsync({
          id: category.id,
          body,
        })
        appToast.success({ text1: "Categoría actualizada" })
      } else {
        await createMutation.mutateAsync(payload.body)
        appToast.success({ text1: "Categoría creada" })
      }
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  async function onDelete() {
    if (!category) return
    const confirmed = window.confirm(
      "¿Eliminar esta categoría? No se puede deshacer."
    )
    if (!confirmed) return
    try {
      await deleteMutation.mutateAsync(category.id)
      appToast.success({ text1: "Categoría eliminada" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      title={
        isEdit
          ? isSystem
            ? "Categoría del sistema"
            : "Editar categoría"
          : "Nueva categoría"
      }
      description={
        isSystem
          ? "Esta categoría viene con el sistema. No se puede editar ni eliminar."
          : "Usa un emoji como icono."
      }
      actions={{
        delete:
          isEdit && !isSystem ? (
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => void onDelete()}
            >
              Eliminar
            </Button>
          ) : undefined,
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        ),
        submit: isSystem ? undefined : (
          <Button disabled={isPending} className="flex-1" onClick={onSubmit}>
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        ),
      }}
    >
      <SummarySection title="Categoría" icon={TagsIcon}>
        <FinancePreviewRow
          icon={TagsIcon}
          title={`${categoryIcon.trim() ? `${categoryIcon.trim()} ` : ""}${categoryName.trim() || "Nueva categoría"}`}
          description="Usa un emoji como icono"
          accentColor={categoryColor || undefined}
        />
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <FinanceSegmentedControl
              label="Tipo"
              value={field.value}
              onChange={field.onChange}
              options={TYPE_OPTIONS}
              disabled={isEdit || isSystem}
            />
          )}
        />
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <FormTextField
              label="Nombre"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.name?.message}
              placeholder="Supermercado"
              disabled={isSystem}
            />
          )}
        />
        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <FormTextField
              label="Emoji"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.icon?.message}
              placeholder="🛒"
              disabled={isSystem}
            />
          )}
        />
        <Controller
          control={control}
          name="parentId"
          render={({ field }) => (
            <SelectField
              label="Categoría padre"
              value={field.value}
              onChange={field.onChange}
              options={parentOptions}
              disabled={isSystem}
            />
          )}
        />
      </SummarySection>
      <SummarySection title="Apariencia" icon={Palette}>
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="category-color">Color</Label>
              <ColorPickerSwatch
                id="category-color"
                variant="button"
                value={field.value}
                onChange={field.onChange}
                disabled={isSystem}
              />
            </div>
          )}
        />
      </SummarySection>
    </BottomSheet>
  )
}
