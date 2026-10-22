"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { CountryTrigger } from "@/src/modules/finance/shared/components/pickers/country-picker"
import {
  FINANCE_INSTITUTION_TYPE_LABEL,
  FINANCE_INSTITUTION_TYPES,
  type FinanceInstitutionType,
} from "@/src/modules/finance/shared/constants/catalog"
import type { InstitutionFormValues } from "@/src/modules/finance/institutions/lib/institution-form"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Label } from "@/src/shared/components/ui/label"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  BanknoteIcon,
  Building2Icon,
  LandmarkIcon,
  SearchIcon,
  ShapesIcon,
  SmartphoneIcon,
  TrendingUpIcon,
  UploadIcon,
  UsersIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { Controller, type Control, type FieldErrors } from "react-hook-form"

const TYPE_ICON: Record<FinanceInstitutionType, LucideIcon> = {
  bank: LandmarkIcon,
  credit_union: UsersIcon,
  digital_wallet: SmartphoneIcon,
  broker: TrendingUpIcon,
  cash: BanknoteIcon,
  other: ShapesIcon,
}

type InstitutionFormSectionsProps = {
  form: {
    control: Control<InstitutionFormValues>
    errors: FieldErrors<InstitutionFormValues>
    onSelectType: (type: FinanceInstitutionType) => void
  }
  identity: {
    name: string
    country: string
    type: FinanceInstitutionType
  }
  logo: {
    previewUrl: string | null
    fileName: string | null
    onPick: () => void
    onClear: () => void
  }
  onOpenCountry: () => void
}

export function InstitutionFormSections({
  form,
  identity,
  logo,
  onOpenCountry,
}: InstitutionFormSectionsProps) {
  const { control, errors } = form

  return (
    <>
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
          <CountryTrigger country={identity.country} onClick={onOpenCountry} />
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
                  aria-pressed={identity.type === type}
                  onClick={() => form.onSelectType(type)}
                  className={cn(
                    "flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm",
                    PRESSABLE_CLASS,
                    identity.type === type
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
              name={identity.name.trim() || "Institución"}
              logoUrl={logo.previewUrl}
              size={48}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full"
                onClick={logo.onPick}
              >
                <UploadIcon className="size-4 shrink-0" />
                <span className="truncate">
                  {logo.fileName ?? "Subir logo"}
                </span>
              </Button>
              <span className="text-xs text-muted-foreground">
                PNG, JPG o WEBP · 1 MB
              </span>
            </div>
            {logo.fileName ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar logo"
                onClick={logo.onClear}
              >
                <XIcon className="size-4" />
              </Button>
            ) : null}
          </div>
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
    </>
  )
}
