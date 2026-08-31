"use client"

import { FINANCE_NAV_ITEMS } from "@/src/modules/finance/constants/nav"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { cn } from "@/src/shared/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

function isNavCurrent(pathname: string, href: string): boolean {
  if (pathname === href) {
    return true
  }
  if (href === APP_ROUTES.app.finance) {
    return false
  }
  return pathname.startsWith(`${href}/`)
}

export function FinanceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-16 md:px-6">
      <nav
        aria-label="Secciones de Finanzas"
        className="flex gap-1 overflow-x-auto border-b border-border pb-px [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {FINANCE_NAV_ITEMS.map((item) => {
          if (!item.ready) {
            return (
              <span
                key={item.label}
                className="shrink-0 px-3 py-2 text-sm text-muted-foreground"
              >
                {item.label}
              </span>
            )
          }

          const isCurrent = isNavCurrent(pathname, item.href)

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2 text-sm transition-colors",
                isCurrent
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      {children}
    </div>
  )
}
