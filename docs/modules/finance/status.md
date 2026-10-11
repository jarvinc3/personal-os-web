# Finance — estado

Fecha: 2026-09-16

| Ítem | Estado | Evidencia |
| --- | --- | --- |
| Shell, catalog, dashboard, ledger, planning, préstamos, cobros, metas, statistics | `implemented` | `app/(app)/finance/**` |
| Correos `/finance/sync` | `implemented` | `sync/components/mailboxes-view.tsx`; OAuth vuelve aquí con sheet `oauth-gmail-result` |
| Presupuestos | `implemented` en `/finance/planning` | no hay ruta `/finance/budgets`; reciclar cuentas/cobros = archivar / `CANCELLED` |
| Categorías | `implemented` | `catalog/categories-screen.tsx`; la ruta importa `CategoriesScreen` desde el index — REV-WEB-013 resuelto |
