"use client"

import { ModuleSettingsFormShell } from "@/src/modules/settings/components/module-settings/module-settings-form-shell"
import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui";
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable";
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet";
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config";
import { FormTextField, OptionRow, SwitchFieldRow } from "@/src/shared/components/layout/form-blocks";
import { RadioGroup, RadioGroupItem } from "@/src/shared/components/ui/radio-group";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { getModule } from "@/src/shared/constants/module-registry";
import { appToast } from "@/src/shared/lib/app-toast";
import { createSheetSubmit } from "@/src/shared/lib/sheet-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeDollarSign, Bell, Layers, Wallet } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const MODULE_ACCENT = getModule("subscriptions").accent

const schema = z.object({
  defaultCurrency: z.string().trim().min(3),
  groupBy: z.enum(["category", "provider", "none"]),
  renewalReminders: z.boolean(),
  priceIncreaseAlerts: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const GROUP_LABELS: Record<FormValues["groupBy"], string> = {
  category: "Categoría",
  provider: "Proveedor",
  none: "Ninguno",
}

export function SubscriptionsModuleSettingsForm({ onDone }: { onDone: () => void }) {
  const { config, updateConfig, updateMutation } =
    useUserModuleConfig("subscriptions")
  const moduleEnable = useModuleSheetEnable("subscriptions")

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
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

  useEffect(() => {
    moduleEnable.syncPendingOnSheetOpen()
  }, [moduleEnable.syncPendingOnSheetOpen])

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
    <ModuleSettingsFormShell
      onSubmit={onSubmit}
      canSave={isDirty || moduleEnable.isEnabledDirty}
      pending={updateMutation.isPending}
    >
      {config.fieldGuide ? (
        <p className="text-sm text-muted-foreground">{config.fieldGuide}</p>
      ) : null}
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
            setValue("groupBy", v as FormValues["groupBy"], {
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
              label="Subidas de precio"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SummarySection>
    </ModuleSettingsFormShell>
  )
}
