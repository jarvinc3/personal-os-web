"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/shared/components/ui/popover"
import { cn } from "@/src/shared/lib/utils"
import { Check } from "lucide-react"
import { useCallback, useId, useRef, useState } from "react"
import { Button } from "@/src/shared/components/ui/button"

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
]

interface ColorPickerSwatchProps {
  id?: string
  variant?: "circle" | "square" | "input" | "button"
  value?: string
  defaultColor?: string
  disabled?: boolean
  onChange?: (color: string) => void
}

export function ColorPickerSwatch({
  id,
  variant = "circle",
  value,
  defaultColor = "#64748b",
  disabled = false,
  onChange,
}: ColorPickerSwatchProps) {
  const generatedId = useId()
  const [internalColor, setInternalColor] = useState(defaultColor)
  const portalContainerRef = useRef<HTMLElement | null>(null)
  const color = value || internalColor
  const triggerId = id ?? generatedId
  const customInputId = `${triggerId}-custom`

  const setTriggerRef = useCallback((node: HTMLButtonElement | null) => {
    portalContainerRef.current =
      node?.closest<HTMLElement>('[data-slot="drawer-content"]') ?? null
  }, [])

  const handleColorChange = (newColor: string) => {
    if (value === undefined) {
      setInternalColor(newColor)
    }
    onChange?.(newColor)
  }

  const ButonVariant = (variant: string) => {
    switch (variant) {
      case "circle":
        return "w-9 rounded-full"
      case "square":
        return "w-9 rounded-sm"
      case "input":
        return "w-full rounded-lg"
      case "button":
        return "w-full rounded-lg"
    }
  }

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            ref={setTriggerRef}
            type="button"
            id={triggerId}
            disabled={disabled}
            className={cn(
              ButonVariant(variant),
              "h-9 cursor-pointer border border-border shadow-sm transition-all hover:shadow-md"
            )}
            style={{ backgroundColor: color }}
          />
        }
      />
      <PopoverContent
        container={portalContainerRef}
        className="mb-1 w-60 p-3"
        side="bottom"
        align="start"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Selecciona un color</span>
            <div
              className="size-6 rounded border"
              style={{ backgroundColor: color }}
            />
          </div>

          <div className="grid grid-cols-6 gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                type="button"
                disabled={disabled}
                key={presetColor}
                onClick={() => handleColorChange(presetColor)}
                className="relative aspect-square size-8 rounded-md border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: presetColor,
                  borderColor:
                    color === presetColor
                      ? "hsl(var(--foreground))"
                      : "transparent",
                }}
              >
                {color === presetColor && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white drop-shadow-md" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="border-t pt-2">
            <label htmlFor={customInputId}>Color personalizado</label>
            <input
              id={customInputId}
              type="color"
              value={color}
              disabled={disabled}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-8 w-full cursor-pointer rounded-md"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
