"use client"

import { Button } from "@/src/shared/components/ui/button"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { appToast } from "@/src/shared/lib/app-toast"
import { SparklesIcon } from "lucide-react"
import { useState, type FormEvent } from "react"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useQuickEntryParse } from "@/src/modules/finance/quick-entry/hooks/use-quick-entry"
import type { QuickEntryParseResult } from "@/src/modules/finance/quick-entry/types"
import { QuickEntryPreviewSheet } from "@/src/modules/finance/quick-entry/components/quick-entry-preview-sheet"

/** Quick capture bar. It only parses; the user confirms in the preview sheet. */
export function QuickEntryBar() {
  const { isEnabled } = useFinanceEnabled()
  const parseMutation = useQuickEntryParse()
  const [text, setText] = useState("")
  const [previewOpen, setPreviewOpen] = useState(false)
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
      setPreviewOpen(true)
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
        <FormTextField
          value={text}
          onChange={setText}
          placeholder="Registrar rápido: café 250 popular"
          ariaLabel="Registrar rápido"
          icon={SparklesIcon}
          className="flex-1"
        />
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
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        parseResult={parseResult}
      />
    </div>
  )
}
