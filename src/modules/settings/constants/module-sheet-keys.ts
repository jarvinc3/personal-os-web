import type { ModuleSlug } from "@/src/modules/settings/types/module-config.types"

export const MODULE_SHEET_PARAM_KEYS: Record<ModuleSlug, string> = {
  finance: "finance-sheet",
  agenda: "agenda-sheet",
  projects: "projects-sheet",
  health: "health-sheet",
  keepAwake: "keep-awake-sheet",
}
