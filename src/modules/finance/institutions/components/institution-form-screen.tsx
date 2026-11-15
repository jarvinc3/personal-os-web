"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { SaveIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"

import { brandPreviewUrl } from "@/src/modules/finance/shared/components/brand-logo"
import { FinanceFormScreen } from "@/src/modules/finance/shared/components/forms/form-screen"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import {
  buildInstitutionCardFromCatalog,
  InstitutionWalletCard,
} from "@/src/modules/finance/products"
import { CountryPickerSheet } from "@/src/modules/finance/shared/components/pickers/country-picker"
import { usePicker } from "@/src/shared/hooks/use-picker"
import type { FinanceInstitutionType } from "@/src/modules/finance/shared/constants/catalog"
import {
  useCreateInstitution,
  useUpdateInstitution,
  useUploadInstitutionLogo,
} from "@/src/modules/finance/shared/hooks/use-institutions"
import { buildCreateInstitutionBody } from "@/src/modules/finance/shared/lib/catalog-payloads"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceInstitution } from "@/src/modules/finance/shared/types/entities"
import { InstitutionCatalogPicker } from "@/src/modules/finance/institutions/components/institution-catalog-picker"
import { InstitutionFormSections } from "@/src/modules/finance/institutions/components/institution-form-sections"
import {
  InstitutionProductStep,
  type InstitutionProductChoice,
} from "@/src/modules/finance/institutions/components/institution-product-step"
import {
  type InstitutionCatalogEntry,
  type InstitutionCatalogFilter,
} from "@/src/modules/finance/institutions/lib/institution-catalog"
import {
  institutionSchema,
  type InstitutionFormValues,
} from "@/src/modules/finance/institutions/lib/institution-form"
import { appToast } from "@/src/shared/lib/app-toast"

type WizardStep = "catalog" | "form" | "next"

type InstitutionFormScreenProps = {
  institution?: FinanceInstitution | null
  /** Valores del correo para el alta desde una propuesta. */
  prefill?: Partial<InstitutionFormValues>
  /** Abre el formulario sin el catálogo (paso a paso de propuestas). */
  startAtForm?: boolean
  /** Alta desde una propuesta: entrega la institución creada. */
  onCreated?: (institution: FinanceInstitution) => void
  onDone: () => void
  onAddProduct?: (
    choice: InstitutionProductChoice,
    institutionId: string
  ) => void
}

function toFormValues(
  institution: FinanceInstitution | null,
  prefill: Partial<InstitutionFormValues> = {}
): InstitutionFormValues {
  return {
    name: institution?.name ?? prefill.name ?? "",
    color: institution?.color ?? prefill.color ?? "",
    country: institution?.country ?? prefill.country ?? "DO",
    type: institution?.type ?? prefill.type ?? "bank",
    shortName: institution?.shortName ?? prefill.shortName ?? "",
    sortOrder:
      institution?.sortOrder !== undefined
        ? String(institution.sortOrder)
        : (prefill.sortOrder ?? "0"),
    domain: institution?.domain ?? prefill.domain ?? "",
  }
}

export function InstitutionFormScreen({
  institution = null,
  prefill = {},
  startAtForm = false,
  onCreated,
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
  const [step, setStep] = useState<WizardStep>(
    isEdit || startAtForm ? "form" : "catalog"
  )
  const [filter, setFilter] = useState<InstitutionCatalogFilter>("bank")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const { picker, openPicker, closeHandlerFor } = usePicker<"none" | "country">(
    "none"
  )
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
    defaultValues: toFormValues(institution, prefill),
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
  const { config, formatLocale } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  const previewLogo =
    brandPreviewUrl(institutionDomain) ??
    (institution?.domain === institutionDomain ? institution?.logoUrl : null)
  const previewCard = buildInstitutionCardFromCatalog({
    institution: {
      id: institution?.id ?? "preview",
      name: institutionName.trim() || "Nueva institución",
      type: institutionType,
      shortName: null,
      domain: institutionDomain || null,
      color: institutionColor || null,
      logoUrl: previewLogo,
      country: institutionCountry || null,
      isActive: true,
      isSystem: false,
    },
    counts: { accounts: 0 },
    balanceAmount: formatFinanceMoney("0", display),
  })

  useEffect(() => {
    if (!isEdit) {
      return
    }
    reset(toFormValues(institution, prefill))
  }, [isEdit, institution, prefill, reset])

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

  function startBlank() {
    reset(toFormValues(null))
    setStep("form")
  }

  function selectType(type: FinanceInstitutionType) {
    setValue("type", type, { shouldValidate: true })
  }

  function clearLogo() {
    setLogoFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
      if (onCreated) {
        onCreated(saved)
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
      <InstitutionCatalogPicker
        filter={filter}
        onFilterChange={setFilter}
        onSelectEntry={applyCatalogEntry}
        onStartBlank={startBlank}
      />
    )
  }

  if (step === "next" && createdId) {
    return (
      <InstitutionProductStep
        institutionId={createdId}
        name={institutionName}
        card={previewCard}
        onAddProduct={onAddProduct}
        onSkip={onDone}
      />
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
        <InstitutionWalletCard
          card={previewCard}
          variant="compact"
          detail="balance"
        />
        <InstitutionFormSections
          form={{ control, errors, onSelectType: selectType }}
          identity={{
            name: institutionName,
            country: institutionCountry,
            type: institutionType,
          }}
          logo={{
            previewUrl: previewLogo,
            fileName: logoFile?.name ?? null,
            onPick: () => fileInputRef.current?.click(),
            onClear: clearLogo,
          }}
          onOpenCountry={() => openPicker("country")}
        />
      </FinanceFormScreen>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
      />

      <CountryPickerSheet
        open={picker === "country"}
        onOpenChange={closeHandlerFor("country")}
        value={institutionCountry}
        onSelect={(next) => setValue("country", next, { shouldValidate: true })}
      />
    </>
  )
}
