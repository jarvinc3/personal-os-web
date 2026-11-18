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
  canConnectGmail,
  emailConnectBody,
  emailConnectHasChanges,
  emailImportStartLabel,
  type EmailConnectBody,
  type EmailImportPeriodChoice,
} from "@/src/modules/intelligence/email-connect"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import {
  SegmentedControl,
  type SegmentOption,
} from "@/src/shared/components/forms/segmented-control"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
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
  const selectedChoice: EmailImportPeriodChoice | null =
    choice === "" ? null : choice
  const canSubmit = canConnectGmail({ reconnect, choice: selectedChoice })
  const hasChanges = emailConnectHasChanges(
    { choice, senderFilter: sender },
    { choice: initialChoice, senderFilter: initialSender }
  )
  const periodOptions: SegmentOption<PeriodValue>[] = [
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
    onConnect(
      emailConnectBody({ choice: selectedChoice, senderFilter: sender })
    )
  }

  function requestClose() {
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
        pending={pending}
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
          <SegmentedControl
            ariaLabel="Período de importación"
            value={choice}
            onChange={setChoice}
            options={periodOptions}
            orientation="vertical"
            fullWidth
          />
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
            placeholder="bhd.com.do"
            description="Limita la importación a ese dominio y sus subdominios. Déjalo vacío para importar de todos."
            icon={GlobeIcon}
          />
        </SummarySection>
      </BottomSheet>
      <ConfirmDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        tone="danger"
        icon={TriangleAlertIcon}
        title="¿Descartar los cambios?"
        description="Se pierden el período y el filtro que escribiste."
        confirmLabel="Descartar"
        confirmIcon={Trash2Icon}
        onConfirm={() => {
          setDiscardOpen(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}
