"use client"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { Switch } from "@/src/shared/components/ui/switch"
import { cn } from "@/src/shared/lib/utils"
import { Eye, EyeOff, KeyRound, type LucideIcon } from "lucide-react"
import {
  useId,
  useState,
  type HTMLInputTypeAttribute,
  type KeyboardEventHandler,
  type ReactNode,
  type Ref,
} from "react"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/src/shared/components/ui/field"

type SelectFieldProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; mark?: ReactNode }[]
  disabled?: boolean
  icon?: LucideIcon
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
  icon: Icon,
}: SelectFieldProps) {
  const selectId = useId()
  const labelId = useId()

  return (
    <Field className="flex flex-col gap-1">
      {label ? (
        <FieldLabel
          id={labelId}
          htmlFor={selectId}
          className="text-sm text-muted-foreground"
        >
          {label}
        </FieldLabel>
      ) : null}
      <Select
        value={value}
        onValueChange={(next) => onChange(next ?? "")}
        disabled={disabled}
        items={options.map(({ value, label }) => ({ value, label }))}
        modal={false}
      >
        <SelectTrigger
          className={cn(
            "relative w-full max-w-full cursor-pointer",
            Icon && "pl-9"
          )}
        >
          {Icon ? (
            <Icon className="pointer-events-none absolute left-3 size-4.5 text-muted-foreground" />
          ) : null}
          <SelectValue placeholder={label}>
            {(() => {
              const selected = options.find((item) => item.value === value)
              if (!selected) {
                return null
              }
              return (
                <span className="flex items-center gap-2">
                  {selected.mark}
                  <span className="truncate">{selected.label}</span>
                </span>
              )
            })()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} side="bottom">
          <SelectGroup>
            {label ? <SelectLabel>{label}</SelectLabel> : null}
            {options.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                <span className="flex items-center gap-2">
                  {item.mark}
                  <span className="truncate">{item.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

type OptionRowProps = {
  label: string
  description?: string
  selected?: boolean
  onPress?: () => void
  trailing?: ReactNode
  icon?: LucideIcon
  iconColor?: string
}

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
        "flex w-full cursor-pointer flex-row items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-100 ease-in-out hover:bg-card/70 active:scale-[0.99] active:bg-muted/80",
        selected ? "border-primary bg-card/50" : "border-border bg-card"
      )}
    >
      {Icon && (
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: iconColor ? `${iconColor}1a` : undefined }}
        >
          <Icon className="size-4.5" style={{ color: iconColor }} />
        </div>
      )}
      <FieldContent>
        <FieldTitle className="text-sm text-muted-foreground">
          {label}
        </FieldTitle>
        <FieldDescription className="text-xs text-muted-foreground">
          {description}
        </FieldDescription>
      </FieldContent>
      {trailing}
    </FieldLabel>
  )
}

type SelectionGridProps<T> = {
  items: T[]
  value: string
  onValueChange: (value: string) => void
  getItemKey: (item: T) => string
  getItemValue: (item: T) => string
  renderCell: (item: T) => ReactNode
}

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
        const itemValue = getItemValue(item)
        const selected = value === itemValue
        return (
          <button
            key={getItemKey(item)}
            type="button"
            onClick={() => onValueChange(itemValue)}
            className={cn(
              "aspect-square overflow-hidden rounded-xl border-2",
              selected ? "border-primary" : "border-transparent"
            )}
          >
            {renderCell(item)}
          </button>
        )
      })}
    </div>
  )
}

type FormTextFieldProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  placeholder?: string
  disabled?: boolean
  error?: string
  invalid?: boolean
  type?: HTMLInputTypeAttribute
  autoComplete?: string
  ariaLabel?: string
  icon?: LucideIcon
  inputRef?: Ref<HTMLInputElement>
  revealable?: boolean
  maxLength?: number
  className?: string
}

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
  type = "text",
  autoComplete,
  ariaLabel,
  icon: Icon,
  inputRef,
  revealable = false,
  maxLength,
  className,
}: FormTextFieldProps) {
  const fieldId = useId()
  const hasError = invalid ?? Boolean(error)
  const FieldIcon = Icon ?? (type === "password" ? KeyRound : undefined)
  const [revealed, setRevealed] = useState(false)
  const canReveal = revealable && type === "password"
  const inputType = canReveal && revealed ? "text" : type

  return (
    <Field
      data-invalid={hasError ? true : undefined}
      data-disabled={disabled ? true : undefined}
      className="gap-1"
    >
      {label ? (
        <FieldLabel htmlFor={fieldId} className="text-sm text-muted-foreground">
          {label}
        </FieldLabel>
      ) : null}
      <InputGroup className={cn("h-10", className)}>
        {FieldIcon ? (
          <InputGroupAddon align="inline-start">
            <FieldIcon className="text-muted-foreground" />
          </InputGroupAddon>
        ) : null}
        <InputGroupInput
          ref={inputRef}
          id={fieldId}
          type={inputType}
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-label={ariaLabel}
          aria-invalid={hasError || undefined}
        />
        {canReveal ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label={
                revealed ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              aria-pressed={revealed}
              disabled={disabled}
              onClick={() => setRevealed((current) => !current)}
            >
              {revealed ? <EyeOff /> : <Eye />}
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}

type SwitchFieldRowProps = {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  icon: LucideIcon
  iconColor?: string
}

export function SwitchFieldRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  icon: Icon,
  iconColor,
}: SwitchFieldRowProps) {
  const id = useId()
  return (
    <div className="flex flex-row items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-3 py-3">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: iconColor ? `${iconColor}1a` : undefined }}
      >
        <Icon className="size-4.5" style={{ color: iconColor }} />
      </div>
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <FieldLabel className="text-sm text-muted-foreground">
          {label}
        </FieldLabel>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}
