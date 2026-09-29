"use client"

import { FINANCE_CARD_NETWORK_LABEL } from "@/src/modules/finance/constants/catalog"
import type { FinanceCardNetwork } from "@/src/modules/finance/constants/catalog"
import { cn } from "@/src/shared/lib/utils"
import Image from "next/image"
import { useState } from "react"

type BrandLogoProps = {
  name: string
  logoUrl?: string | null
  size?: number
  className?: string
}

export function brandInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}

export function BrandLogo({
  name,
  logoUrl,
  size = 40,
  className,
}: BrandLogoProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const failed = Boolean(logoUrl) && failedUrl === logoUrl
  const dimension = { width: size, height: size }

  if (!logoUrl || failed) {
    return (
      <span
        style={dimension}
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-white text-[0.65rem] font-semibold text-neutral-700",
          className,
        )}
        aria-label={name}
      >
        {brandInitials(name)}
      </span>
    )
  }

  return (
    <Image
      src={logoUrl}
      alt={name}
      width={size}
      height={size}
      className={cn("rounded-full bg-white object-contain", className)}
      onError={() => setFailedUrl(logoUrl)}
    />
  )
}

type CardNetworkMarkProps = {
  network?: FinanceCardNetwork | string | null
  logoUrl?: string | null
  size?: number
  className?: string
}

export function CardNetworkMark({
  network,
  logoUrl,
  size = 28,
  className,
}: CardNetworkMarkProps) {
  const label =
    network && network in FINANCE_CARD_NETWORK_LABEL
      ? FINANCE_CARD_NETWORK_LABEL[network as FinanceCardNetwork]
      : network || "Tarjeta"
  return (
    <BrandLogo
      name={label}
      logoUrl={logoUrl}
      size={size}
      className={className}
    />
  )
}

export function brandPreviewUrl(domain: string): string | null {
  const publishable = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY?.trim()
  const normalized = domain.trim().toLowerCase().replace(/^www\./, "")
  if (!publishable || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(normalized)) return null
  return `https://img.logo.dev/${encodeURIComponent(normalized)}?token=${encodeURIComponent(publishable)}&size=64&format=png&fallback=404`
}
