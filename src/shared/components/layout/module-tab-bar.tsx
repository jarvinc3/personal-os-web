"use client"

import { isModuleSectionActive } from "@/src/shared/lib/module-nav-active"
import { cn } from "@/src/shared/lib/utils"
import { useScrollChrome } from "@/src/shared/context/scroll-chrome-context"
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
  const { hidden } = useScrollChrome()

  if (items.length === 0) {
    return null
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-300 ease-in-out md:hidden",
        hidden && "pointer-events-none translate-y-full",
      )}
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
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 py-2 text-center text-[10px] leading-tight sm:text-xs",
                  isCurrent
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="w-full truncate">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
