"use client"

import { ApiError } from "@/src/config/api-client"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { useUploadStatementImport } from "@/src/modules/finance/shared/hooks/use-statement-import"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { Button } from "@/src/shared/components/ui/button"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { appToast } from "@/src/shared/lib/app-toast"
import { ArrowRightIcon, FileUpIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { useEventSheet } from "@/src/shared/hooks/use-event-sheet"

const PASSWORD_REQUIRED_CODE = "STATEMENT_PASSWORD_REQUIRED"

type StatementImportButtonProps = {
  cardId?: string
  accountId?: string
  label?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  className?: string
}

export function StatementImportButton({
  cardId,
  accountId,
  label = "Importar estado de cuenta",
  variant = "outline",
  className,
}: StatementImportButtonProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadStatementImport()
  const [lockedFile, setLockedFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  // El archivo elegido no sobrevive a una recarga: la hoja se cierra sola.
  const passwordSheet = useEventSheet("statement-password-sheet")

  async function send(file: File, pdfPassword?: string) {
    try {
      const { importId } = await upload.mutateAsync({
        cardId,
        accountId,
        file,
        password: pdfPassword,
      })
      passwordSheet.closeSheet()
      setPassword("")
      setLockedFile(null)
      router.push(APP_ROUTES.app.financeStatementImport(importId))
    } catch (error) {
      if (error instanceof ApiError && error.code === PASSWORD_REQUIRED_CODE) {
        setLockedFile(file)
        passwordSheet.openSheet()
        if (pdfPassword) {
          appToast.error({ text1: "La clave no es correcta." })
        }
        return
      }
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (!file) {
            return
          }
          void send(file)
        }}
      />
      <Button
        type="button"
        variant={variant}
        className={className}
        disabled={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <FileUpIcon className="size-4 shrink-0" />
        {upload.isPending ? "Leyendo el PDF..." : label}
      </Button>
      <BottomSheet
        open={passwordSheet.open}
        onOpenChange={(open) => {
          passwordSheet.onOpenChange(open)
          if (!open) {
            setPassword("")
          }
        }}
        helpAction={
          <SheetHelpAction sheetKey={FINANCE_SHEET_KEYS.statementPassword} />
        }
        title="PDF con clave"
        description="Escríbela para leer el estado de cuenta. No la guardamos."
        actions={{
          submit: (
            <Button
              type="button"
              disabled={upload.isPending || password.trim().length === 0}
              onClick={() => {
                if (lockedFile) {
                  void send(lockedFile, password)
                }
              }}
            >
              <ArrowRightIcon className="size-4 shrink-0" />
              Continuar
            </Button>
          ),
        }}
      >
        <FormTextField
          label="Clave del PDF"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="off"
        />
      </BottomSheet>
    </>
  )
}
