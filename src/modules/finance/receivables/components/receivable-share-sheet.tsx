"use client"

import {
  buildCreateReceivableShareBody,
  formatSharePendingTotals,
  maskShareUrl,
  receivableShareSchema,
  shareSelectionDebtor,
  shareSelectionTotals,
  shareSummaryLines,
  whatsAppShareHref,
  type FinanceReceivableShare,
  type ReceivableShareFormValues,
} from "@/src/modules/finance/receivables/lib/receivable-share"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  useCreateReceivableShare,
  useRevokeReceivableShare,
} from "@/src/modules/finance/shared/hooks/use-receivable-shares"
import type { FinanceReceivable } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  BanIcon,
  CheckIcon,
  CopyIcon,
  HandshakeIcon,
  LinkIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

const WHATSAPP_BUTTON_CLASS =
  "flex-1 bg-[#25D366] text-white hover:bg-[#25D366]/90"

type ReceivableShareSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  receivables: readonly FinanceReceivable[]
  display: FinanceMoneyDisplay
}

export function ReceivableShareSheet({
  open,
  onOpenChange,
  receivables,
  display,
}: ReceivableShareSheetProps) {
  const createShare = useCreateReceivableShare()
  const revokeShare = useRevokeReceivableShare()
  const [share, setShare] = useState<FinanceReceivableShare | null>(null)
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const defaultDebtorName = shareSelectionDebtor(receivables) ?? ""

  const { control, handleSubmit, formState } =
    useForm<ReceivableShareFormValues>({
      resolver: zodResolver(receivableShareSchema),
      mode: "onTouched",
      defaultValues: { debtorName: defaultDebtorName },
    })

  const formValues = useWatch({ control })
  const canGenerate =
    receivables.length > 0 &&
    receivableShareSchema.safeParse(formValues).success &&
    !createShare.isPending

  const totals = shareSelectionTotals(receivables, display)
  const lines = shareSummaryLines(receivables, display)
  const pendingLabel = formatSharePendingTotals(totals)

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    const payload = buildCreateReceivableShareBody({
      receivables,
      debtorName: values.debtorName,
    })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      const created = await createShare.mutateAsync(payload.body)
      setShare(created)
      appToast.success({ text1: "Link generado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  async function onCopyLink() {
    if (!share) {
      return
    }
    try {
      await navigator.clipboard.writeText(share.url)
      appToast.success({ text1: "Link copiado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onRevokeLink() {
    if (!share) {
      return
    }
    try {
      const revoked = await revokeShare.mutateAsync(share.id)
      setShare({ ...revoked, isActive: false })
      setConfirmRevoke(false)
      appToast.success({ text1: "Link revocado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setShare(null)
          }
          onOpenChange(next)
        }}
        title="Compartir cobros"
        description="Genera un link para que vea cuánto te debe. No necesita cuenta."
        actions={{
          close: share ? (
            <Button
              type="button"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              <CheckIcon className="size-4 shrink-0" />
              Listo
            </Button>
          ) : undefined,
          submit: share ? undefined : (
            <Button
              type="button"
              className="flex-1"
              disabled={!canGenerate}
              onClick={onSubmit}
            >
              {createShare.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <LinkIcon className="size-4 shrink-0" />
              )}
              {createShare.isPending ? "Generando link..." : "Generar link"}
            </Button>
          ),
        }}
      >
        <SummarySection title="Deudor" icon={UserIcon}>
          <Controller
            control={control}
            name="debtorName"
            render={({ field }) => (
              <FormTextField
                icon={UserIcon}
                label="Nombre del deudor"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={formState.errors.debtorName?.message}
              />
            )}
          />
        </SummarySection>

        <SummarySection title="Cobros" icon={HandshakeIcon}>
          {lines.map((line, index) => (
            <SummaryItem
              key={line.id}
              title={line.concept}
              value={line.pendingLabel}
              isLast={index === lines.length - 1}
            />
          ))}
          <div className="flex items-end justify-between gap-3 border-t border-border/60 px-2 pt-2">
            <span className="text-sm font-medium text-muted-foreground">
              Total pendiente
            </span>
            <span className="text-lg font-bold tabular-nums">
              {pendingLabel}
            </span>
          </div>
          {receivables.length === 0 ? (
            <p className="px-2 text-xs text-muted-foreground">
              Elige al menos un cobro para generar el link.
            </p>
          ) : null}
        </SummarySection>

        {share ? (
          <>
            <SummarySection title="Link generado" icon={LinkIcon}>
              <div className="flex items-center justify-between gap-2 px-2">
                <span className="truncate text-sm text-muted-foreground">
                  {maskShareUrl(share.url)}
                </span>
                <Badge variant={share.isActive ? "success" : "destructive"}>
                  {share.isActive ? "Activo" : "Revocado"}
                </Badge>
              </div>

              {share.isActive ? (
                <div className="flex gap-2 px-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => void onCopyLink()}
                  >
                    <CopyIcon className="size-4 shrink-0" />
                    Copiar
                  </Button>
                  <Button
                    type="button"
                    asChild
                    className={WHATSAPP_BUTTON_CLASS}
                  >
                    <a
                      href={whatsAppShareHref({
                        url: share.url,
                        debtorName: share.debtorName,
                        count: receivables.length,
                        pendingLabel,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircleIcon className="size-4 shrink-0" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              ) : null}
            </SummarySection>

            <p className="flex gap-2 px-1 text-xs text-muted-foreground">
              <ShieldCheckIcon className="size-4 shrink-0" aria-hidden="true" />
              <span>
                Solo lectura. Verá conceptos, montos y lo pendiente; nada de tus
                cuentas. Se actualiza cuando registras pagos y puedes revocarlo
                cuando quieras.
              </span>
            </p>

            {share.isActive ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                disabled={revokeShare.isPending}
                onClick={() => setConfirmRevoke(true)}
              >
                <BanIcon className="size-4 shrink-0" />
                Revocar link
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShare(null)}
              >
                <LinkIcon className="size-4 shrink-0" />
                Generar otro link
              </Button>
            )}
          </>
        ) : null}
      </BottomSheet>

      <AlertDialog open={confirmRevoke} onOpenChange={setConfirmRevoke}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Revocar el link?</AlertDialogTitle>
            <AlertDialogDescription>
              Quien lo tenga abierto dejará de ver los cobros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeShare.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={revokeShare.isPending}
              onClick={() => void onRevokeLink()}
            >
              Revocar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
