"use client"

import { FinanceSegmentedControl } from "@/src/modules/finance/shared/components/forms/form-blocks"
import {
  useEmailMailboxes,
  useRunEmailSync,
} from "@/src/modules/finance/shared/hooks/use-email-sources"
import {
  hasRunningEmailSync,
  syncLogStatusLabel,
} from "@/src/modules/finance/shared/lib/email-sync-display"
import { parseOAuthSuccessParam } from "@/src/modules/finance/shared/lib/gmail-oauth"
import {
  EMAIL_SYNC_INTERVAL_PRESETS,
  EMAIL_SYNC_SCHEDULE_MODES,
  EmailSyncScheduleFields,
  configToFinanceFormValues,
  emailSyncOnboardingDefaults,
  emailSyncPatchFromFormValues,
  emailSyncScheduleLabel,
  financeModuleSchema,
  formatSyncIntervalLabel,
  isEmailSyncConfigured,
  useProfileSheetFormSync,
  useUserModuleConfig,
  type FinanceModuleFormValues,
} from "@/src/modules/settings"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  OptionRow,
  SwitchFieldRow,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CheckCircle2Icon,
  CircleXIcon,
  MailIcon,
  PencilIcon,
  RefreshCw,
  XIcon,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

type OauthGmailResultSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MODULE_ACCENT = getModule("finance").accent

const IMPORT_MODE_LABELS: Record<"DIRECT" | "PENDING", string> = {
  DIRECT: "Confirmar directo",
  PENDING: "Dejar pendiente para revisar",
}

