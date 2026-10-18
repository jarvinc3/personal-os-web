import {
  ChartPieIcon,
  HandCoinsIcon,
  HandshakeIcon,
  PiggyBankIcon,
} from "lucide-react"

/** Tabs of the planning screen, in the order the hero cycles through them. */
export const PLANNING_TAB_ITEMS = [
  {
    value: "savings",
    label: "Ahorros",
    figure: "Ahorrado",
    icon: PiggyBankIcon,
    color: "#16a34a",
  },
  {
    value: "budgets",
    label: "Presupuestos",
    figure: "Gastado",
    icon: ChartPieIcon,
    color: "#8b5cf6",
  },
  {
    value: "receivables",
    label: "Cobros",
    figure: "Por cobrar",
    icon: HandshakeIcon,
    color: "#3b82f6",
  },
  {
    value: "loans",
    label: "Préstamos",
    figure: "Saldo pendiente",
    icon: HandCoinsIcon,
    color: "#f59e0b",
  },
] as const

export type PlanningTab = (typeof PLANNING_TAB_ITEMS)[number]["value"]

export type PlanningTabItem = (typeof PLANNING_TAB_ITEMS)[number]

/** Tab the screen opens on. */
export const DEFAULT_PLANNING_TAB: PlanningTab = "savings"

/** Tab a cobros share link opens on. */
export const SHARE_PLANNING_TAB: PlanningTab = "receivables"

export function isPlanningTab(value: unknown): value is PlanningTab {
  return PLANNING_TAB_ITEMS.some((tab) => tab.value === value)
}

export function planningTabItem(tab: PlanningTab): PlanningTabItem {
  const item = PLANNING_TAB_ITEMS.find((entry) => entry.value === tab)
  if (!item) {
    throw new Error(`Unknown planning tab: ${tab}`)
  }
  return item
}

export function planningTabLabel(tab: PlanningTab): string {
  const item = planningTabItem(tab)
  return `${item.label} · ${item.figure}`
}

/** The next tab in display order, wrapping around. */
export function nextPlanningTab(tab: PlanningTab): PlanningTab {
  const index = PLANNING_TAB_ITEMS.indexOf(planningTabItem(tab))
  const next = PLANNING_TAB_ITEMS[(index + 1) % PLANNING_TAB_ITEMS.length]
  if (!next) {
    throw new Error("Planning tabs are empty")
  }
  return next.value
}
