'use client';

import { Button } from '@/src/shared/components/ui/button';
import { Input } from '@/src/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select";
import { Switch } from '@/src/shared/components/ui/switch';
import { cn } from '@/src/shared/lib/utils';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import {
  useId,
  useState,
  type HTMLInputTypeAttribute,
  type KeyboardEventHandler,
  type ReactNode,
  type Ref,
} from 'react';

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from '@/src/shared/components/ui/field';

type SelectFieldProps = {
  label?: string;
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
      {label ? (
        <FieldLabel id={labelId} htmlFor={selectId}>
          {label}
        </FieldLabel>
      ) : null}
      <Select
        value={value}
        onValueChange={(next) => onChange(next ?? '')}
        disabled={disabled}
        items={options}
        modal={false}
      >
        <SelectTrigger className="w-full max-w-full cursor-pointer">
          <SelectValue placeholder={label}>
            {options.find((item) => item.value === value)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} side="bottom">
          <SelectGroup>
            {label ? <SelectLabel>{label}</SelectLabel> : null}
            {options.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
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
          <Icon className="size-4.5" style={{ color: iconColor }} />
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
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  invalid?: boolean;
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  icon?: LucideIcon;
  inputRef?: Ref<HTMLInputElement>;
  revealable?: boolean;
};

export function FormTextField({
  label,
  value,
  onChange,
  onBlur,
  onKeyDown,
  placeholder,
  disabled,
  error,
  invalid,
  type = 'text',
  autoComplete,
  icon: Icon,
  inputRef,
  revealable = false,
}: FormTextFieldProps) {
  const hasError = invalid ?? Boolean(error);
  const [revealed, setRevealed] = useState(false);
  const canReveal = revealable && type === 'password';
  const inputType = canReveal && revealed ? 'text' : type;

  return (
    <Field data-invalid={hasError ? true : undefined}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <div className="flex relative flex-row gap-2 items-center">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className="size-4.5" />
          </div>
        )}
        <Input
          ref={inputRef}
          className={cn(Icon && "pl-9", canReveal && "pr-10")}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={hasError || undefined}
        />
        {canReveal ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={revealed}
            disabled={disabled}
            onClick={() => setRevealed((current) => !current)}
          >
            {revealed ? <EyeOff /> : <Eye />}
          </Button>
        ) : null}
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
  const id = useId();
  return (
    <div className="flex flex-row gap-3 justify-between items-center px-4 py-3 rounded-full border border-border/60 bg-card">
      <label htmlFor={id} className="flex-1 min-w-0 cursor-pointer">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
