import { appToast } from '@/src/shared/lib/app-toast';
import type { FieldErrors, FieldValues, UseFormHandleSubmit } from 'react-hook-form';

export function firstFormErrorMessage(errors: FieldErrors): string | undefined {
  for (const value of Object.values(errors)) {
    if (!value || typeof value !== 'object') continue;
    if ('message' in value && value.message) {
      return String(value.message);
    }
    const nested = firstFormErrorMessage(value as FieldErrors);
    if (nested) return nested;
  }
  return undefined;
}

export function createSheetSubmit<T extends FieldValues>(handleSubmit: UseFormHandleSubmit<T>) {
  return (
    onValid: (values: T) => void | Promise<void>,
    onInvalid?: (errors: FieldErrors<T>) => void,
  ) =>
    handleSubmit(onValid, (errors) => {
      const message = firstFormErrorMessage(errors) ?? 'Revisa los campos del formulario';
      appToast.error({ text1: message });
      onInvalid?.(errors);
    });
}
