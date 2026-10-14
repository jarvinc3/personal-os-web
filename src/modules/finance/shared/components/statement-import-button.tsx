"use client"

import { ApiError } from "@/src/config/api-client"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { useUploadStatementImport } from "@/src/modules/finance/shared/hooks/use-statement-import"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { appToast } from "@/src/shared/lib/app-toast"
import { FileUpIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

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
  const [passwordOpen, setPasswordOpen] = useState(false)

  async function send(file: File, pdfPassword?: string) {
    try {
      const { importId } = await upload.mutateAsync({
        cardId,
        accountId,
        file,
        password: pdfPassword,
      })
      setPasswordOpen(false)
      setPassword("")
      setLockedFile(null)
      router.push(APP_ROUTES.app.financeStatementImport(importId))
    } catch (error) {
      if (error instanceof ApiError && error.code === PASSWORD_REQUIRED_CODE) {
        setLockedFile(file)
        setPasswordOpen(true)
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
        open={passwordOpen}
        onOpenChange={(open) => {
          setPasswordOpen(open)
          if (!open) {
            setPassword("")
          }
        }}
        title="PDF con clave"
        description="Escríbela para leer el estado de cuenta. No la guardamos."
        actions={{
          close: (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPasswordOpen(false)}
            >
              Cancelar
            </Button>
          ),
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
