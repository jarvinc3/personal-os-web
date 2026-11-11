"use client"

import { useState } from "react"
import {
  BrainCircuitIcon,
  CheckIcon,
  GaugeIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react"

import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { SwitchFieldRow } from "@/src/shared/components/forms/switch-field-row"
import { WheelField } from "@/src/shared/components/forms/wheel-field"
import {
  WheelPicker,
  WheelPickerWrapper,
} from "@/src/shared/components/forms/wheel-picker"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { appToast } from "@/src/shared/lib/app-toast"

const CONFIDENCE_OPTIONS = Array.from({ length: 101 }, (_, percent) => ({
  value: String(percent),
  label: `${percent} %`,
}))

type ReviewSettingsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReviewSettingsSheet(props: ReviewSettingsSheetProps) {
  const { config, updateConfig, updateMutation, profileQuery } =
    useUserModuleConfig("ai")
  const emailConfig = config.email

  return (
    <ReviewSettingsSheetForm
      key={`${props.open ? "open" : "closed"}-${emailConfig.reviewConfidenceThreshold}-${emailConfig.acceptVerifiedSenders}`}
      {...props}
      initialThreshold={emailConfig.reviewConfidenceThreshold}
      initialAcceptVerifiedSenders={emailConfig.acceptVerifiedSenders}
      canSave={profileQuery.isSuccess}
      loadFailed={profileQuery.isError}
      pending={updateMutation.isPending}
      onSave={async (threshold, acceptVerifiedSenders) => {
        await updateConfig({
          email: {
            reviewConfidenceThreshold: threshold,
            acceptVerifiedSenders,
          },
        })
        appToast.success({ text1: "Ajustes de revisión guardados" })
        props.onOpenChange(false)
      }}
    />
  )
}

function ReviewSettingsSheetForm({
  open,
  onOpenChange,
  initialThreshold,
  initialAcceptVerifiedSenders,
  canSave,
  loadFailed,
  pending,
  onSave,
}: ReviewSettingsSheetProps & {
  initialThreshold: number
  initialAcceptVerifiedSenders: boolean
  canSave: boolean
  loadFailed: boolean
  pending: boolean
  onSave: (threshold: number, acceptVerifiedSenders: boolean) => Promise<void>
}) {
  const [thresholdPercent, setThresholdPercent] = useState(
    Math.round(initialThreshold * 100)
  )
  const [acceptVerifiedSenders, setAcceptVerifiedSenders] = useState(
    initialAcceptVerifiedSenders
  )
  const dirty =
    thresholdPercent / 100 !== initialThreshold ||
    acceptVerifiedSenders !== initialAcceptVerifiedSenders

  async function save() {
    try {
      await onSave(thresholdPercent / 100, acceptVerifiedSenders)
    } catch {
      // useUserModuleConfig muestra el error del API.
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Ajustes de revisión"
      description="Controla cuándo un correo necesita revisión humana."
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            <XIcon data-icon="inline-start" /> Cancelar
          </Button>
        ),
        submit: (
          <Button
            type="button"
            className="flex-1"
            onClick={() => void save()}
            disabled={!dirty || !canSave || pending}
          >
            <CheckIcon data-icon="inline-start" /> Guardar
          </Button>
        ),
      }}
    >
      <SummarySection title="Clasificación del correo" icon={BrainCircuitIcon}>
        <WheelField
          label="Umbral de confianza para revisar"
          valueLabel={`${thresholdPercent} %`}
          icon={GaugeIcon}
        >
          <WheelPickerWrapper className="flex w-full justify-center">
            <div role="group" aria-label="Umbral de confianza en porcentaje">
              <WheelPicker
                value={String(thresholdPercent)}
                onValueChange={(value) => setThresholdPercent(Number(value))}
                options={CONFIDENCE_OPTIONS}
                visibleCount={9}
              />
            </div>
          </WheelPickerWrapper>
        </WheelField>
        <SwitchFieldRow
          label="Aceptar remitentes verificados"
          description="Los remitentes estables podrán pasar sin revisión manual."
          checked={acceptVerifiedSenders}
          onCheckedChange={setAcceptVerifiedSenders}
          icon={ShieldCheckIcon}
        />
        <p className="text-xs text-muted-foreground">
          Los correos HOLDOUT conservan el umbral fijo y no se autoaceptan por
          remitente.
        </p>
        {!canSave ? (
          <p role="status" className="text-xs text-muted-foreground">
            {loadFailed
              ? "No se pudieron cargar tus ajustes de revisión."
              : "Cargando tus ajustes de revisión…"}
          </p>
        ) : null}
      </SummarySection>
    </BottomSheet>
  )
}
