'use client';

import { useUserModuleConfig } from '@/src/modules/settings/hooks/use-user-module-config';
import type { ModuleSlug } from '@/src/modules/settings/types/module-config.types';
import { useCallback, useMemo, useState } from 'react';

export function useModuleSheetEnable(slug: ModuleSlug) {
  const { state, entry } = useUserModuleConfig(slug);

  const savedIsEnabled = entry?.isEnabled ?? false;

  const [pendingEnabled, setPendingEnabled] = useState(
    state === 'unconfigured' ? false : savedIsEnabled,
  );

  const isEnabledDirty = useMemo(
    () => (state === 'unconfigured' ? pendingEnabled !== false : pendingEnabled !== savedIsEnabled),
    [pendingEnabled, savedIsEnabled, state],
  );

  const handleEnabledChange = useCallback((checked: boolean) => {
    setPendingEnabled(checked);
  }, []);

  const syncPendingOnSheetOpen = useCallback(() => {
    setPendingEnabled(state === 'unconfigured' ? false : Boolean(entry?.isEnabled));
  }, [entry?.isEnabled, state]);

  return {
    state,
    sheetEnabled: pendingEnabled,
    pendingEnabled,
    isEnabledDirty,
    handleEnabledChange,
    syncPendingOnSheetOpen,
  };
}
