# Capacidad: planificación (incluye presupuestos)

`/finance/planning`: arrays (no paginado) ahorros, préstamos, cobros **y** `FinanceBudgetsList` embebido (HTTP budgets sí es paginado).

Préstamos: tasa UI % → API 0–1; archivo DELETE / PATCH isActive false. Cobros: sin DELETE (`CANCELLED`); `PAID` sin `paidAmount` lo completa el API. Ahorros `isCompleted` del API.

No usa tool `list_budgets` del façade para la lista HTTP.
