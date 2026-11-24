"use client"

import { EditAccountAvatarSection } from "@/src/modules/settings/components/sheets/edit-account-avatar-section"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import {
  buildProfilePatch,
  editAccountSchema,
  type EditAccountFormValues,
} from "@/src/modules/settings/lib/edit-account-form"
import type { UpdateProfilePayload } from "@/src/modules/settings/types/profile.types"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { Field, FieldError } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Contact, UserIcon, XIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"

type EditAccountSheetProps = SettingsSheetProps & {
  email: string
}

export function EditAccountSheet({
  open,
  onOpenChange,
  email,
}: EditAccountSheetProps) {
  const { profileQuery, updateProfileMutation } = useProfile()

  const savedFullName = profileQuery.data?.fullName ?? ""
  const savedAvatarUrl = profileQuery.data?.avatarUrl ?? ""
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(savedAvatarUrl)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty: isNameDirty },
  } = useForm<EditAccountFormValues>({
    resolver: zodResolver(editAccountSchema),
    defaultValues: { fullName: savedFullName },
  })

  const formValues = useMemo(
    () => ({ fullName: savedFullName }),
    [savedFullName]
  )

  useProfileSheetFormSync(open, reset, formValues)

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setSelectedAvatarUrl(savedAvatarUrl)
    }
    onOpenChange(nextOpen)
  }

  const isAvatarDirty = selectedAvatarUrl !== savedAvatarUrl
  const isDirty = isNameDirty || isAvatarDirty
  const canSave = isDirty && (!isAvatarDirty || Boolean(selectedAvatarUrl))

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    const payload: UpdateProfilePayload = buildProfilePatch({
      values,
      savedFullName,
      selectedAvatarUrl,
      isAvatarDirty,
    })

    if (Object.keys(payload).length === 0) {
      return
    }

    onOpenChange(false)
    updateProfileMutation.mutate(payload, {
      onSuccess: () => {
        appToast.success({
          text1: "Cuenta actualizada",
          text2: "Tu perfil se guardó correctamente.",
        })
      },
    })
  })

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Cuenta"
          description="Nombre y avatar de tu perfil."
          pending={updateProfileMutation.isPending}
        />
        <SheetBody pending={updateProfileMutation.isPending}>
          <SummarySection title="Nombre completo" icon={Contact}>
            <Controller
              control={control}
              name="fullName"
              render={({ field }) => (
                <Field
                  data-invalid={errors.fullName ? true : undefined}
                  data-disabled={
                    updateProfileMutation.isPending ? true : undefined
                  }
                  className="gap-0.5"
                >
                  <InputGroup className="h-10 overflow-hidden px-1">
                    <InputGroupAddon align="inline-start">
                      <UserIcon className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      autoComplete="name"
                      aria-label="Nombre completo"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                      disabled={updateProfileMutation.isPending}
                      aria-invalid={errors.fullName ? true : undefined}
                    />
                  </InputGroup>
                  {errors.fullName?.message ? (
                    <FieldError>{errors.fullName.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />
            <div className="rounded-2xl bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground">Correo</p>
              <p className="mt-1 text-sm text-muted-foreground">{email}</p>
            </div>
          </SummarySection>

          <EditAccountAvatarSection
            value={selectedAvatarUrl}
            onChange={setSelectedAvatarUrl}
          />
        </SheetBody>
        {!updateProfileMutation.isPending ? (
          <DrawerFooter className={SHEET_FOOTER_CLASS}>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </Button>
            <Button
              disabled={!canSave || updateProfileMutation.isPending}
              className="flex-1"
              onClick={() => void onSubmit()}
            >
              {updateProfileMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : null}
              {updateProfileMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
