'use client';

import { MODULE_SETTINGS_UI } from '@/src/modules/settings/constants/module-settings-ui';
import { MODULE_ACCENTS } from '@/src/modules/settings/constants/settings-metadata';
import { useUserModuleConfig } from '@/src/modules/settings/hooks/use-user-module-config';
import type { ModuleSlug } from '@/src/modules/settings/types/module-config.types';
import { Button } from '@/src/shared/components/ui/button';
import { Separator } from '@/src/shared/components/ui/separator';
import { Switch } from '@/src/shared/components/ui/switch';
import { appToast } from '@/src/shared/lib/app-toast';
import { ChevronRight } from 'lucide-react';

export const MODULE_SETTINGS_CARD_WIDTH = 156;
export const MODULE_SETTINGS_CARD_GAP = 12;

type ModuleSettingsCardProps = {
  slug: ModuleSlug;
  onOpen: () => void;
};

export function ModuleSettingsCard({ slug, onOpen }: ModuleSettingsCardProps) {
  const ui = MODULE_SETTINGS_UI[slug];
  const moduleAccent = MODULE_ACCENTS[slug];
  const Icon = ui.icon;
  const { state, entry, setModuleEnabled, updateMutation } = useUserModuleConfig(slug);

  const handleSwitchChange = async (checked: boolean) => {
    try {
      await setModuleEnabled(checked);
      appToast.success({
        text1: checked ? 'Módulo activado' : 'Módulo desactivado',
        text2: `${ui.label} actualizado.`,
      });
    } catch {
      // Toast handled in mutation onError
    }
  };

  const statusLabel =
    state === 'unconfigured' ? 'Sin configurar' : state === 'disabled' ? 'Desactivado' : 'Activo';

  return (
    <div
      className="flex flex-col rounded-[20px] border border-border bg-card p-2"
      style={{ width: MODULE_SETTINGS_CARD_WIDTH }}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="rounded-xl bg-muted p-2">
          <Icon className="size-[22px]" style={{ color: moduleAccent }} />
        </div>

        {state === 'disabled' ? (
          <Switch
            checked={entry?.isEnabled ?? false}
            onCheckedChange={(checked) => void handleSwitchChange(checked)}
            disabled={updateMutation.isPending}
          />
        ) : state === 'unconfigured' ? (
          <Button variant="secondary" size="sm" onClick={onOpen}>
            Configurar
          </Button>
        ) : (
          <ChevronRight className="mr-2 size-[18px] text-muted-foreground" />
        )}
      </div>

      <Separator className="my-2" />

      <div className="px-2 pb-2">
        {state === 'enabled' ? (
          <button type="button" onClick={onOpen} className="w-full text-left">
            <p className="text-lg font-semibold text-foreground">{ui.label}</p>
            <p className="text-xs text-muted-foreground">{statusLabel}</p>
          </button>
        ) : (
          <div>
            <p className="text-lg font-semibold text-foreground">{ui.label}</p>
            <p className="text-xs text-muted-foreground">{statusLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}
