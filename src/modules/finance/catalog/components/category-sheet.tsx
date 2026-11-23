"use client"

import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import { CategoryEmojiField } from "@/src/modules/finance/catalog/components/category-emoji-field"
import { suggestCategoryEmojis } from "@/src/modules/finance/catalog/components/category-emoji-catalog"
import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import {
  useCreateCategory,
  useDeleteCategory,
  useRestoreCategory,
  useUpdateCategory,
} from "@/src/modules/finance/shared/hooks/use-categories"
import { useDiscardChanges } from "@/src/modules/finance/shared/hooks/use-discard-changes"
import {
  buildCreateCategoryBody,
  buildUpdateCategoryBody,
} from "@/src/modules/finance/shared/lib/catalog-payloads"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import type {
  FinanceCategory,
  FinanceCategoryType,
} from "@/src/modules/finance/shared/types/entities"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
import { CategoryPickerSheet } from "@/src/modules/finance/shared/components/pickers/category-picker-sheet"
import { CategoryTrigger } from "@/src/modules/finance/shared/components/pickers/category-trigger"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { Button } from "@/src/shared/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { ColorPickerSwatch } from "@/src/shared/components/forms/color-picker"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Label } from "@/src/shared/components/ui/label"
import { Separator } from "@/src/shared/components/ui/separator"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ContactRoundIcon,
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
  const typeLocked = isSystem || isEdit
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()
  const restoreMutation = useRestoreCategory()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: toFormValues(category, defaultType),
  })
  const { requestOpenChange, discardChangesDialog } = useDiscardChanges({
    isDirty,
    onOpenChange,
  })
  const categoryName = useWatch({ control, name: "name" })
  const categoryIcon = useWatch({ control, name: "icon" })
  const categoryColor = useWatch({ control, name: "color" })
  const selectedType = useWatch({ control, name: "type" })
  const parentId = useWatch({ control, name: "parentId" })
  const emojiSuggestions = useMemo(
    () => suggestCategoryEmojis(categoryName),
    [categoryName]
  )
  const { picker, openPicker, closeHandlerFor } = usePicker<"none" | "parent">(
    "none"
  )
  const selectedParent = categories.find((item) => item.id === parentId) ?? null

  const excludeParentIds = useMemo(
    () => (category ? [category.id] : []),
    [category]
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
      const categoryId = category.id
      await deleteMutation.mutateAsync(categoryId)
      setConfirmOpen(false)
      onOpenChange(false)
      showUndoToast("Categoría eliminada", () =>
        restoreMutation.mutate(categoryId, {
          onError: (error) =>
            appToast.error({ text1: financeErrorMessage(error) }),
        })
      )
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={requestOpenChange}
        helpAction={<SheetHelpAction sheetKey={FINANCE_SHEET_KEYS.category} />}
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
            <SegmentedControl
              value={field.value}
              onChange={field.onChange}
              options={TYPE_OPTIONS}
              disabled={typeLocked}
              size="lg"
              fullWidth
            />
          )}
        />
        {isEdit && !isSystem ? (
          <p className="text-xs text-muted-foreground">
            El tipo no cambia: los movimientos ya registrados lo usan.
          </p>
        ) : null}

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
            {emojiSuggestions.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Sugeridos</span>
                {emojiSuggestions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    aria-label={`Usar ${emoji}`}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border border-border text-base",
                      PRESSABLE_CLASS
                    )}
                    onClick={() =>
                      setValue("icon", emoji, { shouldValidate: true })
                    }
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Categoría padre
            </FieldLabel>
            <CategoryTrigger
              category={selectedParent}
              placeholder="Sin padre"
              disabled={isSystem}
              onClick={() => openPicker("parent")}
            />
            {errors.parentId?.message ? (
              <FieldError>{errors.parentId.message}</FieldError>
            ) : null}
          </Field>
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

      {discardChangesDialog}

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setConfirmOpen(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TrashIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              ¿Eliminar “{category?.name ?? "esta categoría"}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Los movimientos que la usan quedan sin categoría. No se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => void onDelete()}
            >
              {deleteMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <TrashIcon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CategoryPickerSheet
        open={picker === "parent"}
        onOpenChange={closeHandlerFor("parent")}
        categories={categories}
        categoryType={selectedType}
        onlyParents
        excludeIds={excludeParentIds}
        noneLabel="Sin padre"
        onSelect={(next) =>
          setValue("parentId", next, { shouldValidate: true })
        }
      />
    </>
  )
}