export function OauthGmailResultSheet({
  open,
  onOpenChange,
}: OauthGmailResultSheetProps) {
  const searchParams = useSearchParams()
  const state = parseOAuthSuccessParam(searchParams.get("success"))
  const ok = state === "ok"
  const Icon = ok ? CheckCircle2Icon : CircleXIcon

  const { config, updateConfig, updateMutation } =
    useUserModuleConfig("finance")
  const configured = isEmailSyncConfigured(config.emailSync)
  const [editing, setEditing] = useState(false)
  const [proposalActive, setProposalActive] = useState(true)
  const [syncNow, setSyncNow] = useState(false)
  const [syncRequested, setSyncRequested] = useState(false)

  const mailboxesQuery = useEmailMailboxes(open && ok)
  const mailboxes = mailboxesQuery.data ?? []
  const activeSources = mailboxes
    .flatMap((mailbox) => mailbox.sources)
    .filter((source) => source.isActive)
  const { run: runSync, isPending: isSyncPending } = useRunEmailSync(
    config.emailSync.enabled
  )
  const running = hasRunningEmailSync(mailboxes)
  const latestLog = mailboxes
    .flatMap((mailbox) => mailbox.sources)
    .flatMap((source) => source.logs ?? [])
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt))[0]

  const showForm = ok && (!configured || editing)
  const savedValues = useMemo(() => configToFinanceFormValues(config), [config])
  const proposalValues = useMemo(
    () => ({
      ...savedValues,
      ...emailSyncOnboardingDefaults(config.emailSync),
    }),
    [savedValues, config.emailSync]
  )
  const formValues = proposalActive ? proposalValues : savedValues

  const { control, handleSubmit, reset, setValue } =
    useForm<FinanceModuleFormValues>({
      resolver: zodResolver(financeModuleSchema),
      defaultValues: formValues,
    })
  useProfileSheetFormSync(showForm, reset, formValues)

  const scheduleMode = useWatch({ control, name: "emailSyncScheduleMode" })
  const everyMinutes = useWatch({ control, name: "emailSyncEveryMinutes" })

  const [wasOpen, setWasOpen] = useState(open)
  if (wasOpen !== open) {
    setWasOpen(open)
    if (!open) {
      setEditing(false)
      setProposalActive(true)
      setSyncNow(false)
      setSyncRequested(false)
    }
  }

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = () =>
    void submitForm(async (values) => {
      await updateConfig({
        emailSync: emailSyncPatchFromFormValues(values),
      })
      appToast.success({
        text1: "Sincronización configurada",
        text2: "Se guardó en Ajustes → Finanzas.",
      })
      setProposalActive(false)
      setEditing(false)
      if (!syncNow || activeSources.length === 0) {
        return
      }
      setSyncRequested(true)
      for (const source of activeSources) {
        await runSync(source.id)
      }
    })

  const scheduleOptions = [
    ...EMAIL_SYNC_INTERVAL_PRESETS.map((minutes) => ({
      value: String(minutes),
      label: `Cada ${formatSyncIntervalLabel(minutes)}`,
    })),
    { value: EMAIL_SYNC_SCHEDULE_MODES.TIMES, label: "Horas fijas" },
  ]
  const scheduleChipValue =
    scheduleMode === EMAIL_SYNC_SCHEDULE_MODES.TIMES
      ? EMAIL_SYNC_SCHEDULE_MODES.TIMES
      : String(everyMinutes)

  const handleScheduleChange = (value: string) => {
    if (value === EMAIL_SYNC_SCHEDULE_MODES.TIMES) {
      setValue("emailSyncScheduleMode", EMAIL_SYNC_SCHEDULE_MODES.TIMES, {
        shouldDirty: true,
      })
      return
    }
    setValue("emailSyncScheduleMode", EMAIL_SYNC_SCHEDULE_MODES.INTERVAL, {
      shouldDirty: true,
    })
    setValue("emailSyncEveryMinutes", value, { shouldDirty: true })
  }

  return (
    <BottomSheet
      open={open}
      variant="floating"
      onOpenChange={onOpenChange}
      title={ok ? "Gmail conectado" : "No se pudo conectar Gmail"}
      description={
        ok
          ? "Elige cómo traer los movimientos del banco."
          : "Google no autorizó la cuenta o el retorno falló. No se importó nada."
      }
      actions={{
        close: (
          <Button
            type="button"
            variant={showForm ? "outline" : "default"}
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Cerrar
          </Button>
        ),
        submit: showForm ? (
          <Button
            type="button"
            className="flex-1"
            disabled={updateMutation.isPending || isSyncPending}
            onClick={() => onSubmit()}
          >
            {updateMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            {syncNow ? "Guardar y sincronizar" : "Guardar"}
          </Button>
        ) : undefined,
      }}
    >
      {!ok ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Icon className="size-20 text-destructive" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Vuelve a intentar Conectar Gmail.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <Icon className="size-16 text-emerald-600" aria-hidden />
            <p className="text-sm text-muted-foreground">
              El buzón quedó autorizado. Configura la sincronización y, cuando
              termines, liga el correo desde el que el banco envía las
              notificaciones de movimientos.
            </p>
          </div>

          {showForm ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                onSubmit()
              }}
            >
              <Controller
                control={control}
                name="emailSyncAutomatic"
                render={({ field }) => (
                  <SwitchFieldRow
                    icon={RefreshCw}
                    iconColor={MODULE_ACCENT}
                    label="¿Sincronizar automáticamente?"
                    description="Busca correos nuevos según el horario."
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />

              <div className="flex flex-col gap-3">
                <FinanceSegmentedControl
                  label="Horario"
                  value={scheduleChipValue}
                  onChange={handleScheduleChange}
                  options={scheduleOptions}
                  size="lg"
                  fullWidth
                />
                <EmailSyncScheduleFields
                  control={control}
                  disabled={updateMutation.isPending}
                />
              </div>

              <Controller
                control={control}
                name="emailSyncMode"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) =>
                      setValue("emailSyncMode", value as "DIRECT" | "PENDING", {
                        shouldDirty: true,
                      })
                    }
                  >
                    <OptionRow
                      icon={MailIcon}
                      iconColor={MODULE_ACCENT}
                      label="Confirmar directo"
                      description="Se registra en el saldo al importarlo."
                      selected={field.value === "DIRECT"}
                      onPress={() =>
                        setValue("emailSyncMode", "DIRECT", {
                          shouldDirty: true,
                        })
                      }
                      trailing={<RadioGroupItem value="DIRECT" />}
                    />
                    <OptionRow
                      icon={MailIcon}
                      iconColor={MODULE_ACCENT}
                      label="Dejar pendiente para revisar"
                      description="Lo confirmas después desde Movimientos por asignar."
                      selected={field.value === "PENDING"}
                      onPress={() =>
                        setValue("emailSyncMode", "PENDING", {
                          shouldDirty: true,
                        })
                      }
                      trailing={<RadioGroupItem value="PENDING" />}
                    />
                  </RadioGroup>
                )}
              />

              <SwitchFieldRow
                icon={RefreshCw}
                iconColor={MODULE_ACCENT}
                label="Sincronizar ahora"
                description={
                  activeSources.length === 0
                    ? "Liga una institución para poder sincronizar."
                    : "Encola una revisión al guardar."
                }
                checked={syncNow}
                onCheckedChange={setSyncNow}
                disabled={activeSources.length === 0}
              />
            </form>
          ) : (
            <SummarySection
              title="Sincronización automática"
              icon={RefreshCw}
              right={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <PencilIcon className="size-4 shrink-0" />
                  Cambiar
                </Button>
              }
            >
              <SummaryItem
                title="Horario"
                value={emailSyncScheduleLabel(config.emailSync.schedule)}
                showChevron={false}
              />
              <SummaryItem
                title="Importación"
                value={IMPORT_MODE_LABELS[config.emailSync.mode]}
                showChevron={false}
                isLast
              />
            </SummarySection>
          )}

          {syncRequested ? (
            <div className="rounded-xl border border-border bg-card px-3 py-3 text-sm text-muted-foreground">
              {isSyncPending ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Encolando la sincronización…
                </span>
              ) : running ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Sincronizando correos…
                </span>
              ) : latestLog ? (
                <span>
                  {syncLogStatusLabel(latestLog.status)} ·{" "}
                  {latestLog.emailsScanned} correos ·{" "}
                  {latestLog.transactionsNew} nuevos
                </span>
              ) : (
                <span>Sin correos nuevos por ahora.</span>
              )}
            </div>
          ) : null}
        </div>
      )}
    </BottomSheet>
  )
}
