"use client"

import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui"
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import { FormScreen } from "@/src/shared/components/forms/form-screen"
import { getModule } from "@/src/shared/constants/module-registry"
import { FinanceIntegritySettingsSection } from "@/src/modules/finance/integrity"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SaveIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { DisplaySection } from "./components/display-section"
import { EmailSyncSection } from "./components/email-sync-section"
import { FinancialMonthSection } from "./components/financial-month-section"
import { FixedIncomeSection } from "./components/fixed-income-section"
import { MovementDefaultsSection } from "./components/movement-defaults-section"
import { NotificationsSection } from "./components/notifications-section"
import { SubscriptionsSection } from "./components/subscriptions-section"
import {
  configToFinanceFormValues,
  emailSyncPatchFromFormValues,
  financeModuleSchema,
  parsePayDays,
  subscriptionsPatchFromFormValues,
  type FinanceModuleFormValues,
} from "./lib/finance-module-form"

const MODULE_ACCENT = getModule("finance").accent

export function FinanceModuleSettingsForm({ onDone }: { onDone: () => void }) {
  const { config, isModuleEnabled, updateConfig, updateMutation } =
    useUserModuleConfig("finance")
  const moduleEnable = useModuleSheetEnable("finance")
  const accountsQuery = useAccounts(isModuleEnabled)
  const accounts = accountsQuery.data ?? []

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FinanceModuleFormValues>({
    resolver: zodResolver(financeModuleSchema),
    defaultValues: configToFinanceFormValues(config),
  })

  const formValues = useMemo(() => configToFinanceFormValues(config), [config])
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
        weekStartsOn: Number(values.weekStartsOn) as 0 | 1,
        dashboardPeriod: values.dashboardPeriod,
        display: {
          showCents: values.showCents,
          compactNumbers: values.compactNumbers,
        },
        amountEntry: values.amountEntry,
        defaultAccountId: values.defaultAccountId || null,
        monthStartDay: Number(values.monthStartDay),
        reminders: {
          cardDueDaysBefore: Number(values.cardDueDaysBefore),
        },
        fixedIncome: {
          enabled: values.fixedIncomeEnabled,
          amount: Number(values.fixedIncomeAmount) || 0,
          frequency: values.fixedIncomeFrequency,
          payDays: parsePayDays(values.fixedIncomePayDays),
          accountId: values.fixedIncomeAccountId || null,
        },
        emailSync: emailSyncPatchFromFormValues(values),
        subscriptions: subscriptionsPatchFromFormValues(values),
        notifications: {
          budgetAlerts: values.budgetAlerts,
          aiSuggestions: values.aiSuggestions,
          transactionDetected: values.transactionDetected,
          monthlyReport: values.monthlyReport,
          weeklySummary: values.weeklySummary,
          cardDueDate: values.cardDueDate,
          unusualExpense: values.unusualExpense,
          recurringAlerts: values.recurringAlerts,
          subscriptionReminders: values.subscriptionReminders,
          priceIncreaseAlerts: values.priceIncreaseAlerts,
          balanceIntegrity: values.balanceIntegrity,
        },
        reports: {
          weeklySummaryDay: Number(values.weeklySummaryDay),
        },
      },
      { isEnabled: moduleEnable.pendingEnabled }
    )
    appToast.success({
      text1: "Finanzas actualizadas",
      text2: "La configuración de la app se guardó.",
    })
    onDone()
  })

  return (
    <FormScreen
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      submitLabel="Guardar"
      submitIcon={SaveIcon}
      isSubmitting={updateMutation.isPending}
      submitDisabled={
        !(isDirty || moduleEnable.isEnabledDirty) || updateMutation.isPending
      }
    >
      <ModuleSheetEnableRow
        state={moduleEnable.state}
        accentColor={MODULE_ACCENT}
        isEnabled={moduleEnable.sheetEnabled}
        onEnabledChange={moduleEnable.handleEnabledChange}
        disabled={updateMutation.isPending}
      />

      <DisplaySection control={control} baseCurrency={config.baseCurrency} />

      <FixedIncomeSection
        control={control}
        baseCurrency={config.baseCurrency}
        accounts={accounts}
      />

      <MovementDefaultsSection control={control} accounts={accounts} />

      <FinancialMonthSection control={control} />

      <SubscriptionsSection control={control} />

      <EmailSyncSection
        control={control}
        isSubmitting={updateMutation.isPending}
      />

      <NotificationsSection control={control} />

      <FinanceIntegritySettingsSection
        enabled={isModuleEnabled}
        display={{
          currency: config.baseCurrency,
          showCents: config.display.showCents,
          compactNumbers: config.display.compactNumbers,
        }}
      />
    </FormScreen>
  )
}
