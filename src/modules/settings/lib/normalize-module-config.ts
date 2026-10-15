import { DEFAULT_MODULE_CONFIG_BY_SLUG } from "@/src/modules/settings/constants/user-settings-defaults"
import { mergeWithDefaults } from "@/src/modules/settings/lib/settings-value"
import type {
  ConfigurableModuleSlug,
  ModuleConfig,
} from "@/src/modules/settings/types/module-config.types"

export function normalizeModuleConfig<S extends ConfigurableModuleSlug>(
  slug: S,
  raw: Record<string, unknown> | null | undefined
): ModuleConfig<S> {
  const defaults = DEFAULT_MODULE_CONFIG_BY_SLUG[slug] as unknown as Record<
    string,
    unknown
  >
  return mergeWithDefaults(raw, defaults) as ModuleConfig<S>
}
