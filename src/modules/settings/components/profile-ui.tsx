'use client';

import type { ModuleSettingsState } from '@/src/modules/settings/lib/module-settings-state';
import type { ModuleSlug } from '@/src/modules/settings/types/module-config.types';
import { Button } from '@/src/shared/components/ui/button';
import { Separator } from '@/src/shared/components/ui/separator';
import { Switch } from '@/src/shared/components/ui/switch';
import { MODULE_REGISTRY, MODULE_SLUGS_ORDER } from '@/src/shared/constants/module-registry';
import { appToast } from '@/src/shared/lib/app-toast';
import { Settings } from 'lucide-react';
import { useId } from 'react';
import { useUserModuleConfig } from '../hooks/use-user-module-config';

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
  const id = useId();
  return (
    <div className="flex flex-row justify-between items-center px-4 py-3 rounded-2xl border border-border/60 bg-card">
      <label htmlFor={id} className="flex-1 pr-3 min-w-0 cursor-pointer">
        <p className="text-base font-medium text-foreground">Módulo activo</p>
        {state === 'unconfigured' ? (
          <p className="text-xs text-muted-foreground">
            Se aplicará al guardar la configuración por primera vez.
          </p>
        ) : null}
      </label>
      <Switch
        id={id}
        checked={isEnabled}
        onCheckedChange={onEnabledChange}
        disabled={disabled}
      />
    </div>
  );
}

type ModuleSettingsRowsProps = {
  onOpenModule: (slug: ModuleSlug) => void;
};

function ModuleSettingsRows({ onOpenModule }: ModuleSettingsRowsProps) {
  return (
    <div
      className="flex overflow-x-auto gap-3 pb-1 scrollbar-hide"
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

export const MODULE_SETTINGS_CARD_WIDTH = 156;
export const MODULE_SETTINGS_CARD_GAP = 12;

type ModuleSettingsCardProps = {
  slug: ModuleSlug;
  onOpen: () => void;
};

function ModuleSettingsCard({ slug, onOpen }: ModuleSettingsCardProps) {
  const moduleDef = MODULE_REGISTRY[slug];
  const Icon = moduleDef.icon;
  const { state, entry, setModuleEnabled, updateMutation } = useUserModuleConfig(slug);

  const handleSwitchChange = async (checked: boolean) => {
    try {
      await setModuleEnabled(checked);
      appToast.success({
        text1: checked ? 'Módulo activado' : 'Módulo desactivado',
        text2: `${moduleDef.label} actualizado.`,
      });
    } catch {
      // Toast handled in mutation onError
    }
  };

  const statusLabel =
    state === 'unconfigured' ? 'Sin configurar' : state === 'disabled' ? 'Desactivado' : 'Activo';

  return (
    <div
      className="flex flex-col rounded-[20px] border border-border bg-card p-2 cursor-pointer hover:bg-muted/50 active:bg-muted/50 active:scale-[0.99] transition-all duration-100 ease-in-out"
      style={{ width: MODULE_SETTINGS_CARD_WIDTH }}
      onClick={onOpen}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="p-2 rounded-xl bg-muted">
          <Icon className="size-[22px]" style={{ color: moduleDef.accent }} />
        </div>

        {state === 'unconfigured' ? (
          <div onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="icon">
              <Settings className="size-4 text-foreground" />
            </Button>
          </div>
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={entry?.isEnabled ?? false}
              onCheckedChange={(checked) => void handleSwitchChange(checked)}
              disabled={updateMutation.isPending}
            />
          </div>
        )}
      </div>

      <Separator className="my-2" />

      <div className="px-2 mb-4 truncate whitespace-nowrap text-ellipsis">
        <p className="text-lg font-semibold text-foreground">{moduleDef.label}</p>
        <p className="text-xs text-muted-foreground">{statusLabel}</p>
      </div>
    </div>
  );
}


export { ModuleSettingsCard, ModuleSettingsRows, ModuleSheetEnableRow };
