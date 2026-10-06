"use client"

import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { isModuleSectionActive } from "@/src/shared/lib/module-nav-active"
import { cn } from "@/src/shared/lib/utils"
import type { ModuleNavItem } from "@/src/shared/types/module-nav"
import Link from "next/link"
import { usePathname } from "next/navigation"

type ModuleTabBarProps = {
  items: ModuleNavItem[]
  ariaLabel: string
  onItemPrefetch?: (href: string) => void
}

export function ModuleTabBar({
  items,
  ariaLabel,
  onItemPrefetch,
}: ModuleTabBarProps) {
  const pathname = usePathname()

  if (items.length === 0) {
    return null
  }

  return (
    <nav
      aria-label={ariaLabel}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-5xl items-stretch">
        {items.map((item) => {
          const isCurrent = isModuleSectionActive(item, pathname)
          const Icon = item.icon

          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                onPointerEnter={() => onItemPrefetch?.(item.href)}
                onFocus={() => onItemPrefetch?.(item.href)}
                className={cn(
                  "relative flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 py-2 text-center text-[10px] leading-tight sm:text-xs",
                  isCurrent
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="w-full truncate">{item.label}</span>
                <LinkPendingOverlay />
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
