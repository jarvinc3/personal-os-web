import type {
  UpdateProfilePayload,
  UserProfile,
} from "@/src/modules/settings/types/profile.types"

/** Profile with the fields of a pending PATCH applied, before the server answers. */
export function applyProfilePatch(
  profile: UserProfile,
  payload: UpdateProfilePayload
): UserProfile {
  return {
    ...profile,
    ...(payload.fullName !== undefined ? { fullName: payload.fullName } : {}),
    ...(payload.avatarUrl !== undefined
      ? { avatarUrl: payload.avatarUrl }
      : {}),
    ...(payload.preferences !== undefined
      ? { preferences: payload.preferences }
      : {}),
  }
}
