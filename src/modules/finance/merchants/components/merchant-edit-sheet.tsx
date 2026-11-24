"use client"

import { z } from "zod"

import { merchantIdFromConflict } from "@/src/config/api-client.utils"
import {
  BrandLogo,
  brandPreviewUrl,
} from "@/src/modules/finance/shared/components/brand-logo"
import { BrandPicker } from "@/src/modules/finance/shared/components/brand-picker"
import { CategoryTrigger } from "@/src/modules/finance/shared/components/pickers/category-trigger"
import { CategoryPickerSheet } from "@/src/modules/finance/shared/components/pickers/category-picker-sheet"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useDiscardChanges } from "@/src/modules/finance/shared/hooks/use-discard-changes"
import {
  useCreateMerchant,
  useDeleteMerchantLogo,
  useUpdateMerchant,
  useUploadMerchantLogo,
} from "@/src/modules/finance/shared/hooks/use-merchants"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type {
  FinanceCategoryType,
  FinanceMerchant,
} from "@/src/modules/finance/shared/types/entities"
import { hasSuggestedCategory } from "@/src/modules/finance/merchants/lib/merchant-duplicates"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button, buttonVariants } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CircleCheckIcon,
  ImagePlusIcon,
  PlusIcon,
  SaveIcon,
  StoreIcon,
  TagsIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

const merchantSchema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(120),
  categoryId: z.string(),
  aliases: z.array(z.string()),
  /** Brand domain behind the logo: undefined keeps it, null clears it. */
  domain: z.string().nullish(),
  removeLogo: z.boolean(),
})

type MerchantFormValues = z.infer<typeof merchantSchema>

const CATEGORY_TYPE_OPTIONS = [
  { value: "EXPENSE" as const, label: "Gasto" },
  { value: "INCOME" as const, label: "Ingreso" },
]

function formValuesFrom(merchant: FinanceMerchant | null): MerchantFormValues {
  return {
    name: merchant?.name ?? "",
    categoryId: merchant?.categoryId ?? CATALOG_NONE,
    aliases: merchant?.aliases ?? [],
    domain: undefined,
    removeLogo: false,
  }
}

type MerchantEditSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  merchant: FinanceMerchant | null
  /**
   * «create» uses the same form with no merchant behind: the own logo is
   * uploaded later, on the merchant that already exists.
   */
  mode?: "edit" | "create"
}

