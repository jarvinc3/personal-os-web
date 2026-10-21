"use client"

import type { ModuleSettingsState } from "@/src/modules/settings/lib/module-settings-state"
import type {
  ConfigurableModuleSlug,
  ModuleSlug,
} from "@/src/modules/settings/types/module-config.types"
import { DEFAULT_MODULE_CONFIG_BY_SLUG } from "@/src/modules/settings/constants/user-settings-defaults"
import { SettingsSection } from "@/src/shared/components/layout/settings-section"
import { Button } from "@/src/shared/components/ui/button"
import {
  PendingSurface,
  usePendingNavigation,
} from "@/src/shared/components/ui/navigation-pending"
import { Separator } from "@/src/shared/components/ui/separator"
import { Switch } from "@/src/shared/components/ui/switch"
import {
  MODULE_REGISTRY,
  MODULE_SLUGS_ORDER,
} from "@/src/shared/constants/module-registry"
import { settingsModuleHref } from "@/src/shared/constants/app-routes"
import { appToast } from "@/src/shared/lib/app-toast"
import { ChevronLeftIcon, ChevronRightIcon, Settings } from "lucide-react"
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react"
import { usePendingModuleActivations } from "@/src/modules/settings/hooks/use-pending-module-activations"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import { moduleActivationLabel } from "@/src/modules/settings/lib/module-activation-status"

export function isConfigurableModuleSlug(
  slug: ModuleSlug
): slug is ConfigurableModuleSlug {
  return slug in DEFAULT_MODULE_CONFIG_BY_SLUG
}

export type ModuleSheetEnableRowProps = {
  state: ModuleSettingsState
  accentColor: string
  isEnabled: boolean
  pending: boolean
  onEnabledChange: (enabled: boolean) => void
  disabled?: boolean
}

function ModuleSheetEnableRow({
  state,
  accentColor,
  isEnabled,
  pending,
  onEnabledChange,
  disabled = false,
}: ModuleSheetEnableRowProps) {
  const id = useId()
  return (
    <div
      className="flex flex-row items-center justify-between rounded-2xl border bg-card px-4 py-3"
      style={
        isEnabled ? { borderColor: accentColor, borderWidth: 1 } : undefined
      }
    >
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer pr-3">
        <p className="text-base font-medium text-foreground">App activa</p>
        {state === "unconfigured" ? (
          <p className="text-xs text-muted-foreground">
            Se aplicará al guardar la configuración por primera vez.
          </p>
        ) : null}
        {pending ? (
          <p className="text-xs font-medium text-warning">
            Falta guardar: la app cambia cuando pulses Guardar.
          </p>
        ) : null}
      </label>
      <Switch
        id={id}
        checked={isEnabled}
        onCheckedChange={onEnabledChange}
        disabled={disabled}
      />
    </div>
  )
}

type ModuleSettingsRowsProps = {
  onOpenModule?: (slug: ConfigurableModuleSlug) => void
}

export const MODULE_SETTINGS_CARD_WIDTH = 156
export const MODULE_SETTINGS_CARD_GAP = 12

function ModuleSettingsRows({ onOpenModule }: ModuleSettingsRowsProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const list = listRef.current
    if (!list) {
      return
    }
    const maxScroll = list.scrollWidth - list.clientWidth
    setCanScrollLeft(list.scrollLeft > 1)
    setCanScrollRight(list.scrollLeft < maxScroll - 1)
  }, [])

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) {
      return
    }
    updateScrollState()
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(list)
    return () => observer.disconnect()
  }, [updateScrollState])

  const scrollByCard = (direction: -1 | 1) => {
    listRef.current?.scrollBy({
      left: direction * (MODULE_SETTINGS_CARD_WIDTH + MODULE_SETTINGS_CARD_GAP),
      behavior: "smooth",
    })
  }

  return (
    <SettingsSection
      title="Apps"
      bare
      headerTrailing={
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Apps anteriores"
            disabled={!canScrollLeft}
            onClick={() => scrollByCard(-1)}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Apps siguientes"
            disabled={!canScrollRight}
            onClick={() => scrollByCard(1)}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      }
    >
      <div
        ref={listRef}
        onScroll={updateScrollState}
        className="scrollbar-hide flex gap-3 overflow-x-auto pb-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {MODULE_SLUGS_ORDER.filter(isConfigurableModuleSlug).map((slug) => (
          <div
            key={slug}
            style={{
              scrollSnapAlign: "start",
              minWidth: MODULE_SETTINGS_CARD_WIDTH,
            }}
          >
            <ModuleSettingsCard
              slug={slug}
              onOpen={() => onOpenModule?.(slug)}
              href={onOpenModule ? undefined : settingsModuleHref(slug)}
            />
          </div>
        ))}
        <div style={{ minWidth: MODULE_SETTINGS_CARD_GAP }} />
      </div>
    </SettingsSection>
  )
}

type ModuleSettingsCardProps = {
  slug: ConfigurableModuleSlug
  onOpen: () => void
  href?: string
}

function ModuleSettingsCard({ slug, onOpen, href }: ModuleSettingsCardProps) {
  const { navigate, isPending } = usePendingNavigation()
  const moduleDef = MODULE_REGISTRY[slug]
  const Icon = moduleDef.icon
  const { state, entry, setModuleEnabled, updateMutation } =
    useUserModuleConfig(slug)
  const { pendingActivations } = usePendingModuleActivations()

  const handleOpen = () => {
    if (href) {
      navigate(href)
      return
    }
    onOpen()
  }

  const handleSwitchChange = async (checked: boolean) => {
    try {
      await setModuleEnabled(checked)
      appToast.success({
        text1: checked ? "App activada" : "App desactivada",
        text2: `${moduleDef.label} actualizado.`,
      })
    } catch {
      // Toast handled in mutation onError
    }
  }

  const statusLabel = moduleActivationLabel({
    state,
    savedIsEnabled: entry?.isEnabled ?? false,
    pendingEnabled: pendingActivations[slug] ?? null,
  })

  return (
    <div
      className="relative flex cursor-pointer flex-col rounded-[20px] border border-border bg-card p-2 transition-all duration-100 ease-in-out hover:bg-muted/50 active:scale-[0.99] active:bg-muted/50"
      style={{ width: MODULE_SETTINGS_CARD_WIDTH }}
      aria-busy={isPending || undefined}
      onClick={handleOpen}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="rounded-xl bg-muted p-2">
          <Icon className="size-5.5" style={{ color: moduleDef.accent }} />
        </div>

        {state === "unconfigured" ? (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleOpen()
              }}
            >
              <Settings className="size-4 text-foreground" />
            </Button>
          </div>
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={entry?.isEnabled ?? false}
              onCheckedChange={(checked) => void handleSwitchChange(checked)}
              disabled={updateMutation.isPending}
            />
          </div>
        )}
      </div>

      <Separator className="my-2" />

      <div className="mb-4 truncate px-2 text-ellipsis whitespace-nowrap">
        <p className="text-lg font-semibold text-foreground">
          {moduleDef.label}
        </p>
        <p className="text-xs text-muted-foreground">{statusLabel}</p>
      </div>
      {isPending ? <PendingSurface /> : null}
    </div>
  )
}

export { ModuleSettingsCard, ModuleSettingsRows, ModuleSheetEnableRow }
