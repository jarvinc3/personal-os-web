"use client"

import {
  formatProductCounts,
  formatStackItemBalance,
  institutionInitials,
  type InstitutionStackItem,
} from "@/src/modules/finance/lib/institution-stack";
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money";
import { cn } from "@/src/shared/lib/utils";
import { WalletIcon } from "lucide-react";
import type { CSSProperties } from "react";

const FALLBACK_INSTITUTION_COLOR = "#1B4332"
const FALLBACK_CASH_COLOR = "#334155"

type CatalogStackCardProps = {
  item: InstitutionStackItem
  display: FinanceMoneyDisplay
  className?: string
  style?: CSSProperties
  interactive?: boolean
  onClick?: () => void
}

function ContactlessIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 8.5c2.5-2 5.5-2 8 0" />
      <path d="M8 12c1.5-1.2 3.5-1.2 5 0" />
      <path d="M10 15.5c.8-.6 1.8-.6 2.6 0" />
    </svg>
  )
}

export function CatalogStackCard({
  item,
  display,
  className,
  style,
  interactive = true,
  onClick,
}: CatalogStackCardProps) {
  const isInstitution = item.kind === "institution"
  const color = isInstitution
    ? (item.institution.color ?? FALLBACK_INSTITUTION_COLOR)
    : (item.account.color ?? FALLBACK_CASH_COLOR)
  const title = isInstitution ? item.institution.name : item.account.name
  const subtitle = isInstitution
    ? formatProductCounts(item.counts)
    : "Efectivo sin institución"
  const balance = formatStackItemBalance(item, display)

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-black/25 text-sm font-bold tracking-wide">
          {isInstitution ? (
            institutionInitials(item.institution.name)
          ) : (
            <WalletIcon className="size-5" />
          )}
        </div>
        {isInstitution ? <ContactlessIcon className="size-6 opacity-80" /> : null}
      </div>

      <div className="mt-8 flex flex-1 flex-col gap-1">
        <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
        <p className="text-sm text-white/70">{subtitle}</p>
      </div>

      <div className="mt-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/60">
          {isInstitution ? "Balance consolidado" : "Saldo"}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
          {balance}
        </p>
      </div>
    </>
  )

  const sharedClassName = cn(
    "relative flex h-full w-full flex-col overflow-hidden rounded-3xl p-5 text-left text-white shadow-lg outline-none",
    className,
  )
  const sharedStyle = { backgroundColor: color, ...style }

  if (!interactive || !onClick) {
    return (
      <div className={sharedClassName} style={sharedStyle} aria-hidden={!interactive}>
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        sharedClassName,
        "cursor-pointer transition-transform active:scale-[0.99]",
      )}
      style={sharedStyle}
    >
      {content}
    </button>
  )
}
