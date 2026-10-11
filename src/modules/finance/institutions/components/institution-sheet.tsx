"use client"

import {
  BrandLogo,
  brandPreviewUrl,
} from "@/src/modules/finance/shared/components/brand-logo"
import { BrandPicker } from "@/src/modules/finance/shared/components/brand-picker"
import { FinancePreviewRow } from "@/src/modules/finance/shared/components/forms/form-blocks"
import {
  FINANCE_INSTITUTION_TYPE_LABEL,
  FINANCE_INSTITUTION_TYPES,
} from "@/src/modules/finance/shared/constants/catalog"
import {
  useArchiveInstitution,
  useCreateInstitution,
  useDeleteInstitution,
  useUpdateInstitution,
  useUploadInstitutionLogo,
} from "@/src/modules/finance/shared/hooks/use-institutions"
import { buildCreateInstitutionBody } from "@/src/modules/finance/shared/lib/catalog-payloads"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceInstitution } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker"
import { Label } from "@/src/shared/components/ui/label"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArchiveIcon,
  Building2Icon,
  GlobeIcon,
  ListOrderedIcon,
  Palette,
  SaveIcon,
  TagIcon,
  TrashIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  institutionSchema,
  type InstitutionFormValues,
} from "@/src/modules/finance/institutions/lib/institution-form"

function toFormValues(
  institution: FinanceInstitution | null
): InstitutionFormValues {
  return {
    name: institution?.name ?? "",
    color: institution?.color ?? "",
    country: institution?.country ?? "DO",
    type: institution?.type ?? "bank",
    shortName: institution?.shortName ?? "",
    sortOrder: String(institution?.sortOrder ?? 0),
    domain: institution?.domain ?? "",
  }
}

type InstitutionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  institution: FinanceInstitution | null
  pending?: boolean
  onDeleted?: () => void
}

export function InstitutionSheet({
  open,
  onOpenChange,
  institution,
  pending = false,
  onDeleted,
}: InstitutionSheetProps) {
  const isEdit = Boolean(institution)
  const createMutation = useCreateInstitution()
  const updateMutation = useUpdateInstitution()
  const archiveMutation = useArchiveInstitution()
  const deleteMutation = useDeleteInstitution()
  const uploadMutation = useUploadInstitutionLogo()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending ||
    uploadMutation.isPending

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionSchema),
    defaultValues: toFormValues(institution),
  })
  const institutionName = useWatch({ control, name: "name" })
  const institutionColor = useWatch({ control, name: "color" })
  const institutionCountry = useWatch({ control, name: "country" })
  const institutionDomain = useWatch({ control, name: "domain" })
  const previewLogo =
    brandPreviewUrl(institutionDomain) ??
    (institution?.domain === institutionDomain ? institution?.logoUrl : null)

  const logoScope = `${open ? "open" : "closed"}:${institution?.id ?? "new"}`
  const [logoScopeSeen, setLogoScopeSeen] = useState(logoScope)
  if (logoScopeSeen !== logoScope) {
    setLogoScopeSeen(logoScope)
    setLogoFile(null)
  }

  useEffect(() => {
    if (open) {
      reset(toFormValues(institution))
    }
  }, [open, institution, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    const payload = buildCreateInstitutionBody(values, { isUpdate: isEdit })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      const saved = institution
        ? await updateMutation.mutateAsync({
            id: institution.id,
            body: payload.body,
          })
        : await createMutation.mutateAsync(payload.body)
      if (logoFile) {
        await uploadMutation.mutateAsync({ id: saved.id, file: logoFile })
      }
      appToast.success({
        text1: institution ? "Institución actualizada" : "Institución creada",
      })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  async function onArchive() {
    if (!institution) {
      return
    }
    try {
      await archiveMutation.mutateAsync(institution.id)
      appToast.success({ text1: "Institución archivada" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onDelete() {
    if (!institution) {
      return
    }
    const confirmed = window.confirm(
      "¿Borrar este banco? Se eliminan cuentas, tarjetas, correos ligados y préstamos. No se puede deshacer."
    )
    if (!confirmed) {
      return
    }
    try {
      await deleteMutation.mutateAsync(institution.id)
      appToast.success({ text1: "Institución borrada" })
      onOpenChange(false)
      onDeleted?.()
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      title={isEdit ? "Editar institución" : "Nueva institución"}
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4" />
            Cancelar
          </Button>
        ),
        submit: (
          <Button disabled={isPending} className="flex-1" onClick={onSubmit}>
            {isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SaveIcon className="size-4" />
            )}
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        ),
      }}
    >
      <SummarySection title="Institución" icon={Building2Icon}>
        <div className="flex items-center gap-3">
          <BrandLogo
            name={institutionName.trim() || "Institución"}
            logoUrl={previewLogo}
            size={48}
          />
          <FinancePreviewRow
            icon={Building2Icon}
            title={institutionName.trim() || "Nueva institución"}
            description={institutionCountry.trim() || "País"}
            accentColor={institutionColor || undefined}
          />
        </div>
        <BrandPicker
          onSelect={(brand) => {
            reset((current) => ({
              ...current,
              name: current.name.trim() ? current.name : brand.name,
              domain: brand.domain,
            }))
          }}
        />
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <FormTextField
              icon={Building2Icon}
              label="Nombre"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="country"
          render={({ field }) => (
            <FormTextField
              icon={GlobeIcon}
              label="País (ISO-2)"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.country?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="domain"
          render={({ field }) => (
            <FormTextField
              icon={GlobeIcon}
              label="Dominio"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.domain?.message}
              placeholder="bhd.com.do"
            />
          )}
        />
        <Controller
          control={control}
          name="shortName"
          render={({ field }) => (
            <FormTextField
              icon={TagIcon}
              label="Nombre corto"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.shortName?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              Tipo
              <select
                className="h-10 rounded-xl border border-border bg-background px-3 text-foreground"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                {FINANCE_INSTITUTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {FINANCE_INSTITUTION_TYPE_LABEL[type]}
                  </option>
                ))}
              </select>
            </label>
          )}
        />
        <Controller
          control={control}
          name="sortOrder"
          render={({ field }) => (
            <FormTextField
              icon={ListOrderedIcon}
              label="Orden"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.sortOrder?.message}
            />
          )}
        />
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Logo propio (PNG, JPG o WEBP, máx. 1 MB)
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
          />
        </label>
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

      {isEdit && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 text-destructive"
            disabled={isPending}
            onClick={() => void onArchive()}
          >
            <ArchiveIcon className="size-4" />
            Archivar
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={isPending}
            onClick={() => void onDelete()}
          >
            <TrashIcon className="size-4" />
            Borrar
          </Button>
        </div>
      )}
    </BottomSheet>
  )
}
