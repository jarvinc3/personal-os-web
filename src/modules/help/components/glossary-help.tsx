"use client"

import { HelpRichText } from "@/src/modules/help/components/help-rich-text"
import { HELP_TERMS } from "@/src/modules/help/constants/glossary"
import { HELP_LINK_CLASS } from "@/src/modules/help/constants/help-ui"
import { glossaryTermHref } from "@/src/modules/help/lib/help-links"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { BookOpenIcon, HelpCircleIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type GlossaryHelpDialogProps = {
  slug: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Reads the term from the glossary so the explanation is written once. */
export function GlossaryHelpDialog({
  slug,
  open,
  onOpenChange,
}: GlossaryHelpDialogProps) {
  const term = HELP_TERMS.find((candidate) => candidate.slug === slug)
  if (!term) {
    return null
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={term.term}
      description="Glosario"
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className={cn(PRESSABLE_CLASS, "flex-1")}
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Cerrar
          </Button>
        ),
      }}
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        <HelpRichText
          text={term.definition}
          onNavigate={() => onOpenChange(false)}
        />
      </p>
      <Link
        href={glossaryTermHref(term.slug)}
        onClick={() => onOpenChange(false)}
        className={cn(
          HELP_LINK_CLASS,
          "inline-flex items-center gap-2 self-start text-sm"
        )}
      >
        <BookOpenIcon className="size-4 shrink-0" aria-hidden />
        Abrir en el Centro de ayuda
      </Link>
    </BottomSheet>
  )
}

type GlossaryHelpButtonProps = {
  slug: string
  label?: string
  className?: string
}

/** The "?" beside a concept; it opens the same glossary entry everywhere. */
export function GlossaryHelpButton({
  slug,
  label,
  className,
}: GlossaryHelpButtonProps) {
  const [open, setOpen] = useState(false)
  const term = HELP_TERMS.find((candidate) => candidate.slug === slug)
  if (!term) {
    return null
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(PRESSABLE_CLASS, "text-muted-foreground", className)}
        aria-label={label ?? `Qué significa ${term.term}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <HelpCircleIcon className="size-4" aria-hidden />
      </Button>
      <GlossaryHelpDialog slug={slug} open={open} onOpenChange={setOpen} />
    </>
  )
}
