"use client"

import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import { CategoryEmojiField } from "@/src/modules/finance/catalog/components/category-emoji-field"
import { FinanceSegmentedControl } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/src/modules/finance/shared/hooks/use-categories"
import {
  buildCreateCategoryBody,
  buildUpdateCategoryBody,
} from "@/src/modules/finance/shared/lib/catalog-payloads"
import { filterCategoriesByType } from "@/src/modules/finance/shared/lib/category-tree"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type {
  FinanceCategory,
  FinanceCategoryType,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker"
import { Label } from "@/src/shared/components/ui/label"
import { Separator } from "@/src/shared/components/ui/separator"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ContactRoundIcon,
  FolderTreeIcon,
  PaletteIcon,
  SaveIcon,
  TrashIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  categorySchema,
  type CategoryFormValues,
} from "@/src/modules/finance/catalog/lib/category-form"

const TYPE_OPTIONS = [
  { value: "EXPENSE" as const, label: "Gasto", icon: ArrowDownCircleIcon },
  { value: "INCOME" as const, label: "Ingreso", icon: ArrowUpCircleIcon },
]

function toFormValues(
  category: FinanceCategory | null,
  defaultType: FinanceCategoryType
): CategoryFormValues {
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
  onSaved?: (category: FinanceCategory) => void
}

export function CategorySheet({
  open,
  onOpenChange,
  category,
  categories,
  defaultType = "EXPENSE",
  pending = false,
  onSaved,
}: CategorySheetProps) {
  const isEdit = Boolean(category)
  const isSystem = Boolean(category?.isSystem)
  const typeLocked = isSystem || (isEdit && category?.parentId != null)
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
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
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
        .filter((item) => item.id !== category?.id && item.parentId == null)
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
    if (!open) {
      return
    }
    const parent = categories.find((item) => item.id === parentId)
    if (parent && parent.type !== selectedType) {
      setValue("parentId", CATALOG_NONE)
    }
  }, [open, parentId, selectedType, categories, setValue])

  useEffect(() => {
    if (!open || isSystem || categoryColor.trim()) {
      return
    }
    const parent = categories.find((item) => item.id === parentId)
    if (parent?.color) {
      setValue("color", parent.color)
    }
  }, [open, isSystem, categoryColor, parentId, categories, setValue])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    try {
      if (category) {
        const payload = buildUpdateCategoryBody({
          ...values,
          persistedParentId: category.parentId,
        })
        if (!payload.ok) {
          appToast.error({ text1: payload.error })
          return
        }
        const updated = await updateMutation.mutateAsync({
          id: category.id,
          body: payload.body,
        })
        onSaved?.(updated)
        appToast.success({ text1: "Categoría actualizada" })
      } else {
        const payload = buildCreateCategoryBody(values)
        if (!payload.ok) {
          appToast.error({ text1: payload.error })
          return
        }
        const created = await createMutation.mutateAsync(payload.body)
        onSaved?.(created)
        appToast.success({ text1: "Categoría creada" })
      }
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  const [confirmOpen, setConfirmOpen] = useState(false)

  async function onDelete() {
    if (!category) {
      return
    }
    try {
      await deleteMutation.mutateAsync(category.id)
      appToast.success({ text1: "Categoría eliminada" })
      setConfirmOpen(false)
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <>
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
            : undefined
        }
        actions={{
          close: (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" />
              Cancelar
            </Button>
          ),
          submit: isSystem ? undefined : (
            <Button disabled={isPending} className="flex-1" onClick={onSubmit}>
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
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <FinanceSegmentedControl
              value={field.value}
              onChange={field.onChange}
              options={TYPE_OPTIONS}
              disabled={typeLocked}
              size="lg"
              fullWidth
            />
          )}
        />

        <CategoryCard
          name={categoryName}
          icon={categoryIcon}
          color={categoryColor}
          isSystem={isSystem}
          className="pr-4"
        />

        <SummarySection title="Datos" icon={ContactRoundIcon}>
          <div data-emoji-panel-host className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormTextField
                      label="Nombre"
                      icon={ContactRoundIcon}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.name?.message}
                      placeholder="Supermercado"
                      disabled={isSystem}
                    />
                  )}
                />
              </div>
              <div className="w-14 shrink-0">
                <Controller
                  control={control}
                  name="icon"
                  render={({ field }) => (
                    <CategoryEmojiField
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.icon?.message}
                      disabled={isSystem}
                    />
                  )}
                />
              </div>
            </div>
          </div>
          <Controller
            control={control}
            name="parentId"
            render={({ field }) => (
              <SelectField
                label="Categoría padre"
                icon={FolderTreeIcon}
                value={field.value}
                onChange={field.onChange}
                options={parentOptions}
                disabled={isSystem}
              />
            )}
          />
        </SummarySection>

        <SummarySection title="Apariencia" icon={PaletteIcon}>
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

        <Separator />

        {isEdit && !isSystem && (
          <Button
            variant="destructive"
            size="lg"
            disabled={isPending}
            className="flex-1 py-2"
            onClick={() => setConfirmOpen(true)}
          >
            {isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <TrashIcon className="size-4" />
            )}
            {isPending ? "Eliminando..." : "Eliminar categoría"}
          </Button>
        )}
      </BottomSheet>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending) {
            setConfirmOpen(open)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => void onDelete()}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
