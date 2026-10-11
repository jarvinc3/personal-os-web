"use client"

import { useKeepAwake } from "@/src/modules/keep-awake/context/keep-awake-context"
import {
  getKeepAwakeHomeSummary,
  type KeepAwakeHomeChip,
  type KeepAwakeHomeStat,
  type KeepAwakeHomeStatus,
} from "@/src/modules/keep-awake/lib/keep-awake-home-summary"
import {
  DEFAULT_PREFS,
  getPrefsSnapshot,
  subscribePrefs,
} from "@/src/modules/keep-awake/lib/prefs"
import {
  DEFAULT_REMINDER,
  getReminderSnapshot,
  subscribeReminder,
} from "@/src/modules/keep-awake/lib/reminders"
import {
  getHistorySnapshot,
  getServerHistorySnapshot,
  subscribeHistory,
} from "@/src/modules/keep-awake/lib/session-history"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { cn } from "@/src/shared/lib/utils"
import {
  Bell,
  BellOff,
  ChevronRight,
  Clock,
  History,
  Infinity as InfinityIcon,
  Layers,
  Monitor,
  Timer,
  type LucideIcon,
} from "lucide-react"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import Link from "next/link"
import { useSyncExternalStore } from "react"

const STAT_ICONS: Record<KeepAwakeHomeStat["key"], LucideIcon> = {
  today: Clock,
  session: Timer,
  last: History,
}

const CHIP_ICONS: Record<KeepAwakeHomeChip["key"], LucideIcon> = {
  reminder: Bell,
  mode: Timer,
  sessions: Layers,
}

export function KeepAwakeHomeSection() {
  const { phase, elapsedSeconds, remainingSeconds, endsAt, startTimestamp } =
    useKeepAwake()
  const history = useSyncExternalStore(
    subscribeHistory,
    getHistorySnapshot,
    getServerHistorySnapshot
  )
  const reminder = useSyncExternalStore(
    subscribeReminder,
    getReminderSnapshot,
    () => DEFAULT_REMINDER
  )
  const prefs = useSyncExternalStore(
    subscribePrefs,
    getPrefsSnapshot,
    () => DEFAULT_PREFS
  )
  const summary = getKeepAwakeHomeSummary({
    phase,
    elapsedSeconds,
    remainingSeconds,
    endsAt,
    startTimestamp,
    history,
    reminder,
    prefs,
  })

  return (
    <SummarySection
      title="Keep Awake"
      icon={Monitor}
      right={
        <>
          <KeepAwakeStatusBadge status={summary.status} />
          <Button asChild variant="secondary" className="h-6">
            <Link href={APP_ROUTES.app.keepAwake} className="relative">
              <span className="sr-only">Abrir Keep Awake</span>
              <ChevronRight className="size-4" />
              <LinkPendingOverlay />
            </Link>
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {summary.stats.map((stat, index) => (
            <KeepAwakeStatPill
              key={stat.key}
              stat={stat}
              align={index === 0 ? "start" : "end"}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1 px-0.5">
          {summary.chips.map((chip) => (
            <KeepAwakeSummaryChip key={chip.key} chip={chip} />
          ))}
        </div>
      </div>
    </SummarySection>
  )
}

function KeepAwakeStatusBadge({ status }: { status: KeepAwakeHomeStatus }) {
  const variant =
    status.tone === "success"
      ? "success"
      : status.tone === "warning"
        ? "warning"
        : "secondary"

  return (
    <Badge variant={variant}>
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-full transition-colors",
          status.tone === "success" && "bg-success",
          status.tone === "warning" && "bg-warning",
          status.tone === "muted" && "bg-muted-foreground/40",
          status.pulse && "motion-safe:animate-pulse",
          status.pulse &&
            status.tone === "success" &&
            "shadow-[0_0_0_6px_color-mix(in_srgb,var(--success)_25%,transparent)]",
          status.pulse &&
            status.tone === "warning" &&
            "shadow-[0_0_0_6px_color-mix(in_srgb,var(--warning)_25%,transparent)]"
        )}
        aria-hidden
      />
      <span className="text-xs font-medium">{status.label}</span>
    </Badge>
  )
}

function KeepAwakeStatPill({
  stat,
  align,
}: {
  stat: KeepAwakeHomeStat
  align: "start" | "end"
}) {
  const Icon = STAT_ICONS[stat.key]
  const start = align === "start"
  const iconClass = cn(
    "absolute top-1/2 size-4 -translate-y-1/2",
    start ? "right-2" : "left-2",
    stat.key === "session" ? "text-success" : "text-muted-foreground"
  )

  return (
    <div
      aria-label={`${stat.label}: ${stat.value}`}
      className={cn(
        "relative flex items-center rounded-2xl border border-border bg-card px-3 py-2",
        start ? "justify-start" : "justify-end text-right"
      )}
    >
      {start ? null : <Icon className={iconClass} />}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">{stat.label}</p>
        <p className="text-sm font-semibold tabular-nums">{stat.value}</p>
      </div>
      {start ? <Icon className={iconClass} /> : null}
    </div>
  )
}

function KeepAwakeSummaryChip({ chip }: { chip: KeepAwakeHomeChip }) {
  const Icon =
    chip.key === "reminder"
      ? chip.muted
        ? BellOff
        : Bell
      : chip.key === "mode" && chip.label === "Libre"
        ? InfinityIcon
        : CHIP_ICONS[chip.key]

  return (
    <Badge
      variant="outline"
      className={cn(chip.muted && "text-muted-foreground")}
    >
      <Icon />
      {chip.label}
    </Badge>
  )
}
