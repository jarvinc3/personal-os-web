"use client"

import {
  BrandLogo,
  brandPreviewUrl,
} from "@/src/modules/finance/shared/components/brand-logo"
import { BrandPicker } from "@/src/modules/finance/shared/components/brand-picker"
import {
  FinanceHelpText,
  FinancePreviewRow,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import {
  CountryPickerSheet,
  CountryTrigger,
} from "@/src/modules/finance/shared/components/pickers/country-picker"
import {
  FINANCE_INSTITUTION_TYPE_LABEL,
  FINANCE_INSTITUTION_TYPES,
  type FinanceInstitutionType,
} from "@/src/modules/finance/shared/constants/catalog"
import {
  useArchiveInstitution,
  useCreateInstitution,
  useDeleteInstitution,
  useUpdateInstitution,
  useUploadInstitutionLogo,
} from "@/src/modules/finance/shared/hooks/use-institutions"
import { buildCreateInstitutionBody } from "@/src/modules/finance/shared/lib/catalog-payloads"
import { countryName } from "@/src/modules/finance/shared/lib/countries"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceInstitution } from "@/src/modules/finance/shared/types/entities"
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
  OptionRow,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Label } from "@/src/shared/components/ui/label"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArchiveIcon,
  BanknoteIcon,
  Building2Icon,
  GlobeIcon,
  InfoIcon,
  LandmarkIcon,
  SaveIcon,
  ShapesIcon,
  SmartphoneIcon,
  TagIcon,
  TrashIcon,
  TrendingUpIcon,
  UploadIcon,
  UsersIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  institutionSchema,
  type InstitutionFormValues,
} from "@/src/modules/finance/institutions/lib/institution-form"

const INSTITUTION_TYPE_ICON: Record<FinanceInstitutionType, LucideIcon> = {
  bank: LandmarkIcon,
  credit_union: UsersIcon,
  digital_wallet: SmartphoneIcon,
  broker: TrendingUpIcon,
  cash: BanknoteIcon,
  other: ShapesIcon,
}

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
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    setValue,
    formState: { errors, isDirty },
  } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionSchema),
    defaultValues: toFormValues(institution),
  })
  const formValues = useWatch({ control })
  const formIsValid = institutionSchema.safeParse(formValues).success
  const canSave =
    !isPending && (isEdit ? isDirty || Boolean(logoFile) : formIsValid)
  const institutionName = useWatch({ control, name: "name" })
  const institutionColor = useWatch({ control, name: "color" })
  const institutionCountry = useWatch({ control, name: "country" })
  const institutionDomain = useWatch({ control, name: "domain" })
  const institutionType = useWatch({ control, name: "type" })
  const { picker, openPicker, closeHandlerFor } = usePicker<"none" | "country">(
    "none"
  )
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

  const [confirmOpen, setConfirmOpen] = useState(false)

  async function onDelete() {
    if (!institution) {
      return
    }
    try {
      await deleteMutation.mutateAsync(institution.id)
      appToast.success({ text1: "Institución borrada" })
      setConfirmOpen(false)
      onOpenChange(false)
      onDeleted?.()
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  function clearLogo() {
    setLogoFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
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
            <Button disabled={!canSave} className="flex-1" onClick={onSubmit}>
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
              description={countryName(institutionCountry) || "País"}
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
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              País
            </FieldLabel>
            <CountryTrigger
              country={institutionCountry}
              onClick={() => openPicker("country")}
            />
            {errors.country?.message ? (
              <FieldError>{errors.country.message}</FieldError>
            ) : null}
          </Field>
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Tipo
            </FieldLabel>
            <div className="flex flex-col gap-2">
              {FINANCE_INSTITUTION_TYPES.map((type) => {
                const TypeIcon = INSTITUTION_TYPE_ICON[type]
                return (
                  <OptionRow
                    key={type}
                    icon={TypeIcon}
                    label={FINANCE_INSTITUTION_TYPE_LABEL[type]}
                    selected={institutionType === type}
                    onPress={() =>
                      setValue("type", type, { shouldValidate: true })
                    }
                  />
                )
              })}
            </div>
          </Field>
        </SummarySection>

        <SummarySection
          title="Detalles opcionales"
          icon={InfoIcon}
          collapsible
          defaultOpen={isEdit}
        >
          <Controller
            control={control}
            name="domain"
            render={({ field }) => (
              <FormTextField
                icon={GlobeIcon}
                label="Sitio web"
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
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Logo propio
            </FieldLabel>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-w-0 flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon className="size-4 shrink-0" />
                <span className="truncate">
                  {logoFile ? logoFile.name : "Elegir imagen"}
                </span>
              </Button>
              {logoFile ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar logo"
                  onClick={clearLogo}
                >
                  <XIcon className="size-4" />
                </Button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
            />
            <FinanceHelpText>PNG, JPG o WEBP. Máximo 1 MB.</FinanceHelpText>
          </Field>
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
              onClick={() => setConfirmOpen(true)}
            >
              <TrashIcon className="size-4" />
              Borrar
            </Button>
          </div>
        )}
      </BottomSheet>

      <CountryPickerSheet
        open={picker === "country"}
        onOpenChange={closeHandlerFor("country")}
        value={institutionCountry}
        onSelect={(next) => setValue("country", next, { shouldValidate: true })}
      />

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
            <AlertDialogTitle>¿Borrar este banco?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminan cuentas, tarjetas, correos ligados y préstamos. No se
              puede deshacer.
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
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
