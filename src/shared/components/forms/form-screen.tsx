"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/src/shared/lib/utils"
import type { FormEventHandler, ReactNode } from "react"

type FormSubmitIconProps = {
  isSubmitting: boolean
  icon?: LucideIcon
}

function FormSubmitIcon({ isSubmitting, icon: Icon }: FormSubmitIconProps) {
  if (isSubmitting) {
    return <Spinner data-icon="inline-start" />
  }
  if (!Icon) {
    return null
  }
  return <Icon data-icon="inline-start" />
}

export type FormScreenProps = {
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  submitLabel: string
  submitIcon?: LucideIcon
  isSubmitting: boolean
  submitDisabled: boolean
  /** Marks the submit as the step that commits a pending change. */
  submitEmphasis?: boolean
}

export function FormScreen({
  onSubmit,
  children,
  submitLabel,
  submitIcon,
  isSubmitting,
  submitDisabled,
  submitEmphasis = false,
}: FormScreenProps) {
  return (
    <form
      className="-mb-4 flex min-h-[calc(100dvh-var(--header-height)-1rem)] flex-col gap-4 md:-mb-16"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-4">{children}</div>
      <div className="sticky bottom-0 -mx-4 mt-auto border-t bg-background px-4 pt-3 pb-4 md:-mx-6 md:px-6">
        <Button
          type="submit"
          className={cn(
            "h-11 w-full",
            submitEmphasis && "ring-2 ring-primary ring-offset-2"
          )}
          disabled={submitDisabled}
        >
          <FormSubmitIcon isSubmitting={isSubmitting} icon={submitIcon} />
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
