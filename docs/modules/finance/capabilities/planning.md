# Capacidades: planificación, préstamos, cobros y metas de ahorro

Cuatro capabilities hermanas. Antes vivían todas bajo `src/modules/finance/planning/`; el código se separó para que cada dominio tenga su carpeta, su `index.ts` y su spec, como presupuestos.

| Capability | Carpeta | Rutas | Pantallas y hojas |
| --- | --- | --- | --- |
| Planificación | `src/modules/finance/planning/` | `/finance/planning` | Resumen con tabs: metas, préstamos, cobros y `FinanceBudgetsList` |
| Préstamos | `src/modules/finance/loans/` | `/finance/loans/[loanId]` | Detalle, `LoanSheet` y `LoanProgressCard` |
| Cobros | `src/modules/finance/receivables/` | `/finance/receivables/[receivableId]` | Detalle, `ReceivableSheet` y `ReceivablePaymentSheet` |
| Metas de ahorro | `src/modules/finance/savings-goals/` | `/finance/savings-goals/[goalId]` | Detalle, `SavingsGoalSheet` y `SavingsGoalContributionSheet` |

`/finance/planning`: arrays (no paginado) ahorros, préstamos, cobros **y** `FinanceBudgetsList` embebido (HTTP budgets sí es paginado). La lista de planificación compone las tres capabilities por su `index.ts`; el card de progreso compartido vive en `finance/shared/components/planning-progress-card.tsx`.

Préstamos: tasa UI % → API 0–1; archivo DELETE / PATCH isActive false. Cobros: sin DELETE (`CANCELLED`); `PAID` sin `paidAmount` lo completa el API. Ahorros `isCompleted` del API.

No usa tool `list_budgets` del façade para la lista HTTP.

Evidencia: `src/modules/finance/planning/`, `src/modules/finance/loans/`, `src/modules/finance/receivables/`, `src/modules/finance/savings-goals/`.
