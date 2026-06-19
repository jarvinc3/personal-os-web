'use client';

import { useEffect, useMemo } from 'react';
import type { UseFormReset } from 'react-hook-form';

export function useProfileSheetFormSync<T extends Record<string, unknown>>(
  open: boolean,
  reset: UseFormReset<T>,
  values: T,
) {
  const valuesKey = useMemo(() => JSON.stringify(values), [values]);

  useEffect(() => {
    if (open) {
      reset(values);
    }
  }, [open, valuesKey, reset, values]);
}
