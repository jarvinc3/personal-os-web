"use client"

import {
  AVATAR_OPTIONS,
  type AvatarOption,
} from "@/src/modules/settings/constants/avatar-options"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import type { UpdateProfilePayload } from "@/src/modules/settings/types/profile.types"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  FormTextField,
  SelectionGrid,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Contact, Contact2, UserIcon, XIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  editAccountSchema,
  type EditAccountFormValues,
} from "@/src/modules/settings/lib/edit-account-form"

type EditAccountSheetProps = SettingsSheetProps & {
  email: string
}

export function EditAccountSheet({
  open,
  onOpenChange,
  email,
}: EditAccountSheetProps) {
  const { profileQuery, updateProfileMutation } = useProfile()
  const router = useRouter()

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
    const payload: UpdateProfilePayload = {}

    if (values.fullName !== savedFullName) {
      payload.fullName = values.fullName
    }
    if (isAvatarDirty && selectedAvatarUrl) {
      payload.avatarUrl = selectedAvatarUrl
    }

    if (Object.keys(payload).length === 0) {
      return
    }

    await updateProfileMutation.mutateAsync(payload)
    appToast.success({
      text1: "Cuenta actualizada",
      text2: "Tu perfil se guardó correctamente.",
    })
    onOpenChange(false)
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Cuenta"
      description="Nombre y avatar de tu perfil."
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            <XIcon className="size-4 shrink-0" />
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            disabled={!canSave || updateProfileMutation.isPending}
            className="flex-1"
            onClick={onSubmit}
          >
            {updateProfileMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            {updateProfileMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        ),
      }}
    >
      <SummarySection title="Nombre completo" icon={Contact}>
        <Controller
          control={control}
          name="fullName"
          render={({ field }) => (
            <FormTextField
              icon={UserIcon}
              autoComplete="name"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={updateProfileMutation.isPending}
              error={errors.fullName?.message}
            />
          )}
        />
        <div className="rounded-2xl bg-muted px-4 py-3">
          <p className="text-xs text-muted-foreground">Correo</p>
          <p className="mt-1 text-sm text-muted-foreground">{email}</p>
        </div>
      </SummarySection>

      <SummarySection title="Avatar" icon={Contact2}>
        <SelectionGrid
          items={AVATAR_OPTIONS}
          value={selectedAvatarUrl}
          onValueChange={setSelectedAvatarUrl}
          getItemKey={(item: AvatarOption) => item.id}
          getItemValue={(item: AvatarOption) => item.url}
          renderCell={(item: AvatarOption) => (
            <Image
              src={item.url}
              alt="Opción de avatar"
              width={80}
              height={80}
              className="size-full object-cover"
              unoptimized
            />
          )}
        />
      </SummarySection>
    </BottomSheet>
  )
}
