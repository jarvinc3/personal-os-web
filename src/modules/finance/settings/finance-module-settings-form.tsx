"use client"

import { FinanceIntegritySettingsSection } from "@/src/modules/finance/integrity"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { FINANCE_DASHBOARD_PERIOD_OPTIONS } from "@/src/modules/finance/shared/lib/dashboard-period"
import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui"
import { SETTINGS_SHEET_KEYS, WipeDataSheet } from "@/src/modules/settings"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { useDataBranches } from "@/src/modules/settings/hooks/use-data-branches"
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import { findAppBranches } from "@/src/modules/settings/lib/wipe-branches"
import { DATA_APP } from "@/src/modules/settings/types/wipe.types"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/settings/settings-section"
import { FormScreen } from "@/src/shared/components/forms/form-screen"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"

import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { getModule } from "@/src/shared/constants/module-registry"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeftRight,
  Bell,
  CalendarRange,
  Coins,
  HandCoins,
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
import { useEffect, useMemo, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { DisplaySection } from "./components/display-section"
import { FinancialMonthSection } from "./components/financial-month-section"
import { FixedIncomeSection } from "./components/fixed-income-section"
import { MovementDefaultsSection } from "./components/movement-defaults-section"
import { NotificationsSection } from "./components/notifications-section"
import { SubscriptionsSection } from "./components/subscriptions-section"
import {
  configToFinanceFormValues,
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

type SheetControl = ReturnType<typeof useSheetParam>

type FinanceSettingsSheetProps = {
  id: FinanceSettingsSheetId
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

function FinanceSettingsSheet({
  id,
  open,
  onOpenChange,
  children,
}: FinanceSettingsSheetProps) {
  const sheet = FINANCE_SETTINGS_SHEETS[id]

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader title={sheet.title} description={sheet.description} />
        <SheetBody>{children}</SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
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
  const branchesQuery = useDataBranches()
  const financeBranches = findAppBranches(branchesQuery.data, DATA_APP.FINANCE)
  const accountsQuery = useAccounts(isModuleEnabled)
  const accounts = accountsQuery.data ?? []
  const moneyDisplay = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }
  const displaySheet = useSheetParam(FINANCE_SHEET_KEYS.financeSettingsDisplay)
  const monthSheet = useSheetParam(FINANCE_SHEET_KEYS.financeSettingsMonth)
  const movementsSheet = useSheetParam(
    FINANCE_SHEET_KEYS.financeSettingsMovements
  )
  const fixedIncomeSheet = useSheetParam(
    FINANCE_SHEET_KEYS.financeSettingsFixedIncome
  )
  const subscriptionsSheet = useSheetParam(
    FINANCE_SHEET_KEYS.financeSettingsSubscriptions
  )
  const notificationsSheet = useSheetParam(
    FINANCE_SHEET_KEYS.financeSettingsNotifications
  )
  const wipeSheet = useSheetParam(SETTINGS_SHEET_KEYS.wipeData)
  const settingsSheets: Record<FinanceSettingsSheetId, SheetControl> = {
    display: displaySheet,
    month: monthSheet,
    movements: movementsSheet,
    fixedIncome: fixedIncomeSheet,
    subscriptions: subscriptionsSheet,
    notifications: notificationsSheet,
  }

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
            onPress={() => settingsSheets[id].setOpen(true)}
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

      {branchesQuery.isPending ? null : branchesQuery.isError ? (
        <ErrorState
          message="No se pudieron cargar las ramas de datos de Finanzas."
          onRetry={() => void branchesQuery.refetch()}
          isRetrying={branchesQuery.isFetching}
        />
      ) : financeBranches.length > 0 ? (
        <SettingsSection
          title="Zona de peligro"
          description="Borra solo las ramas de Finanzas que elijas. La cuenta y sus preferencias se conservan."
        >
          <SettingsRow
            label="Vaciar datos de Finanzas"
            description="Elige qué ramas vaciar: movimientos y saldos, productos, planificación, y comercios y categorías."
            destructive
            icon={Trash2}
            accentColor={SETTINGS_REGISTRY.danger.accent}
            onPress={() => wipeSheet.setOpen(true)}
            isLast
          />
        </SettingsSection>
      ) : null}

      <FinanceSettingsSheet
        id="display"
        open={displaySheet.open}
        onOpenChange={displaySheet.setOpen}
      >
        <DisplaySection control={control} baseCurrency={config.baseCurrency} />
      </FinanceSettingsSheet>

      <FinanceSettingsSheet
        id="month"
        open={monthSheet.open}
        onOpenChange={monthSheet.setOpen}
      >
        <FinancialMonthSection control={control} />
      </FinanceSettingsSheet>

      <FinanceSettingsSheet
        id="movements"
        open={movementsSheet.open}
        onOpenChange={movementsSheet.setOpen}
      >
        <MovementDefaultsSection
          control={control}
          accounts={accounts}
          display={moneyDisplay}
        />
      </FinanceSettingsSheet>

      <FinanceSettingsSheet
        id="fixedIncome"
        open={fixedIncomeSheet.open}
        onOpenChange={fixedIncomeSheet.setOpen}
      >
        <FixedIncomeSection
          control={control}
          baseCurrency={config.baseCurrency}
          accounts={accounts}
          display={moneyDisplay}
        />
      </FinanceSettingsSheet>

      <FinanceSettingsSheet
        id="subscriptions"
        open={subscriptionsSheet.open}
        onOpenChange={subscriptionsSheet.setOpen}
      >
        <SubscriptionsSection control={control} />
      </FinanceSettingsSheet>

      <FinanceSettingsSheet
        id="notifications"
        open={notificationsSheet.open}
        onOpenChange={notificationsSheet.setOpen}
      >
        <NotificationsSection control={control} />
      </FinanceSettingsSheet>

      <WipeDataSheet
        open={wipeSheet.open}
        onOpenChange={wipeSheet.setOpen}
        email={profileQuery.data?.email ?? ""}
        app={DATA_APP.FINANCE}
        title="Vaciar datos de Finanzas"
        description="Elige las ramas de Finanzas que quieres vaciar. La cuenta se conserva."
      />
    </FormScreen>
  )
}
