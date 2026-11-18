"use client"

import { useState } from "react"
import { CalendarDays, GlobeIcon, MailIcon, XIcon } from "lucide-react"

import {
  EMAIL_IMPORT_PERIODS,
  EMAIL_IMPORT_PERIOD_LABELS,
  KEEP_EMAIL_IMPORT_PERIOD,
  canConnectGmail,
  emailConnectBody,
  emailImportStartLabel,
  type EmailConnectBody,
  type EmailImportPeriodChoice,
} from "@/src/modules/intelligence/email-connect"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
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
  const [choice, setChoice] = useState<PeriodValue>(
    reconnect ? KEEP_EMAIL_IMPORT_PERIOD : ""
  )
  const [sender, setSender] = useState(senderFilter ?? "")
  const selectedChoice: EmailImportPeriodChoice | null =
    choice === "" ? null : choice
  const canSubmit = canConnectGmail({ reconnect, choice: selectedChoice })
  const periodOptions: SegmentOption<PeriodValue>[] = [
    ...(reconnect
      ? [{ value: KEEP_EMAIL_IMPORT_PERIOD, label: "Mantener el actual" }]
      : []),
    ...EMAIL_IMPORT_PERIODS.map((period) => ({
      value: period,
      label: EMAIL_IMPORT_PERIOD_LABELS[period],
    })),
  ]

  function submit() {
    onConnect(
      emailConnectBody({ choice: selectedChoice, senderFilter: sender })
    )
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
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
            onClick={() => onOpenChange(false)}
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
  )
}
