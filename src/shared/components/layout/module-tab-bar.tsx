"use client"

import { useModuleFabRegistration } from "@/src/shared/components/layout/module-fab-context"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { isModuleSectionActive } from "@/src/shared/lib/module-nav-active"
import { cn } from "@/src/shared/lib/utils"
import type { ModuleNavItem } from "@/src/shared/types/module-nav"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

type ModuleTabBarProps = {
  items: ModuleNavItem[]
  ariaLabel: string
  onItemPrefetch?: (href: string) => void
}

const EASE = [0.22, 1, 0.36, 1] as const
const TAB_FADE_MS = 200

let persistedActiveHref: string | null = null

function useFadingTabHref(activeHref: string | undefined) {
  const [visualHref, setVisualHref] = useState(() =>
    persistedActiveHref && persistedActiveHref !== activeHref
      ? persistedActiveHref
      : activeHref
  )

  useEffect(() => {
    if (!activeHref) {
      return
    }
    if (visualHref === activeHref) {
      persistedActiveHref = activeHref
      return
    }

    const frame = requestAnimationFrame(() => {
      persistedActiveHref = activeHref
      setVisualHref(activeHref)
    })
    return () => cancelAnimationFrame(frame)
  }, [activeHref, visualHref])

  return visualHref
}

const ACTION_TONES: Record<string, string> = {
  "bg-violet-600": "bg-violet-600/20 text-violet-600",
  "bg-blue-500": "bg-blue-500/20 text-blue-500",
  "bg-amber-600": "bg-amber-600/20 text-amber-600",
  "bg-emerald-600": "bg-emerald-600/20 text-emerald-600",
  "bg-emerald-700": "bg-emerald-700/20 text-emerald-700",
  "bg-slate-600": "bg-slate-600/20 text-slate-600",
  "bg-destructive": "bg-destructive/20 text-destructive",
  "bg-success": "bg-success/20 text-success",
}

export function ModuleTabBar({
  items,
  ariaLabel,
  onItemPrefetch,
}: ModuleTabBarProps) {
  const pathname = usePathname()
  const activeHref = items.find((item) =>
    isModuleSectionActive(item, pathname)
  )?.href
  const visualHref = useFadingTabHref(activeHref)
  const reduceMotion = useReducedMotion() === true
  const registration = useModuleFabRegistration()
  const [menuOpenPath, setMenuOpenPath] = useState<string | null>(null)

  const actions = registration?.actions ?? []
  const hasMenu = actions.length > 0
  const menuOpen = hasMenu && menuOpenPath === pathname
  const fade = { duration: reduceMotion ? 0 : 0.2, ease: EASE }

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpenPath(null)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [menuOpen])

  if (items.length === 0) {
    return null
  }

  const columnCount = actions.length >= 4 ? 4 : Math.max(actions.length, 1)

  return (
    <>
      <AnimatePresence>
        {menuOpen ? (
          <motion.button
            key="tab-bar-backdrop"
            type="button"
            aria-label="Cerrar menú"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpenPath(null)}
          />
        ) : null}
      </AnimatePresence>

      <nav
        aria-label={ariaLabel}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <div className="pointer-events-auto flex items-end gap-2">
          <motion.div
            layout
            transition={{ layout: fade }}
            style={{ borderRadius: 28 }}
            className={cn(
              "overflow-hidden bg-muted shadow-lg ring-1 ring-border",
              menuOpen && "w-[min(22rem,calc(100vw-5rem))]"
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {menuOpen ? (
                <motion.div
                  key="shortcuts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                  role="group"
                  aria-label={registration?.label ?? "Acciones"}
                  className="grid w-full gap-2 p-2"
                  style={{
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  }}
                >
                  {actions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      disabled={action.disabled}
                      onClick={() => {
                        if (action.disabled) {
                          return
                        }
                        action.onClick()
                        setMenuOpenPath(null)
                      }}
                      className={cn(
                        "flex min-h-16 min-w-16 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 py-2 text-center text-[10px] leading-tight disabled:opacity-40 [&_svg]:size-5",
                        ACTION_TONES[action.color] ?? "bg-muted text-foreground"
                      )}
                    >
                      {action.icon}
                      <span className="truncate text-center text-xs font-semibold">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.ul
                  key="tabs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                  className="flex items-center gap-1 p-1.5"
                >
                  {items.map((item) => {
                    const isCurrent = item.href === activeHref
                    const isVisual = item.href === visualHref
                    const Icon = item.icon

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={isCurrent ? "page" : undefined}
                          aria-label={item.label}
                          onPointerEnter={() => onItemPrefetch?.(item.href)}
                          onFocus={() => onItemPrefetch?.(item.href)}
                          className={cn(
                            "relative flex h-9 items-center justify-center rounded-full px-3 transition-colors ease-out motion-reduce:transition-none",
                            isVisual
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                          style={{
                            transitionDuration: reduceMotion
                              ? "0ms"
                              : `${TAB_FADE_MS}ms`,
                          }}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "absolute inset-0 rounded-full bg-background shadow-sm transition-opacity ease-out motion-reduce:transition-none",
                              isVisual ? "opacity-100" : "opacity-0"
                            )}
                            style={{
                              transitionDuration: reduceMotion
                                ? "0ms"
                                : `${TAB_FADE_MS}ms`,
                            }}
                          />
                          <Icon
                            className="relative z-10 size-5 shrink-0"
                            aria-hidden
                          />
                          <span
                            aria-hidden
                            className={cn(
                              "relative z-10 grid transition-[grid-template-columns,opacity] ease-out motion-reduce:transition-none",
                              isVisual
                                ? "grid-cols-[1fr] opacity-100"
                                : "grid-cols-[0fr] opacity-0"
                            )}
                            style={{
                              transitionDuration: reduceMotion
                                ? "0ms"
                                : `${TAB_FADE_MS}ms`,
                            }}
                          >
                            <span className="overflow-hidden">
                              <span className="block pl-1.5 text-sm font-medium whitespace-nowrap">
                                {item.label}
                              </span>
                            </span>
                          </span>
                          <LinkPendingOverlay />
                        </Link>
                      </li>
                    )
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>

          {hasMenu ? (
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Cerrar acciones" : registration?.label}
              onClick={() =>
                setMenuOpenPath((current) =>
                  current === pathname ? null : pathname
                )
              }
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-background text-foreground shadow-lg ring-1 ring-border"
            >
              <motion.span
                className="flex items-center justify-center"
                initial={false}
                animate={{ rotate: menuOpen ? 135 : 0 }}
                transition={fade}
              >
                <Plus className="size-5" />
              </motion.span>
            </button>
          ) : null}
        </div>
      </nav>
    </>
  )
}