export function MerchantEditSheet({
  open,
  onOpenChange,
  merchant,
  mode = "edit",
}: MerchantEditSheetProps) {
  const isCreate = mode === "create"
  const categoriesQuery = useCategories(open)
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data]
  )
  const updateMutation = useUpdateMerchant()
  const createMutation = useCreateMerchant()
  const logoMutation = useUploadMerchantLogo()
  const deleteLogoMutation = useDeleteMerchantLogo()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pickedType, setPickedType] = useState<FinanceCategoryType | null>(null)
  const [aliasDraft, setAliasDraft] = useState("")
  const [conflictMerchantId, setConflictMerchantId] = useState<string | null>(
    null
  )
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "category"
  >("none")

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<MerchantFormValues>({
    resolver: zodResolver(merchantSchema),
    defaultValues: formValuesFrom(merchant),
  })

  function handleOpenChange(next: boolean) {
    if (!next) {
      setConflictMerchantId(null)
      setAliasDraft("")
    }
    onOpenChange(next)
  }

  const { requestOpenChange, discardChangesDialog } = useDiscardChanges({
    isDirty,
    onOpenChange: handleOpenChange,
  })

  // The form is the only source of the draft: opening it reloads the merchant.
  useEffect(() => {
    if (!open) {
      return
    }
    reset(formValuesFrom(merchant))
  }, [open, merchant, reset])

  const values = useWatch({ control })
  const name = values.name ?? ""
  const aliases = values.aliases ?? []
  const selectedCategory =
    categories.find((category) => category.id === values.categoryId) ?? null
  const categoryType: FinanceCategoryType =
    pickedType ?? selectedCategory?.type ?? "EXPENSE"
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    logoMutation.isPending ||
    deleteLogoMutation.isPending
  const suggested = merchant ? hasSuggestedCategory(merchant) : false
  const previewDomain =
    values.domain === undefined ? (merchant?.domain ?? null) : values.domain
  const previewLogo = values.removeLogo
    ? null
    : previewDomain
      ? brandPreviewUrl(previewDomain)
      : merchant?.logoUrl

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  async function onSubmit(values: MerchantFormValues) {
    setConflictMerchantId(null)
    const body = {
      categoryId: values.categoryId === CATALOG_NONE ? null : values.categoryId,
      aliases: values.aliases,
      ...(values.domain === undefined ? {} : { domain: values.domain }),
    }
    try {
      if (isCreate) {
        await createMutation.mutateAsync({ name: values.name.trim(), ...body })
        appToast.success({ text1: "Comercio creado" })
      } else {
        if (!merchant) {
          return
        }
        await updateMutation.mutateAsync({
          id: merchant.id,
          body: { name: values.name.trim(), ...body },
        })
        if (values.removeLogo) {
          await deleteLogoMutation.mutateAsync(merchant.id)
        }
        appToast.success({ text1: "Comercio actualizado" })
      }
      onOpenChange(false)
    } catch (error) {
      const existingId = merchantIdFromConflict(error)
      if (existingId) {
        setConflictMerchantId(existingId)
        return
      }
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  /** «Confirmar» deja la categoría sugerida como puesta a mano. */
  async function confirmSuggestedCategory() {
    if (!merchant?.categoryId) {
      return
    }
    try {
      await updateMutation.mutateAsync({
        id: merchant.id,
        body: { categoryId: merchant.categoryId },
      })
      appToast.success({ text1: "Categoría confirmada" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onPickLogo(file: File | undefined) {
    if (!merchant || !file) {
      return
    }
    try {
      await logoMutation.mutateAsync({ id: merchant.id, file })
      setValue("removeLogo", false)
      setValue("domain", undefined)
      appToast.success({ text1: "Logo actualizado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  function addAlias() {
    const next = aliasDraft.trim()
    if (!next) {
      return
    }
    const repeated = aliases.some(
      (alias) => alias.trim().toLowerCase() === next.toLowerCase()
    )
    if (repeated) {
      appToast.error({ text1: "Ese nombre ya está en la lista" })
      return
    }
    setValue("aliases", [...aliases, next], { shouldDirty: true })
    setAliasDraft("")
  }

  function removeAlias(alias: string) {
    setValue(
      "aliases",
      aliases.filter((entry) => entry !== alias),
      { shouldDirty: true }
    )
  }

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={requestOpenChange}
        helpAction={
          <SheetHelpAction
            sheetKey={
              isCreate
                ? FINANCE_SHEET_KEYS.merchantCreate
                : FINANCE_SHEET_KEYS.merchantEdit
            }
          />
        }
        pending={isPending}
        title={isCreate ? "Nuevo comercio" : "Editar comercio"}
        description={
          isCreate
            ? "Escribe el nombre y, si quieres, su categoría. El logo propio se añade después, al editar el comercio."
            : "Cambia el nombre, el logo, la categoría y los nombres alternativos."
        }
        actions={{
          submit: (
            <Button
              type="button"
              className="flex-1"
              disabled={isPending || (!isCreate && (!isDirty || !merchant))}
              onClick={submitForm(onSubmit)}
            >
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
        <SummarySection title="Comercio" icon={StoreIcon}>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
            <BrandLogo
              name={name.trim() || merchant?.name || "Comercio"}
              logoUrl={previewLogo}
              size={40}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {name.trim() || "Comercio"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {previewDomain ?? merchant?.normalizedKey ?? "—"}
              </p>
            </div>
            {isCreate ? null : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlusIcon className="size-4 shrink-0" />
                  Imagen
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    void onPickLogo(event.target.files?.[0])
                    event.target.value = ""
                  }}
                />
              </>
            )}
          </div>

          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Field
                data-invalid={errors.name ? true : undefined}
                className="gap-0.5"
              >
                <FieldLabel
                  htmlFor="merchant-name"
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Nombre
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <StoreIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="merchant-name"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    aria-invalid={errors.name ? true : undefined}
                  />
                </InputGroup>
                {errors.name?.message ? (
                  <FieldError>{errors.name.message}</FieldError>
                ) : null}
              </Field>
            )}
          />

          {conflictMerchantId ? (
            <Alert variant="destructive">
              <StoreIcon />
              <AlertTitle>Ese nombre ya existe</AlertTitle>
              <AlertDescription>
                Otro comercio usa ese nombre o uno de sus nombres alternativos.
              </AlertDescription>
              <div className="col-start-2 mt-2">
                <Link
                  href={APP_ROUTES.app.financeMerchant(conflictMerchantId)}
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" })
                  )}
                >
                  <StoreIcon className="size-4 shrink-0" />
                  Abrir el comercio existente
                </Link>
              </div>
            </Alert>
          ) : null}
        </SummarySection>

        <SummarySection title="Logo" icon={ImagePlusIcon}>
          <BrandPicker
            onSelect={(brand) => {
              setValue("domain", brand.domain, { shouldDirty: true })
              setValue("removeLogo", false, { shouldDirty: true })
            }}
          />
          {!isCreate && previewLogo ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => {
                setValue("removeLogo", true, { shouldDirty: true })
                setValue("domain", null, { shouldDirty: true })
              }}
            >
              <Trash2Icon className="size-4 shrink-0" />
              Quitar logo
            </Button>
          ) : null}
        </SummarySection>

        <SummarySection title="Nombres alternativos" icon={TagsIcon}>
          {aliases.length === 0 ? (
            <p className="px-2 text-xs text-muted-foreground">
              Sin nombres alternativos. Agrega las otras formas en que el banco
              escribe este comercio.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 px-2">
              {aliases.map((alias) => (
                <span
                  key={alias}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs"
                >
                  {alias}
                  <button
                    type="button"
                    aria-label={`Quitar ${alias}`}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeAlias(alias)}
                  >
                    <XIcon className="size-3.5" aria-hidden />
                  </button>
                </span>
              ))}
            </div>
          )}
          <Field className="gap-0.5">
            <FieldLabel
              htmlFor="merchant-alias"
              className="pl-2 text-sm text-muted-foreground"
            >
              Nuevo nombre
            </FieldLabel>
            <InputGroup className="h-10 overflow-hidden px-1">
              <InputGroupAddon align="inline-start">
                <TagsIcon className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="merchant-alias"
                value={aliasDraft}
                onChange={(event) => setAliasDraft(event.target.value)}
                onBlur={() => undefined}
                placeholder="Como aparece en el banco"
              />
            </InputGroup>
          </Field>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!aliasDraft.trim()}
            onClick={addAlias}
          >
            <PlusIcon className="size-4 shrink-0" />
            Agregar nombre
          </Button>
        </SummarySection>

        <SummarySection title="Categoría" icon={StoreIcon}>
          <ToggleGroup
            value={[categoryType]}
            onValueChange={(next) => {
              if (next.length === 0) {
                return
              }
              const nextType = next[0]
              setPickedType(nextType)
              setValue("categoryId", CATALOG_NONE, { shouldDirty: true })
            }}
            variant="outline"
            size="sm"
            aria-label="Tipo de categoría"
          >
            {CATEGORY_TYPE_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="rounded-full"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Field className="gap-1">
            <FieldLabel className="flex items-center gap-2 text-sm text-muted-foreground">
              Categoría por defecto
              {suggested ? <Badge variant="warning">Sugerida</Badge> : null}
            </FieldLabel>
            <CategoryTrigger
              category={selectedCategory}
              onClick={() => openPicker("category")}
            />
            {errors.categoryId?.message ? (
              <FieldError>{errors.categoryId.message}</FieldError>
            ) : null}
          </Field>

          {suggested ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => void confirmSuggestedCategory()}
            >
              <CircleCheckIcon className="size-4 shrink-0" />
              Confirmar categoría
            </Button>
          ) : null}
        </SummarySection>
      </BottomSheet>

      <CategoryPickerSheet
        open={picker === "category"}
        onOpenChange={closeHandlerFor("category")}
        categories={categories}
        categoryType={categoryType}
        onSelect={(next) => setValue("categoryId", next, { shouldDirty: true })}
      />

      {discardChangesDialog}
    </>
  )
}
