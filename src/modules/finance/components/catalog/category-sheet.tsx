"use client"

import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog";
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/src/modules/finance/hooks/use-categories";
import { buildCreateCategoryBody } from "@/src/modules/finance/lib/catalog-payloads";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import type { FinanceCategory } from "@/src/modules/finance/types/entities";
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet";
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks";
import { Button } from "@/src/shared/components/ui/button";
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker";
import { Label } from "@/src/shared/components/ui/label";
import { Spinner } from "@/src/shared/components/ui/spinner";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { appToast } from "@/src/shared/lib/app-toast";
import { createSheetSubmit } from "@/src/shared/lib/sheet-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Palette, TagsIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(80),
  icon: z.string().trim().min(1, "El icono debe ser un emoji"),
  color: z.string().trim().max(20),
  parentId: z.string(),
})

type FormValues = z.infer<typeof schema>

function toFormValues(category: FinanceCategory | null): FormValues {
  return {
    name: category?.name ?? "",
    icon: category?.icon ?? "",
    color: category?.color ?? "",
    parentId: category?.parentId ?? CATALOG_NONE,
  }
}

type CategorySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: FinanceCategory | null
  categories: FinanceCategory[]
}

export function CategorySheet({
  open,
  onOpenChange,
  category,
  categories,
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

  const parentOptions = useMemo(
    () => [
      { value: CATALOG_NONE, label: "Sin padre" },
      ...categories
        .filter((item) => item.id !== category?.id)
        .map((item) => ({
          value: item.id,
          label: `${item.icon ? `${item.icon} ` : ""}${item.name}`,
        })),
    ],
    [categories, category?.id],
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(category),
  })

  useEffect(() => {
    if (open) {
      reset(toFormValues(category))
    }
  }, [open, category, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit],
  )

  const onSubmit = submitForm(async (values) => {
    const payload = buildCreateCategoryBody(values)
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      if (category) {
        await updateMutation.mutateAsync({ id: category.id, body: payload.body })
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
        delete: isEdit && !isSystem ? (
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
