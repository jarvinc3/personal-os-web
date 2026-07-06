"use client"

import {
  CHAT_MODULE_OPTIONS,
  type ModuleChatSlug,
} from "@/src/modules/ai/types/chat.types"
import { SelectField } from "@/src/shared/components/layout/form-blocks"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/src/shared/components/ui/native-select"
import { cn } from "@/src/shared/lib/utils"

type ChatModuleSelectProps = {
  value: ModuleChatSlug
  onChange: (slug: ModuleChatSlug) => void
  disabled?: boolean
  variant?: "default" | "header"
}

export function ChatModuleSelect({
  value,
  onChange,
  disabled,
  variant = "default",
}: ChatModuleSelectProps) {
  if (variant === "header") {
    return (
      <NativeSelect
        value={value}
        onChange={(event) => onChange(event.target.value as ModuleChatSlug)}
        disabled={disabled}
        aria-label="Contexto del agente"
        className={cn(
          "w-auto max-w-full",
          "[&_[data-slot=native-select]]:h-auto [&_[data-slot=native-select]]:border-0 [&_[data-slot=native-select]]:bg-transparent [&_[data-slot=native-select]]:p-0 [&_[data-slot=native-select]]:pr-6 [&_[data-slot=native-select]]:text-lg [&_[data-slot=native-select]]:font-bold [&_[data-slot=native-select]]:tracking-tight [&_[data-slot=native-select]]:shadow-none [&_[data-slot=native-select]]:focus-visible:ring-0 md:[&_[data-slot=native-select]]:text-xl",
          "[&_[data-slot=native-select-icon]]:right-0 [&_[data-slot=native-select-icon]]:text-foreground"
        )}
      >
        {CHAT_MODULE_OPTIONS.map((option) => (
          <NativeSelectOption key={option.slug} value={option.slug}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    )
  }

  return (
    <SelectField
      label="Contexto del agente"
      value={value}
      onChange={(next) => onChange(next as ModuleChatSlug)}
      disabled={disabled}
      options={CHAT_MODULE_OPTIONS.map((option) => ({
        value: option.slug,
        label: option.label,
      }))}
    />
  )
}
