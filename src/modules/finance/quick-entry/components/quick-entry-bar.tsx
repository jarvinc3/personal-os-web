"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Field } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { appToast } from "@/src/shared/lib/app-toast"
import { SparklesIcon } from "lucide-react"
import { useState, type FormEvent } from "react"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useQuickEntryParse } from "@/src/modules/finance/quick-entry/hooks/use-quick-entry"
import type { QuickEntryParseResult } from "@/src/modules/finance/quick-entry/types"
import { QuickEntryPreviewSheet } from "@/src/modules/finance/quick-entry/components/quick-entry-preview-sheet"
import { useEventSheet } from "@/src/shared/hooks/use-event-sheet"

/** Quick capture bar. It only parses; the user confirms in the preview sheet. */
export function QuickEntryBar() {
  const { isEnabled } = useFinanceEnabled()
  const parseMutation = useQuickEntryParse()
  const [text, setText] = useState("")
  const previewSheet = useEventSheet(FINANCE_SHEET_KEYS.quickEntryPreview)
  const [parseResult, setParseResult] = useState<QuickEntryParseResult | null>(
    null
  )
  const [parseId, setParseId] = useState(0)

  if (!isEnabled) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = text.trim()
    if (trimmed.length < 2) {
      return
    }
    try {
      const parsed = await parseMutation.mutateAsync(trimmed)
      setParseResult(parsed)
      setParseId((current) => current + 1)
      previewSheet.openSheet()
    } catch (error) {
      appToast.error({
        text1: "No se pudo interpretar",
        text2: financeErrorMessage(error),
      })
    }
  }

  return (
    <div className="flex flex-col gap-2 px-3 md:px-0">
      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <Field className="flex-1">
          <InputGroup className="h-10 flex-1 overflow-hidden px-1">
            <InputGroupAddon align="inline-start">
              <SparklesIcon className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Registrar rápido: café 250 popular"
              aria-label="Registrar rápido"
            />
          </InputGroup>
        </Field>
        <Button
          type="submit"
          variant="secondary"
          disabled={parseMutation.isPending || text.trim().length < 2}
        >
          <SparklesIcon />
          Registrar
        </Button>
      </form>
      <QuickEntryPreviewSheet
        key={parseId}
        open={previewSheet.open}
        onOpenChange={previewSheet.onOpenChange}
        parseResult={parseResult}
      />
    </div>
  )
}
