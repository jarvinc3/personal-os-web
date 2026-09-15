# Finance — overview

Gate `useFinanceEnabled`: módulo off → CTA Settings `?sheet=finance-sheet` y **no** llama `/finance/*`.

Money: lecturas decimal **strings**; writes **numbers** (`parseFinanceMoney` / `formatFinanceMoney`). Loan `interestRate` UI % → API fracción 0–1. `pctUsed` budgets se calcula en cliente.

Query keys: `src/modules/finance/types/api.ts` (`["finance", ...]`). Mutaciones de cuentas/tarjetas/loans/instituciones/txs confirmadas/email assign invalidan `FINANCE_BALANCE_SHEET_QUERY_KEY`.

Tab bar (4): Resumen, Movimientos, Planificación, Cuentas. Estadísticas `showInTabBar: false`. Sync no está en tab bar; sí embebido en Cuentas y ruta `/finance/sync`.

Helpers: `src/modules/finance/lib/money.ts`, `ledger-payloads.ts`. Tests: 20 specs bajo `lib/`.

> [!WARNING]
> **REV-WEB-012** (`CONTRADICE_CODIGO`) — docs y `APP_ROUTES` reclamaban `/finance/budgets` y “5 ítems” en tab bar. Presupuestos viven en `/finance/planning`. [review-register.md](../../review-register.md#rev-web-012)
