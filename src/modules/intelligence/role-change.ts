import type { AiRole } from "@/src/modules/intelligence/types/intelligence.types"

export const ROLE_LABELS: Record<AiRole, string> = {
  USER: "Usuario",
  CONTRIBUTOR: "Colaborador",
  ADMIN: "Administrador",
}

/** Lo que cada rol agrega sobre el anterior; se explica al cambiarlo. */
export const ROLE_CAPABILITIES: Record<AiRole, readonly string[]> = {
  USER: [
    "Ver su propio correo, su conocimiento y sus verificaciones",
    "Exportar y borrar sus datos de IA",
  ],
  CONTRIBUTOR: [
    "Ver su propio correo, su conocimiento y sus verificaciones",
    "Exportar y borrar sus datos de IA",
    "Aportar patrones anónimos al conocimiento global",
  ],
  ADMIN: [
    "Ver su propio correo, su conocimiento y sus verificaciones",
    "Exportar y borrar sus datos de IA",
    "Aportar patrones anónimos al conocimiento global",
    "Revisar el conocimiento global: promover, revertir y cambiar roles",
  ],
}

export type RoleChange = {
  gains: readonly string[]
  loses: readonly string[]
}

/**
 * Qué gana y qué pierde una cuenta al cambiar de rol. Las capacidades de cada
 * rol son acumulativas, así que la diferencia se lee como dos listas.
 */
export function roleChange({
  currentRole,
  nextRole,
}: {
  currentRole: AiRole
  nextRole: AiRole
}): RoleChange {
  const current = new Set(ROLE_CAPABILITIES[currentRole])
  const next = new Set(ROLE_CAPABILITIES[nextRole])
  return {
    gains: ROLE_CAPABILITIES[nextRole].filter(
      (capability) => !current.has(capability)
    ),
    loses: ROLE_CAPABILITIES[currentRole].filter(
      (capability) => !next.has(capability)
    ),
  }
}
