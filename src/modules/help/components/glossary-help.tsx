"use client"

import { AgentChatTriggerButton } from "@/src/shared/components/agent-chat/agent-chat-launcher"
import { HelpRichText } from "@/src/modules/help/components/help-rich-text"
import { HELP_LINK_CLASS } from "@/src/modules/help/constants/help-ui"
import type { SheetGlossaryKey } from "@/src/modules/help/constants/sheet-terms"
import { glossaryTermsForSlugs } from "@/src/modules/help/lib/glossary-terms"
import { glossaryTermHref } from "@/src/modules/help/lib/help-links"
import {
  glossarySlugsForSheet,
  glossaryPickerKey,
} from "@/src/modules/help/lib/sheet-glossary"
import type { HelpTerm } from "@/src/modules/help/types/help.types"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { BookOpenIcon, HelpCircleIcon, XIcon } from "lucide-react"
import Link from "next/link"

type GlossaryTermDefinitionProps = {
  term: HelpTerm
  showTermTitle: boolean
  onNavigate: () => void
}

function GlossaryTermDefinition({
  term,
  showTermTitle,
  onNavigate,
}: GlossaryTermDefinitionProps) {
  return (
    <article className={cn("flex flex-col", showTermTitle ? "gap-1" : "gap-4")}>
      {showTermTitle ? (
        <h3 className="text-sm font-semibold text-foreground">{term.term}</h3>
      ) : null}
      <p className="text-sm leading-relaxed text-muted-foreground">
        <HelpRichText text={term.definition} onNavigate={onNavigate} />
      </p>
      <Link
        href={glossaryTermHref(term.slug)}
        onClick={onNavigate}
        className={cn(
          HELP_LINK_CLASS,
          "inline-flex items-center gap-2 self-start text-sm"
        )}
      >
        <BookOpenIcon className="size-4 shrink-0" aria-hidden />
        Abrir en el Centro de ayuda
      </Link>
    </article>
  )
}

type GlossaryTermsDialogProps = {
  slugs: readonly string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  closeLabel?: string
  showAgentButton?: boolean
}

function GlossaryTermsDialog({
  slugs,
  open,
  onOpenChange,
  closeLabel = "Cerrar",
  showAgentButton = false,
}: GlossaryTermsDialogProps) {
  const terms = glossaryTermsForSlugs(slugs)
  if (terms.length === 0) {
    return null
  }
  const singleTerm = terms.length === 1

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader
          title={singleTerm ? terms[0].term : "Glosario"}
          description={
            singleTerm
              ? "Glosario"
              : "Definiciones de los conceptos de esta hoja"
          }
        />
        <SheetBody>
          <div className="flex flex-col gap-4">
            {terms.map((term) => (
              <GlossaryTermDefinition
                key={term.slug}
                term={term}
                showTermTitle={!singleTerm}
                onNavigate={() => onOpenChange(false)}
              />
            ))}
            {showAgentButton ? (
              <AgentChatTriggerButton
                withLabel
                label="Preguntar al agente"
                className="w-full"
              />
            ) : null}
          </div>
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            {closeLabel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
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
  const glossaryPicker = usePicker<string>("")
  const pickerKey = glossaryPickerKey(slug)
  const terms = glossaryTermsForSlugs([slug])
  if (terms.length === 0) {
    return null
  }
  const term = terms[0]
  const open = glossaryPicker.picker === pickerKey

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
        onClick={() => glossaryPicker.openPicker(pickerKey)}
      >
        <HelpCircleIcon className="size-4" aria-hidden />
      </Button>
      <SheetGlossaryDialog
        slugs={[slug]}
        open={open}
        onOpenChange={glossaryPicker.closeHandlerFor(pickerKey)}
      />
    </>
  )
}

type SheetGlossaryDialogProps = {
  slugs: readonly string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SheetGlossaryDialog({
  slugs,
  open,
  onOpenChange,
}: SheetGlossaryDialogProps) {
  return (
    <GlossaryTermsDialog
      slugs={slugs}
      open={open}
      onOpenChange={onOpenChange}
      showAgentButton
    />
  )
}

type SheetHelpActionProps = {
  sheetKey: SheetGlossaryKey
  className?: string
}

/**
 * Botón derecho del header de una hoja: «?» con los términos del mapa o el
 * icono del agente cuando la hoja no explica conceptos.
 */
export function SheetHelpAction({ sheetKey, className }: SheetHelpActionProps) {
  const slugs = glossarySlugsForSheet(sheetKey)
  const glossaryPicker = usePicker<string>("")
  const pickerKey = glossaryPickerKey(sheetKey)
  const open = glossaryPicker.picker === pickerKey

  if (slugs.length === 0) {
    return <AgentChatTriggerButton className={className} />
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(PRESSABLE_CLASS, "text-muted-foreground", className)}
        aria-label="Ver los conceptos de esta hoja"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-sheet-glossary-opener={sheetKey}
        onClick={() => glossaryPicker.openPicker(pickerKey)}
      >
        <HelpCircleIcon className="size-4" aria-hidden />
      </Button>
      <SheetGlossaryDialog
        slugs={slugs}
        open={open}
        onOpenChange={glossaryPicker.closeHandlerFor(pickerKey)}
      />
    </>
  )
}
