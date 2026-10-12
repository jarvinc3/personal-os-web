"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  BanknoteIcon,
  Building2Icon,
  CheckIcon,
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  PencilIcon,
  SaveIcon,
  SearchIcon,
  ShapesIcon,
  SmartphoneIcon,
  TrendingUpIcon,
  UploadIcon,
  UsersIcon,
  WalletIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

import {
  BrandLogo,
  brandPreviewUrl,
} from "@/src/modules/finance/shared/components/brand-logo"
import { BrandPicker } from "@/src/modules/finance/shared/components/brand-picker"
import { FinanceFormScreen } from "@/src/modules/finance/shared/components/forms/form-screen"
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
  useCreateInstitution,
  useUpdateInstitution,
  useUploadInstitutionLogo,
} from "@/src/modules/finance/shared/hooks/use-institutions"
import { buildCreateInstitutionBody } from "@/src/modules/finance/shared/lib/catalog-payloads"
import { countryName } from "@/src/modules/finance/shared/lib/countries"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceInstitution } from "@/src/modules/finance/shared/types/entities"
import {
  INSTITUTION_CATALOG_FILTERS,
  POPULAR_INSTITUTIONS,
  filterCatalog,
  type InstitutionCatalogEntry,
  type InstitutionCatalogFilter,
} from "@/src/modules/finance/institutions/lib/institution-catalog"
import {
  institutionSchema,
  type InstitutionFormValues,
} from "@/src/modules/finance/institutions/lib/institution-form"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Label } from "@/src/shared/components/ui/label"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"

const TYPE_ICON: Record<FinanceInstitutionType, LucideIcon> = {
  bank: LandmarkIcon,
  credit_union: UsersIcon,
  digital_wallet: SmartphoneIcon,
  broker: TrendingUpIcon,
  cash: BanknoteIcon,
  other: ShapesIcon,
}

type WizardStep = "catalog" | "form" | "next"

type ProductChoice = "account" | "card" | "loan"

