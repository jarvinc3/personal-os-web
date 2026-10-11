"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui"
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import {
  FormTextField,
  OptionRow,
  SwitchFieldRow,
} from "@/src/shared/components/layout/form-blocks"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  BadgeDollarSign,
  Bell,
  CoinsIcon,
  Layers,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  subscriptionsModuleSchema,
  type SubscriptionsModuleFormValues,
} from "@/src/modules/settings/lib/subscriptions-module-form"

const MODULE_ACCENT = getModule("subscriptions").accent

const GROUP_LABELS: Record<SubscriptionsModuleFormValues["groupBy"], string> = {
  category: "Categoría",
  provider: "Proveedor",
  none: "Ninguno",
}

export function SubscriptionsModuleSettingsForm({
  onDone,
}: {
  onDone: () => void
}) {
  const { config, updateConfig, updateMutation } =
    useUserModuleConfig("subscriptions")
  const moduleEnable = useModuleSheetEnable("subscriptions")

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, errors },
  } = useForm<SubscriptionsModuleFormValues>({
    resolver: zodResolver(subscriptionsModuleSchema),
    defaultValues: {
      defaultCurrency: config.defaultCurrency,
      groupBy: config.groupBy,
      renewalReminders: config.notifications.renewalReminders,
      priceIncreaseAlerts: config.notifications.priceIncreaseAlerts,
    },
  })

  const groupBy = useWatch({ control, name: "groupBy" })

  const formValues = useMemo(
    () => ({
      defaultCurrency: config.defaultCurrency,
      groupBy: config.groupBy,
      renewalReminders: config.notifications.renewalReminders,
      priceIncreaseAlerts: config.notifications.priceIncreaseAlerts,
    }),
    [config]
  )

  useProfileSheetFormSync(true, reset, formValues)

  const syncPendingOnSheetOpen = moduleEnable.syncPendingOnSheetOpen
  useEffect(() => {
    syncPendingOnSheetOpen()
  }, [syncPendingOnSheetOpen])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    await updateConfig(
      {
        defaultCurrency: values.defaultCurrency,
        groupBy: values.groupBy,
        notifications: {
          renewalReminders: values.renewalReminders,
          priceIncreaseAlerts: values.priceIncreaseAlerts,
        },
      },
      { isEnabled: moduleEnable.pendingEnabled }
    )
    appToast.success({
      text1: "Suscripciones actualizado",
      text2: "Configuración guardada.",
    })
    onDone()
  })

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <ModuleSheetEnableRow
        state={moduleEnable.state}
        isEnabled={moduleEnable.sheetEnabled}
        onEnabledChange={moduleEnable.handleEnabledChange}
        disabled={updateMutation.isPending}
      />

      <SummarySection title="Moneda" icon={BadgeDollarSign}>
        <Controller
          control={control}
          name="defaultCurrency"
          render={({ field }) => (
            <FormTextField
              icon={CoinsIcon}
              placeholder="DOP"
              value={field.value}
              onChange={field.onChange}
              disabled={updateMutation.isPending}
              error={errors.defaultCurrency?.message}
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Agrupar por" icon={Layers}>
        <RadioGroup
          value={groupBy}
          onValueChange={(v) =>
            setValue("groupBy", v as SubscriptionsModuleFormValues["groupBy"], {
              shouldDirty: true,
            })
          }
        >
          {(["category", "provider", "none"] as const).map((v) => (
            <OptionRow
              key={v}
              icon={Wallet}
              iconColor={MODULE_ACCENT}
              label={GROUP_LABELS[v]}
              selected={groupBy === v}
              onPress={() => setValue("groupBy", v, { shouldDirty: true })}
              trailing={<RadioGroupItem value={v} />}
            />
          ))}
        </RadioGroup>
      </SummarySection>

      <SummarySection title="Notificaciones" icon={Bell}>
        <Controller
          control={control}
          name="renewalReminders"
          render={({ field }) => (
            <SwitchFieldRow
              icon={RefreshCw}
              iconColor={MODULE_ACCENT}
              label="Avisos de renovación"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="priceIncreaseAlerts"
          render={({ field }) => (
            <SwitchFieldRow
              icon={TrendingUp}
              iconColor={MODULE_ACCENT}
              label="Subidas de precio"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SummarySection>
      <Button
        type="submit"
        className="h-11 w-full"
        disabled={
          !(isDirty || moduleEnable.isEnabledDirty) || updateMutation.isPending
        }
      >
        {updateMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
        {updateMutation.isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  )
}
