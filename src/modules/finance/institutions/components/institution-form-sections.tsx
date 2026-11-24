"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { CountryTrigger } from "@/src/modules/finance/shared/components/pickers/country-picker"
import {
  FINANCE_INSTITUTION_TYPE_LABEL,
  FINANCE_INSTITUTION_TYPES,
  type FinanceInstitutionType,
} from "@/src/modules/finance/shared/constants/catalog"
import type { InstitutionFormValues } from "@/src/modules/finance/institutions/lib/institution-form"
import { Button } from "@/src/shared/components/ui/button"
import { ColorPickerSwatch } from "@/src/shared/components/forms/color-picker"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { Label } from "@/src/shared/components/ui/label"
import { SummarySection } from "@/src/shared/components/data-display/summary"
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
            <Field
              data-invalid={errors.name ? true : undefined}
              className="gap-0.5"
            >
              <FieldLabel
                htmlFor="institution-name"
                className="pl-2 text-sm text-muted-foreground"
              >
                Nombre
              </FieldLabel>
              <InputGroup className="h-10 overflow-hidden px-1">
                <InputGroupAddon align="inline-start">
                  <Building2Icon className="text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  id="institution-name"
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                  placeholder="Banreservas"
                  aria-invalid={errors.name ? true : undefined}
                />
              </InputGroup>
              {errors.name?.message ? (
                <FieldError>{errors.name.message}</FieldError>
              ) : null}
            </Field>
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
            <Field
              data-invalid={errors.domain ? true : undefined}
              className="gap-0.5"
            >
              <FieldLabel
                htmlFor="institution-domain"
                className="pl-2 text-sm text-muted-foreground"
              >
                Sitio web
              </FieldLabel>
              <InputGroup className="h-10 overflow-hidden px-1">
                <InputGroupAddon align="inline-start">
                  <SearchIcon className="text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  id="institution-domain"
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                  placeholder="bhd.com.do"
                  aria-invalid={errors.domain ? true : undefined}
                />
              </InputGroup>
              {errors.domain?.message ? (
                <FieldError>{errors.domain.message}</FieldError>
              ) : null}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="shortName"
          render={({ field }) => (
            <Field
              data-invalid={errors.shortName ? true : undefined}
              className="gap-0.5"
            >
              <FieldLabel
                htmlFor="institution-short-name"
                className="pl-2 text-sm text-muted-foreground"
              >
                Nombre corto
              </FieldLabel>
              <InputGroup className="h-10 overflow-hidden px-1">
                <InputGroupAddon align="inline-start">
                  <Building2Icon className="text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  id="institution-short-name"
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                  aria-invalid={errors.shortName ? true : undefined}
                />
              </InputGroup>
              {errors.shortName?.message ? (
                <FieldError>{errors.shortName.message}</FieldError>
              ) : null}
            </Field>
          )}
        />
      </SummarySection>
    </>
  )
}
