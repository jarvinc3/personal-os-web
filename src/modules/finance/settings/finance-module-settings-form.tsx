"use client"

import { FinanceIntegritySettingsSection } from "@/src/modules/finance/integrity"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { FINANCE_DASHBOARD_PERIOD_OPTIONS } from "@/src/modules/finance/shared/lib/dashboard-period"
import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui"
import { WipeDataSheet } from "@/src/modules/settings"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import { FINANCE_WIPE_LAYERS } from "@/src/modules/settings/lib/wipe-layers"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section"
import { FormScreen } from "@/src/shared/components/forms/form-screen"
import { Button } from "@/src/shared/components/ui/button"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { getModule } from "@/src/shared/constants/module-registry"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeftRight,
  Bell,
  CalendarRange,
  Coins,
  HandCoins,
  Mail,
  Repeat,
  SaveIcon,
  Scale,
  ScanEyeIcon,
  Tags,
  Trash2,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, type ReactNode } from "react"
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

const FINANCE_SETTINGS_SHEETS = {
  display: {
    title: "Visualización y panel",
    description: "Período del panel y formato de las cantidades.",
    icon: ScanEyeIcon,
  },
  month: {
    title: "Mes financiero",
    description: "Cuándo empieza tu mes financiero.",
    icon: CalendarRange,
  },
  movements: {
    title: "Movimientos",
    description: "Cuenta por defecto y entrada de montos.",
    icon: ArrowLeftRight,
  },
  fixedIncome: {
    title: "Ingreso fijo",
    description: "Ingreso recurrente para el panel.",
    icon: HandCoins,
  },
  subscriptions: {
    title: "Suscripciones",
    description: "Avisos y agrupación de cobros.",
    icon: Repeat,
  },
  emailSync: {
    title: "Correo",
    description: "Sincronización automática y horarios.",
    icon: Mail,
  },
  notifications: {
    title: "Alertas",
    description: "Qué avisos de Finanzas recibes.",
    icon: Bell,
  },
} as const satisfies Record<
  string,
  { title: string; description: string; icon: LucideIcon }
>

type FinanceSettingsSheetId = keyof typeof FINANCE_SETTINGS_SHEETS

type FinanceSettingsSheetProps = {
  id: FinanceSettingsSheetId
  openSheet: FinanceSettingsSheetId | null
  onOpenSheetChange: (sheet: FinanceSettingsSheetId | null) => void
  children: ReactNode
}

function FinanceSettingsSheet({
  id,
  openSheet,
  onOpenSheetChange,
  children,
}: FinanceSettingsSheetProps) {
  const sheet = FINANCE_SETTINGS_SHEETS[id]

  return (
    <BottomSheet
      open={openSheet === id}
      onOpenChange={(open) => onOpenSheetChange(open ? id : null)}
      title={sheet.title}
      description={sheet.description}
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenSheetChange(null)}
          >
            <XIcon className="size-4 shrink-0" />
            Cerrar
          </Button>
        ),
      }}
    >
      {children}
    </BottomSheet>
  )
}

