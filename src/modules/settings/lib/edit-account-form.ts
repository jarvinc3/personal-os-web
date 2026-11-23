import type { UpdateProfilePayload } from "@/src/modules/settings/types/profile.types"
import { z } from "zod"

export const editAccountSchema = z.object({
  fullName: z.string().trim().min(2, "El nombre es obligatorio"),
})

export type EditAccountFormValues = z.infer<typeof editAccountSchema>

type BuildProfilePatchInput = {
  values: EditAccountFormValues
  savedFullName: string
  selectedAvatarUrl: string
  isAvatarDirty: boolean
}

/** Only the fields the person changed; an empty patch means nothing to send. */
export function buildProfilePatch({
  values,
  savedFullName,
  selectedAvatarUrl,
  isAvatarDirty,
}: BuildProfilePatchInput): UpdateProfilePayload {
  return {
    ...(values.fullName !== savedFullName ? { fullName: values.fullName } : {}),
    ...(isAvatarDirty && selectedAvatarUrl
      ? { avatarUrl: selectedAvatarUrl }
      : {}),
  }
}
