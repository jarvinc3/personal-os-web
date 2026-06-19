'use client';

import { Field, FieldError, FieldLabel } from '@/src/shared/components/ui/field';
import { Input } from '@/src/shared/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/src/shared/components/ui/native-select';
import { Switch } from '@/src/shared/components/ui/switch';
import { cn } from '@/src/shared/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type FormSectionProps = {
  title?: string;
  icon?: LucideIcon;
  right?: ReactNode;
  children: ReactNode;
};

export function FormSection({ title, children, right }: FormSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      {title ? (
        <div className="flex flex-row items-center justify-between px-3 pb-1.5 pt-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {right}
        </div>
      ) : null}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background px-3 py-4">
        {children}
      </div>
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
};

export function SelectField({ label, value, onChange, options, disabled }: SelectFieldProps) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <NativeSelect
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((opt) => (
          <NativeSelectOption key={opt.value} value={opt.value}>
            {opt.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </Field>
  );
}

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
};

export function DateField({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
}: DateFieldProps) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
      />
    </Field>
  );
}

type OptionRowProps = {
  label: string;
  description?: string;
  selected?: boolean;
  onPress?: () => void;
  trailing?: ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
};

export function OptionRow({
  label,
  description,
  selected,
  onPress,
  trailing,
  icon: Icon,
  iconColor,
}: OptionRowProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        'flex w-full flex-row items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
        selected ? 'border-primary bg-primary/5' : 'border-border bg-card',
      )}
    >
      {Icon ? (
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: iconColor ? `${iconColor}1a` : undefined }}
        >
          <Icon className="size-[18px]" style={{ color: iconColor }} />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {trailing}
    </button>
  );
}

type SelectionGridProps<T> = {
  items: T[];
  value: string;
  onValueChange: (value: string) => void;
  getItemKey: (item: T) => string;
  getItemValue: (item: T) => string;
  renderCell: (item: T) => ReactNode;
};

export function SelectionGrid<T>({
  items,
  value,
  onValueChange,
  getItemKey,
  getItemValue,
  renderCell,
}: SelectionGridProps<T>) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => {
        const itemValue = getItemValue(item);
        const selected = value === itemValue;
        return (
          <button
            key={getItemKey(item)}
            type="button"
            onClick={() => onValueChange(itemValue)}
            className={cn(
              'aspect-square overflow-hidden rounded-xl border-2',
              selected ? 'border-primary' : 'border-transparent',
            )}
          >
            {renderCell(item)}
          </button>
        );
      })}
    </div>
  );
}

type FormTextFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  invalid?: boolean;
  type?: 'text' | 'password' | 'email';
  autoComplete?: string;
};

export function FormTextField({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  error,
  invalid,
  type = 'text',
  autoComplete,
}: FormTextFieldProps) {
  const hasError = invalid ?? Boolean(error);

  return (
    <Field data-invalid={hasError ? true : undefined}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={hasError || undefined}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

type SwitchFieldRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function SwitchFieldRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: SwitchFieldRowProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
