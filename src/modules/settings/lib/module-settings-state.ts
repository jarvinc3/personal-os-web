import type { UserModuleEntry } from '@/src/modules/settings/types/module-config.types';

export type ModuleSettingsState = 'unconfigured' | 'disabled' | 'enabled';

export function resolveModuleState(entry?: UserModuleEntry): ModuleSettingsState {
  if (!entry) {
    return 'unconfigured';
  }
  return entry.isEnabled ? 'enabled' : 'disabled';
}
