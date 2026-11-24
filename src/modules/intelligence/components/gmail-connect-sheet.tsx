"use client"

import { useState } from "react"
import {
  CalendarDays,
  CalendarRange,
  GlobeIcon,
  History,
  MailIcon,
  Sun,
  TriangleAlertIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import {
  EMAIL_IMPORT_PERIODS,
  EMAIL_IMPORT_PERIOD_LABELS,
  KEEP_EMAIL_IMPORT_PERIOD,
  SENDER_FILTER_MAX_LENGTH,
  emailConnectBody,
  emailConnectSchema,
  emailConnectHasChanges,
  emailImportStartLabel,
  type EmailConnectBody,
  type EmailImportPeriodChoice,
} from "@/src/modules/intelligence/email-connect"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { SummarySection } from "@/src/shared/components/data-display/summary"
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
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { appToast } from "@/src/shared/lib/app-toast"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"

type GmailConnectSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reconnect: boolean
  importStartAt: string | null
  senderFilter: string | null
  pending: boolean
  onConnect: (body: EmailConnectBody) => void
}

type PeriodValue = EmailImportPeriodChoice | ""

const PERIOD_ICONS = {
  TODAY: Sun,
  LAST_MONTH: CalendarDays,
  LAST_3_MONTHS: CalendarRange,
} as const

/** El formulario se reinicia al abrir: la hoja arranca desde la conexión actual. */
export function GmailConnectSheet(props: GmailConnectSheetProps) {
  return (
    <GmailConnectSheetForm
      key={`${props.open}-${props.importStartAt ?? ""}-${props.senderFilter ?? ""}`}
      {...props}
    />
  )
}

function GmailConnectSheetForm({
  open,
  onOpenChange,
  reconnect,
  importStartAt,
  senderFilter,
  pending,
  onConnect,
}: GmailConnectSheetProps) {
  const locale = useFormatLocale()
  const currentStart = emailImportStartLabel(importStartAt, locale)
  const initialChoice: PeriodValue = reconnect ? KEEP_EMAIL_IMPORT_PERIOD : ""
  const initialSender = senderFilter ?? ""
  const [choice, setChoice] = useState<PeriodValue>(initialChoice)
  const [sender, setSender] = useState(initialSender)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [senderTouched, setSenderTouched] = useState(false)
  const connectSchema = emailConnectSchema({ reconnect })
  const validation = connectSchema.safeParse({
    choice,
    senderFilter: sender,
  })
  const canSubmit = validation.success
  const senderResult = connectSchema.shape.senderFilter.safeParse(sender)
  const senderError =
    senderTouched && !senderResult.success
      ? senderResult.error.issues[0]?.message
      : undefined
  const hasChanges = emailConnectHasChanges(
    { choice, senderFilter: sender },
    { choice: initialChoice, senderFilter: initialSender }
  )
  const periodOptions = [
    ...(reconnect
      ? [
          {
            value: KEEP_EMAIL_IMPORT_PERIOD,
            label: "Mantener el actual",
            icon: History,
          },
        ]
      : []),
    ...EMAIL_IMPORT_PERIODS.map((period) => ({
      value: period,
      label: EMAIL_IMPORT_PERIOD_LABELS[period],
      icon: PERIOD_ICONS[period],
    })),
  ]

  function submit() {
    const parsed = emailConnectSchema({ reconnect }).safeParse({
      choice,
      senderFilter: sender,
    })
    if (!parsed.success) {
      appToast.error({
        text1:
          parsed.error.issues[0]?.message ?? "Revisa el período y el filtro.",
      })
      return
    }
    onConnect(
      emailConnectBody({
        choice: parsed.data.choice,
        senderFilter: parsed.data.senderFilter,
      })
    )
  }

  function requestClose() {
    if (pending) {
      return
    }
    if (hasChanges) {
      setDiscardOpen(true)
      return
    }
    onOpenChange(false)
  }

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            requestClose()
          }
        }}
        title={reconnect ? "Reconectar Gmail" : "Conectar Gmail"}
        description={
          reconnect
            ? "Elige si mantienes el período actual o mueves el inicio de la importación."
            : "Elige desde cuándo importar tus correos."
        }
        actions={{
          close: (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={pending}
              onClick={requestClose}
            >
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </Button>
          ),
          submit: (
            <Button
              type="button"
              className="flex-1"
              disabled={pending || !canSubmit}
              onClick={submit}
            >
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <MailIcon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {pending
                ? reconnect
                  ? "Reconectando..."
                  : "Conectando..."
                : reconnect
                  ? "Reconectar"
                  : "Conectar"}
            </Button>
          ),
        }}
      >
        <SummarySection title="Período de importación" icon={CalendarDays}>
          <ToggleGroup
            value={[choice]}
            onValueChange={(next) => {
              if (next.length > 0) {
                setChoice(next[0])
              }
            }}
            variant="outline"
            size="sm"
            orientation="vertical"
            aria-label="Período de importación"
            disabled={pending}
            className="w-full flex-col items-stretch"
          >
            {periodOptions.map((option) => {
              const OptionIcon = option.icon
              return (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="h-11 w-full flex-none justify-start rounded-full text-base"
                >
                  <OptionIcon />
                  {option.label}
                </ToggleGroupItem>
              )
            })}
          </ToggleGroup>
          {reconnect && currentStart ? (
            <p className="px-1 text-sm text-muted-foreground">
              Hoy importas desde el {currentStart}. Un período nuevo mueve el
              inicio hacia adelante; el correo ya importado no se borra.
            </p>
          ) : null}
        </SummarySection>

        <SummarySection title="Remitente" icon={GlobeIcon}>
          <FormTextField
            label="Solo este dominio"
            value={sender}
            onChange={setSender}
            onBlur={() => setSenderTouched(true)}
            disabled={pending}
            maxLength={SENDER_FILTER_MAX_LENGTH}
            error={senderError}
            placeholder="bhd.com.do"
            description="Limita la importación a ese dominio y sus subdominios. Déjalo vacío para importar de todos."
            icon={GlobeIcon}
          />
        </SummarySection>
      </BottomSheet>
      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TriangleAlertIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Descartar los cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Se pierden el período y el filtro que escribiste.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setDiscardOpen(false)
                onOpenChange(false)
              }}
            >
              <Trash2Icon className="size-4 shrink-0" aria-hidden="true" />
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
