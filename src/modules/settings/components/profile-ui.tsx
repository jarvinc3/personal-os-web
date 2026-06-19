'use client';

import {
  MODULE_SETTINGS_CARD_GAP,
  MODULE_SETTINGS_CARD_WIDTH,
  ModuleSettingsCard,
} from '@/src/modules/settings/components/module-settings-card';
import { MODULE_SLUGS_ORDER } from '@/src/modules/settings/constants/module-settings-ui';
import type { ModuleSettingsState } from '@/src/modules/settings/lib/module-settings-state';
import type { ModuleSlug } from '@/src/modules/settings/types/module-config.types';
import { Switch } from '@/src/shared/components/ui/switch';

export type ModuleSheetEnableRowProps = {
  state: ModuleSettingsState;
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  disabled?: boolean;
};

function ModuleSheetEnableRow({
  state,
  isEnabled,
  onEnabledChange,
  disabled = false,
}: ModuleSheetEnableRowProps) {
  return (
    <div className="flex flex-row items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3">
      <div className="min-w-0 flex-1 pr-3">
        <p className="text-base font-medium text-foreground">Módulo activo</p>
        {state === 'unconfigured' ? (
          <p className="text-xs text-muted-foreground">
            Se aplicará al guardar la configuración por primera vez.
          </p>
        ) : null}
      </div>
      <Switch checked={isEnabled} onCheckedChange={onEnabledChange} disabled={disabled} />
    </div>
  );
}

type ModuleSettingsRowsProps = {
  onOpenModule: (slug: ModuleSlug) => void;
};

function ModuleSettingsRows({ onOpenModule }: ModuleSettingsRowsProps) {
  return (
    <div
      className="flex gap-3 overflow-x-auto pb-1"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      {MODULE_SLUGS_ORDER.map((slug) => (
        <div key={slug} style={{ scrollSnapAlign: 'start', minWidth: MODULE_SETTINGS_CARD_WIDTH }}>
          <ModuleSettingsCard slug={slug} onOpen={() => onOpenModule(slug)} />
        </div>
      ))}
      <div style={{ minWidth: MODULE_SETTINGS_CARD_GAP }} />
    </div>
  );
}

export { ModuleSettingsRows, ModuleSheetEnableRow };
