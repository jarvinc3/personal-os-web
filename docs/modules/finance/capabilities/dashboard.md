# Capacidad: dashboard y estadísticas

| Path | Página |
| --- | --- |
| `/finance` | Overview: `GET /finance/balance-sheet` net worth; `analytics/summary` cash flow periodo; spending-by-category; spending-over-time `points`; budget-status. Charts `ChartContainer` + Recharts. Empty shell no monta charts. `baseCurrency` del balance-sheet. Period selectors no cambian el snapshot. |
| `/finance/statistics` | Estadísticas (sidebar only) |

`FinCardBalance.balance` = crédito **disponible**, no deuda.

Evidencia: `components/dashboard/`, `hooks/use-balance-sheet.ts`, `use-analytics.ts`.
