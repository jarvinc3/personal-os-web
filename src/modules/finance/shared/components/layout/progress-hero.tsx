import { Badge, badgeVariants } from "@/src/shared/components/ui/badge"
import type { VariantProps } from "class-variance-authority"
import type { ReactNode } from "react"

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

type FinanceProgressHeroProps = {
  accent: string
  media: ReactNode
  title: string
  badge?: { label: string; variant?: BadgeVariant }
  subtitle?: ReactNode
  metricLabel: string
  metricValue: string
  progress: number
  startCaption: ReactNode
  endCaption: ReactNode
  footnote?: ReactNode
  decoration?: ReactNode
}

function clampPct(value: number): number {
  return Math.min(100, Math.max(0, value))
}

export function FinanceProgressHero({
  accent,
  media,
  title,
  badge,
  subtitle,
  metricLabel,
  metricValue,
  progress,
  startCaption,
  endCaption,
  footnote,
  decoration,
}: FinanceProgressHeroProps) {
  const width = clampPct(progress)

  return (
    <div className="-mx-4 -mt-4 overflow-hidden md:-mx-6">
      <div
        className="relative overflow-hidden rounded-b-3xl p-4 text-white md:p-6"
        style={{ background: accent }}
      >
        {decoration}
        <div className="relative z-10">
          <div className="flex items-start gap-3">
            {media}
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-2xl font-bold tracking-tight">
                  {title}
                </h1>
                {badge ? (
                  <Badge variant={badge.variant} className="shrink-0">
                    {badge.label}
                  </Badge>
                ) : null}
              </div>
              {subtitle ? (
                <p className="mt-1 text-sm text-white/70">{subtitle}</p>
              ) : null}
            </div>
          </div>

          <p className="mt-8 text-[11px] tracking-wide text-white/60 uppercase">
            {metricLabel}
          </p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {metricValue}
          </p>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${width}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-x-3 text-xs text-white/70">
            <span>{startCaption}</span>
            <span>{endCaption}</span>
          </div>
          {footnote ? (
            <p className="mt-3 text-sm text-white/80">{footnote}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
