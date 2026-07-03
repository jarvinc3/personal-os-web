import { MODULE_SHEET_PARAM_KEYS } from '@/src/modules/settings/constants/module-sheet-keys';
import type { ModuleSlug } from '@/src/modules/settings/types/module-config.types';
import { MODULE_SLUGS_ORDER } from '@/src/shared/constants/module-registry';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export function useModuleSheetNav() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeModuleSlug = useMemo((): ModuleSlug | null => {
    const sheet = searchParams.get('sheet');
    if (!sheet) return null;
    return MODULE_SLUGS_ORDER.find((slug) => MODULE_SHEET_PARAM_KEYS[slug] === sheet) ?? null;
  }, [searchParams]);

  const setModuleOpen = useCallback(
    (slug: ModuleSlug, open: boolean) => {
      const next = new URLSearchParams(searchParams.toString());

      if (open) {
        next.set('sheet', MODULE_SHEET_PARAM_KEYS[slug]);
      } else {
        next.delete('sheet');
      }

      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [searchParams, router, pathname],
  );

  const openModule = useCallback(
    (slug: ModuleSlug) => setModuleOpen(slug, true),
    [setModuleOpen],
  );

  const isOpen = useCallback(
    (slug: ModuleSlug) => searchParams.get('sheet') === MODULE_SHEET_PARAM_KEYS[slug],
    [searchParams],
  );

  return { activeModuleSlug, openModule, isOpen, setModuleOpen };
}
