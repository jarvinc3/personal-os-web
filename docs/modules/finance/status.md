# Finance — estado

Fecha: 2026-09-16

| Ítem | Estado | Evidencia |
| --- | --- | --- |
| Shell, catalog, dashboard, ledger, planning, statistics | `implemented` | `app/(app)/finance/**` |
| Correos `/finance/accounts/sync` | `implemented` | `finance-mailboxes-view.tsx`; OAuth vuelve aquí con sheet `oauth-gmail-result` |
| Presupuestos | `implemented` en `/finance/planning` | no hay ruta `/finance/budgets`; reciclar cuentas/cobros = archivar / `CANCELLED` |
| `pages/finance-categories.tsx` | huérfano | route usa `finance-categories-view.tsx` — REV-WEB-013 |
