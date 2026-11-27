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
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button, buttonVariants } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { appToast } from "@/src/shared/lib/app-toast"
import { cn } from "@/src/shared/lib/utils"
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
  XIcon,
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
      <Drawer
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setShare(null)
          }
          onOpenChange(next)
        }}
      >
        <DrawerContent>
          <SheetHeader
            title="Compartir cobros"
            description="Genera un link para que vea cuánto te debe. No necesita cuenta."
            actions={
              <SheetHelpAction sheetKey={FINANCE_SHEET_KEYS.receivableShare} />
            }
          />
          <SheetBody>
            <SummarySection title="Deudor" icon={UserIcon}>
              <Controller
                control={control}
                name="debtorName"
                render={({ field }) => (
                  <Field
                    data-invalid={
                      formState.errors.debtorName ? true : undefined
                    }
                    className="gap-0.5"
                  >
                    <FieldLabel
                      htmlFor="share-debtor-name"
                      className="pl-2 text-sm text-muted-foreground"
                    >
                      Nombre del deudor
                    </FieldLabel>
                    <InputGroup className="h-10 overflow-hidden px-1">
                      <InputGroupAddon align="inline-start">
                        <UserIcon className="text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="share-debtor-name"
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                        onBlur={field.onBlur}
                        aria-invalid={
                          formState.errors.debtorName ? true : undefined
                        }
                      />
                    </InputGroup>
                    {formState.errors.debtorName?.message ? (
                      <FieldError>
                        {formState.errors.debtorName.message}
                      </FieldError>
                    ) : null}
                  </Field>
                )}
              />
            </SummarySection>

            <SummarySection title="Cobros" icon={HandshakeIcon}>
              {lines.map((line, index) => (
                <Item
                  key={line.id}
                  variant="plain"
                  className={cn(
                    "px-2",
                    index !== lines.length - 1 && "border-b border-border/60"
                  )}
                >
                  <ItemContent>
                    <ItemTitle>{line.concept}</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <span className="text-sm font-semibold tabular-nums">
                      {line.pendingLabel}
                    </span>
                  </ItemActions>
                </Item>
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
                      <a
                        href={whatsAppShareHref({
                          url: share.url,
                          debtorName: share.debtorName,
                          count: receivables.length,
                          pendingLabel,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          buttonVariants({ className: WHATSAPP_BUTTON_CLASS })
                        )}
                      >
                        <MessageCircleIcon className="size-4 shrink-0" />
                        WhatsApp
                      </a>
                    </div>
                  ) : null}
                </SummarySection>

                <p className="flex gap-2 px-1 text-xs text-muted-foreground">
                  <ShieldCheckIcon
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    Solo lectura. Verá conceptos, montos y lo pendiente; nada de
                    tus cuentas. Se actualiza cuando registras pagos y puedes
                    revocarlo cuando quieras.
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
          </SheetBody>
          <DrawerFooter className={SHEET_FOOTER_CLASS}>
            {share ? (
              <Button
                type="button"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                <CheckIcon className="size-4 shrink-0" />
                Listo
              </Button>
            ) : (
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
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        open={confirmRevoke}
        onOpenChange={(open) => {
          if (!revokeShare.isPending) {
            setConfirmRevoke(open)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <BanIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Revocar el link?</AlertDialogTitle>
            <AlertDialogDescription>
              Quien lo tenga abierto dejará de ver los cobros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeShare.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={revokeShare.isPending}
              onClick={() => void onRevokeLink()}
            >
              {revokeShare.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <BanIcon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {revokeShare.isPending ? "Revocando..." : "Revocar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
