"use client"

import { Button } from "@/src/shared/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { CheckIcon, ChevronDownIcon, type LucideIcon } from "lucide-react"
import { useState, type ReactNode } from "react"

type WheelFieldProps = {
  label?: string
  /** Texto de la fila cerrada. */
  valueLabel: string
  icon: LucideIcon
  error?: string
  disabled?: boolean
  /** Abre el panel al montar cuando todavía no hay un valor. */
  defaultOpen?: boolean
  /** Control que comparte la fila del disparador. El panel sigue a ancho completo. */
  aside?: ReactNode
  /**
   * Pie del panel. Si no se pasa, queda el botón Listo a la derecha.
   * `close` cierra el panel.
   */
  footer?: (close: () => void) => ReactNode
  children: ReactNode
}

/**
 * Fila que abre una rueda a ancho completo y la cierra con Listo.
 * Es la única presentación de una rueda en una pantalla.
 */
export function WheelField({
  label,
  valueLabel,
  icon: Icon,
  error,
  disabled = false,
  defaultOpen = false,
  aside,
  footer,
  children,
}: WheelFieldProps) {
  const [open, setOpen] = useState(defaultOpen)

  function close() {
    setOpen(false)
  }

  return (
    <Field
      data-invalid={error ? true : undefined}
      data-disabled={disabled ? true : undefined}
      className="gap-1"
    >
      {label ? (
        <FieldLabel className="text-sm text-muted-foreground">
          {label}
        </FieldLabel>
      ) : null}
      <Collapsible
        className="w-full"
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <div className="flex w-full items-center gap-2">
          <CollapsibleTrigger
            disabled={disabled}
            className={cn(
              "flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-card px-3 text-left",
              PRESSABLE_CLASS,
              disabled && "opacity-50"
            )}
          >
            <Icon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="min-w-0 flex-1 text-sm font-medium">
              {valueLabel}
            </span>
            <ChevronDownIcon
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
              aria-hidden
            />
          </CollapsibleTrigger>
          {aside ? <div className="w-auto shrink-0">{aside}</div> : null}
        </div>
        <CollapsibleContent className="w-full pt-3">
          {children}
          {footer ? (
            footer(close)
          ) : (
            <div className="mt-3 flex w-full items-center">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn("ml-auto", PRESSABLE_CLASS)}
                disabled={disabled}
                onClick={close}
              >
                <CheckIcon className="size-4 shrink-0" />
                Listo
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