export function FinanceModuleSettingsForm({ onDone }: { onDone: () => void }) {
  const router = useRouter()
  const {
    config,
    isModuleEnabled,
    updateConfig,
    updateMutation,
    formatLocale,
    profileQuery,
  } = useUserModuleConfig("finance")
  const moduleEnable = useModuleSheetEnable("finance")
  const accountsQuery = useAccounts(isModuleEnabled)
  const accounts = accountsQuery.data ?? []
  const [openSheet, setOpenSheet] = useState<FinanceSettingsSheetId | null>(
    null
  )
  const [wipeSheetOpen, setWipeSheetOpen] = useState(false)

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

  const describeSheet = (id: FinanceSettingsSheetId): string | undefined => {
    switch (id) {
      case "display":
        return FINANCE_DASHBOARD_PERIOD_OPTIONS.find(
          (option) => option.value === config.dashboardPeriod
        )?.label
      case "month":
        return `Día ${config.monthStartDay}`
      case "movements":
        return (
          accounts.find((account) => account.id === config.defaultAccountId)
            ?.name ?? "Cuenta principal"
        )
      case "fixedIncome":
        return config.fixedIncome.enabled ? "Activado" : "Desactivado"
      case "subscriptions":
        return `${config.subscriptions.reminderDaysBefore} días antes`
      case "emailSync":
        if (!config.emailSync.enabled) {
          return "Desactivada"
        }
        return config.emailSync.automatic ? "Automática" : "Manual"
      case "notifications": {
        const active = Object.values(config.notifications).filter(
          Boolean
        ).length
        return `${active} de ${Object.keys(config.notifications).length} activas`
      }
    }
  }

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
    moduleEnable.markSaved()
    appToast.success({
      text1: "Finanzas actualizadas",
      text2: "La configuración de la app se guardó.",
    })
    onDone()
  })

  const sheetIds = Object.keys(
    FINANCE_SETTINGS_SHEETS
  ) as FinanceSettingsSheetId[]

  return (
    <FormScreen
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      submitEmphasis={moduleEnable.isEnabledDirty}
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
        pending={moduleEnable.isEnabledDirty}
        onEnabledChange={moduleEnable.handleEnabledChange}
        disabled={updateMutation.isPending}
      />

      <SettingsSection title="Accesos">
        <SettingsRow
          label="Categorías"
          description="Gestiona las categorías de movimientos."
          icon={Tags}
          accentColor={MODULE_ACCENT}
          onPress={() => router.push(APP_ROUTES.app.financeCategories)}
        />
        <SettingsRow
          label="Monedas"
          description="Monedas y tasas del ledger."
          icon={Coins}
          accentColor={MODULE_ACCENT}
          onPress={() => router.push(APP_ROUTES.app.settingsFinanceCurrencies)}
        />
        <SettingsRow
          label="Conciliación"
          description="Cierres y cargos bancarios."
          icon={Scale}
          accentColor={MODULE_ACCENT}
          onPress={() => router.push(APP_ROUTES.app.financeBankCharges)}
          isLast
        />
      </SettingsSection>

      <SettingsSection title="Configuración">
        {sheetIds.map((id, index) => (
          <SettingsRow
            key={id}
            label={FINANCE_SETTINGS_SHEETS[id].title}
            description={FINANCE_SETTINGS_SHEETS[id].description}
            value={describeSheet(id)}
            icon={FINANCE_SETTINGS_SHEETS[id].icon}
            accentColor={MODULE_ACCENT}
            onPress={() => setOpenSheet(id)}
            isLast={index === sheetIds.length - 1}
          />
        ))}
      </SettingsSection>

      <FinanceIntegritySettingsSection
        enabled={isModuleEnabled}
        display={{
          currency: config.baseCurrency,
          showCents: config.display.showCents,
          compactNumbers: config.display.compactNumbers,
          locale: formatLocale,
        }}
      />

      <SettingsSection
        title="Zona de peligro"
        description="Borra solo los datos de Finanzas. La cuenta y sus preferencias se conservan."
      >
        <SettingsRow
          label="Vaciar datos de Finanzas"
          description="Movimientos, cuentas, presupuestos, categorías y conexiones de correo."
          destructive
          icon={Trash2}
          accentColor={SETTINGS_REGISTRY.danger.accent}
          onPress={() => setWipeSheetOpen(true)}
          isLast
        />
      </SettingsSection>

      <FinanceSettingsSheet
        id="display"
        openSheet={openSheet}
        onOpenSheetChange={setOpenSheet}
      >
        <DisplaySection control={control} baseCurrency={config.baseCurrency} />
      </FinanceSettingsSheet>

      <FinanceSettingsSheet
        id="month"
        openSheet={openSheet}
        onOpenSheetChange={setOpenSheet}
      >
        <FinancialMonthSection control={control} />
      </FinanceSettingsSheet>

      <FinanceSettingsSheet
        id="movements"
        openSheet={openSheet}
        onOpenSheetChange={setOpenSheet}
      >
        <MovementDefaultsSection control={control} accounts={accounts} />
      </FinanceSettingsSheet>

      <FinanceSettingsSheet
        id="fixedIncome"
        openSheet={openSheet}
        onOpenSheetChange={setOpenSheet}
      >
        <FixedIncomeSection
          control={control}
          baseCurrency={config.baseCurrency}
          accounts={accounts}
        />
      </FinanceSettingsSheet>

      <FinanceSettingsSheet
        id="subscriptions"
        openSheet={openSheet}
        onOpenSheetChange={setOpenSheet}
      >
        <SubscriptionsSection control={control} />
      </FinanceSettingsSheet>

      <FinanceSettingsSheet
        id="emailSync"
        openSheet={openSheet}
        onOpenSheetChange={setOpenSheet}
      >
        <EmailSyncSection
          control={control}
          isSubmitting={updateMutation.isPending}
        />
      </FinanceSettingsSheet>

      <FinanceSettingsSheet
        id="notifications"
        openSheet={openSheet}
        onOpenSheetChange={setOpenSheet}
      >
        <NotificationsSection control={control} />
      </FinanceSettingsSheet>

      <WipeDataSheet
        open={wipeSheetOpen}
        onOpenChange={setWipeSheetOpen}
        email={profileQuery.data?.email ?? ""}
        title="Vaciar datos de Finanzas"
        description="Borra solo los datos de Finanzas. La cuenta se conserva."
        confirmTitle="¿Vaciar los datos de Finanzas?"
        layers={FINANCE_WIPE_LAYERS}
      />
    </FormScreen>
  )
}
