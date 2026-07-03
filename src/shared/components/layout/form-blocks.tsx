'use client';

import { Input } from '@/src/shared/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/src/shared/components/ui/native-select';
import { Switch } from '@/src/shared/components/ui/switch';
import { cn } from '@/src/shared/lib/utils';
import { type LucideIcon } from 'lucide-react';
import { HTMLInputTypeAttribute, useId, type ReactNode } from 'react';

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from '@/src/shared/components/ui/field';

type FormSectionProps = {
  title?: string;
  icon?: LucideIcon;
  right?: ReactNode;
  children: ReactNode;
};

export function FormSection({ title, children, right, icon: Icon }: FormSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      {title && (
        <div className="flex flex-row items-center justify-between px-3 pb-1.5 pt-3">
          <div className="flex gap-2 items-center">
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
          {right && (
            <div className="flex-row gap-2 items-center">
              {right}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-3 px-3 py-4 rounded-2xl border border-border bg-background">
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
  const selectId = useId();
  const labelId = useId();

  return (
    <Field>
      <FieldLabel id={labelId} htmlFor={selectId}>
        {label}
      </FieldLabel>
      <NativeSelect
        id={selectId}
        aria-labelledby={labelId}
        title={label}
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
    <FieldLabel
      onClick={onPress}
      className={cn(
        'flex flex-row gap-3 items-center px-3 py-3 w-full text-left rounded-xl border cursor-pointer hover:bg-card/70 active:bg-muted/80 active:scale-[0.99] transition-all duration-100 ease-in-out',
        selected ? 'border-primary bg-card/50' : 'border-border bg-card',
      )}
    >
      {Icon && (
        <div
          className="flex justify-center items-center rounded-md size-9 shrink-0"
          style={{ backgroundColor: iconColor ? `${iconColor}1a` : undefined }}
        >
          <Icon className="size-[18px]" style={{ color: iconColor }} />
        </div>
      )}
      <FieldContent>
        <FieldTitle>{label}</FieldTitle>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
      {trailing}
    </FieldLabel>
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
              'overflow-hidden rounded-xl border-2 aspect-square',
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
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  icon?: LucideIcon;
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
  icon: Icon
}: FormTextFieldProps) {
  const hasError = invalid ?? Boolean(error);

  return (
    <Field data-invalid={hasError ? true : undefined}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <div className="flex relative flex-row gap-2 items-center">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className="size-[18px]" />
          </div>
        )}
        <Input
          className={cn(Icon && "pl-9")}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={hasError || undefined}
        />
      </div>
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
    <div className="flex flex-row gap-3 justify-between items-center px-4 py-3 rounded-xl border border-border/60 bg-card">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
