"use client"

import {
  useArchiveInstitution,
  useCreateInstitution,
  useUpdateInstitution,
} from "@/src/modules/finance/hooks/use-institutions";
import { buildCreateInstitutionBody } from "@/src/modules/finance/lib/catalog-payloads";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import type { FinanceInstitution } from "@/src/modules/finance/types/entities";
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet";
import { FormTextField } from "@/src/shared/components/layout/form-blocks";
import { Button } from "@/src/shared/components/ui/button";
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker";
import { Label } from "@/src/shared/components/ui/label";
import { Spinner } from "@/src/shared/components/ui/spinner";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { appToast } from "@/src/shared/lib/app-toast";
import { createSheetSubmit } from "@/src/shared/lib/sheet-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2Icon, Palette } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(120),
  color: z.string().trim().max(20),
  country: z.string().trim().max(2),
})

type FormValues = z.infer<typeof schema>

function toFormValues(institution: FinanceInstitution | null): FormValues {
  return {
    name: institution?.name ?? "",
    color: institution?.color ?? "",
    country: institution?.country ?? "DO",
  }
}

type InstitutionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  institution: FinanceInstitution | null
}

export function InstitutionSheet({
  open,
  onOpenChange,
  institution,
}: InstitutionSheetProps) {
  const isEdit = Boolean(institution)
  const createMutation = useCreateInstitution()
  const updateMutation = useUpdateInstitution()
  const archiveMutation = useArchiveInstitution()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    archiveMutation.isPending

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(institution),
  })

  useEffect(() => {
    if (open) {
      reset(toFormValues(institution))
    }
  }, [open, institution, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit],
  )

  const onSubmit = submitForm(async (values) => {
    const payload = buildCreateInstitutionBody(values)
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      if (institution) {
        await updateMutation.mutateAsync({
          id: institution.id,
          body: payload.body,
        })
        appToast.success({ text1: "Institución actualizada" })
      } else {
        await createMutation.mutateAsync(payload.body)
        appToast.success({ text1: "Institución creada" })
      }
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  async function onArchive() {
    if (!institution) return
    try {
      await archiveMutation.mutateAsync(institution.id)
      appToast.success({ text1: "Institución archivada" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar institución" : "Nueva institución"}
      actions={{
        delete: isEdit ? (
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => void onArchive()}
          >
            Archivar
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
        submit: (
          <Button disabled={isPending} className="flex-1" onClick={onSubmit}>
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        ),
      }}
    >
      <SummarySection title="Institución" icon={Building2Icon}>
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
              placeholder="Banco, fintech…"
            />
          )}
        />
        <Controller
          control={control}
          name="country"
          render={({ field }) => (
            <FormTextField
              label="País (ISO-2)"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.country?.message}
              placeholder="DO"
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
              <Label htmlFor="institution-color">Color</Label>
              <ColorPickerSwatch
                id="institution-color"
                variant="button"
                value={field.value}
                onChange={field.onChange}
              />
            </div>
          )}
        />
      </SummarySection>
    </BottomSheet>
  )
}