type InstitutionFormScreenProps = {
  institution?: FinanceInstitution | null
  onDone: () => void
  onAddProduct?: (choice: ProductChoice, institutionId: string) => void
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

export function InstitutionFormScreen({
  institution = null,
  onDone,
  onAddProduct,
}: InstitutionFormScreenProps) {
  const isEdit = Boolean(institution)
  const createMutation = useCreateInstitution()
  const updateMutation = useUpdateInstitution()
  const uploadMutation = useUploadInstitutionLogo()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadMutation.isPending
  const [step, setStep] = useState<WizardStep>(isEdit ? "form" : "catalog")
  const [filter, setFilter] = useState<InstitutionCatalogFilter>("bank")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<InstitutionFormValues>({
    mode: "onTouched",
    resolver: zodResolver(institutionSchema),
    defaultValues: toFormValues(institution),
  })

  const formValues = useWatch({ control })
  const formIsValid = institutionSchema.safeParse(formValues).success
  const canSave =
    !isPending &&
    (isEdit ? isDirty || Boolean(logoFile) : formIsValid) &&
    step === "form"
  const institutionName = useWatch({ control, name: "name" })
  const institutionColor = useWatch({ control, name: "color" })
  const institutionCountry = useWatch({ control, name: "country" })
  const institutionDomain = useWatch({ control, name: "domain" })
  const institutionType = useWatch({ control, name: "type" })
  const [countryOpen, setCountryOpen] = useState(false)

  const previewLogo =
    brandPreviewUrl(institutionDomain) ??
    (institution?.domain === institutionDomain ? institution?.logoUrl : null)

  useEffect(() => {
    if (!isEdit) {
      return
    }
    reset(toFormValues(institution))
  }, [isEdit, institution, reset])

  function applyCatalogEntry(entry: InstitutionCatalogEntry) {
    reset({
      name: entry.name,
      color: entry.color,
      country: entry.country,
      type: entry.type,
      shortName: "",
      sortOrder: "0",
      domain: entry.domain,
    })
    setStep("form")
  }

  const onSubmit = handleSubmit(async (values) => {
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
      if (institution) {
        onDone()
        return
      }
      setCreatedId(saved.id)
      setStep("next")
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  if (step === "catalog") {
    return (
      <div className="flex flex-col gap-4 pb-4">
        <div className="rounded-2xl border border-border bg-card p-3">
          <BrandPicker
            onSelect={(brand) =>
              applyCatalogEntry({
                name: brand.name,
                domain: brand.domain,
                type: "bank",
                country: "DO",
                color: "",
              })
            }
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {INSTITUTION_CATALOG_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "h-9 rounded-full border px-4 text-sm",
                PRESSABLE_CLASS,
                filter === item.value
                  ? "border-primary bg-primary/15 font-medium"
                  : "border-border bg-card"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {filterCatalog(POPULAR_INSTITUTIONS, filter).map((entry) => (
            <button
              key={entry.domain}
              type="button"
              onClick={() => applyCatalogEntry(entry)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left",
                PRESSABLE_CLASS
              )}
            >
              <BrandLogo
                name={entry.name}
                logoUrl={brandPreviewUrl(entry.domain)}
                size={36}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {entry.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {FINANCE_INSTITUTION_TYPE_LABEL[entry.type]} ·{" "}
                  {countryName(entry.country)}
                </span>
              </span>
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={() => {
            reset(toFormValues(null))
            setStep("form")
          }}
        >
          <PencilIcon className="size-4 shrink-0" />
          Otra institución
        </Button>
      </div>
    )
  }

  if (step === "next" && createdId) {
    return (
      <div className="flex flex-col gap-4 pb-4">
        <InstitutionPreviewCard
          name={institutionName}
          color={institutionColor}
          logoUrl={previewLogo}
          caption="0 productos"
        />
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
            <CheckIcon className="size-6" />
          </span>
          <p className="text-base font-medium">{institutionName} lista</p>
          <p className="text-sm text-muted-foreground">
            ¿Agregamos tu primer producto?
          </p>
        </div>
        <SummarySection title="Agregar" icon={WalletIcon}>
          {[
            {
              id: "account" as const,
              title: "Cuenta",
              description: "Ahorros, corriente",
              icon: WalletIcon,
            },
            {
              id: "card" as const,
              title: "Tarjeta",
              description: "Crédito o débito",
              icon: CreditCardIcon,
            },
            {
              id: "loan" as const,
              title: "Préstamo",
              description: "Cuotas y saldo",
              icon: HandCoinsIcon,
            },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onAddProduct?.(option.id, createdId)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left",
                PRESSABLE_CLASS
              )}
            >
              <option.icon className="size-4.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {option.title}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </button>
          ))}
        </SummarySection>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={onDone}
        >
          Ahora no
        </Button>
      </div>
    )
  }

  return (
    <>
      <FinanceFormScreen
        onSubmit={onSubmit}
        submitLabel={isEdit ? "Guardar" : "Crear institución"}
        submitIcon={SaveIcon}
        isSubmitting={isPending}
        submitDisabled={!canSave}
      >
        <InstitutionPreviewCard
          name={institutionName}
          color={institutionColor}
          logoUrl={previewLogo}
          caption="Vista previa"
        />
        <SummarySection title="Datos" icon={Building2Icon}>
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
                placeholder="Banreservas"
              />
            )}
          />
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              País
            </FieldLabel>
            <CountryTrigger
              country={institutionCountry}
              onClick={() => setCountryOpen(true)}
            />
            {errors.country?.message ? (
              <FieldError>{errors.country.message}</FieldError>
            ) : null}
          </Field>
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Tipo
            </FieldLabel>
            <div className="flex flex-wrap gap-2">
              {FINANCE_INSTITUTION_TYPES.map((type) => {
                const TypeIcon = TYPE_ICON[type]
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={institutionType === type}
                    onClick={() =>
                      setValue("type", type, { shouldValidate: true })
                    }
                    className={cn(
                      "flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm",
                      PRESSABLE_CLASS,
                      institutionType === type
                        ? "border-primary bg-primary/15 font-medium"
                        : "border-border bg-card"
                    )}
                  >
                    <TypeIcon className="size-4 shrink-0" />
                    {FINANCE_INSTITUTION_TYPE_LABEL[type]}
                  </button>
                )
              })}
            </div>
          </Field>
        </SummarySection>

        <SummarySection title="Apariencia" icon={ShapesIcon}>
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Logo propio
            </FieldLabel>
            <div className="flex items-center gap-3">
              <BrandLogo
                name={institutionName.trim() || "Institución"}
                logoUrl={previewLogo}
                size={48}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon className="size-4 shrink-0" />
                  <span className="truncate">
                    {logoFile ? logoFile.name : "Subir logo"}
                  </span>
                </Button>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG o WEBP · 1 MB
                </span>
              </div>
              {logoFile ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar logo"
                  onClick={() => {
                    setLogoFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
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
          </Field>
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor="institution-color">Color</Label>
                <ColorPickerSwatch
                  id="institution-color"
                  value={field.value}
                  onChange={field.onChange}
                />
              </div>
            )}
          />
        </SummarySection>

        <SummarySection title="Avanzado" icon={SearchIcon} collapsible>
          <Controller
            control={control}
            name="domain"
            render={({ field }) => (
              <FormTextField
                icon={SearchIcon}
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
                icon={Building2Icon}
                label="Nombre corto"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.shortName?.message}
              />
            )}
          />
        </SummarySection>
      </FinanceFormScreen>

      <CountryPickerSheet
        open={countryOpen}
        onOpenChange={setCountryOpen}
        value={institutionCountry}
        onSelect={(next) => setValue("country", next, { shouldValidate: true })}
      />
    </>
  )
}

function InstitutionPreviewCard({
  name,
  color,
  logoUrl,
  caption,
}: {
  name: string
  color: string
  logoUrl: string | null
  caption: string
}) {
  return (
    <div
      className="flex flex-col justify-between gap-6 rounded-3xl p-5 text-white"
      style={{ backgroundColor: color || "#D6C5B3" }}
    >
      <div className="flex items-center gap-3">
        <BrandLogo name={name || "Institución"} logoUrl={logoUrl} size={44} />
        <span className="min-w-0 flex-1 truncate text-lg font-semibold">
          {name || "Nueva institución"}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-white/80">{caption}</span>
        <span className="text-xl font-semibold tabular-nums">
          {formatFinanceMoney("0", {
            currency: "DOP",
            showCents: true,
            compactNumbers: false,
          })}
        </span>
      </div>
    </div>
  )
}
