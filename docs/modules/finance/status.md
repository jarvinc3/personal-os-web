# Finance — estado

Fecha: 2026-10-12

| Ítem                                                                                                                                        | Estado        | Evidencia                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| Shell, catálogo, dashboard, ledger, planificación, préstamos, cobros, metas y estadísticas                                                  | `implemented` | `app/(app)/finance/**`                                                                                            |
| Alta y edición en vista dedicada: movimiento, transferencia, préstamo, tarjeta e institución                                                | `implemented` | `app/(app)/finance/{transactions,transfers,loans,cards,institutions}/`; screens en `src/modules/finance/index.ts` |
| Alta y edición en sheet: cuenta, categoría, presupuesto, meta de ahorro, aporte, cobro, registrar cobro, ajustar saldo y vínculos de correo | `implemented` | `src/modules/finance/**/components/*-sheet.tsx`                                                                   |
| Correos `/finance/sync`                                                                                                                     | `implemented` | `sync/components/mailboxes-view.tsx`; OAuth vuelve aquí con el sheet `oauth-gmail-result`                         |
| Presupuestos                                                                                                                                | `implemented` | listado en `/finance/planning`; el detalle sí es `/finance/budgets/[budgetId]`                                    |
| Categorías                                                                                                                                  | `implemented` | `catalog/categories-screen.tsx`                                                                                   |
| Comercios, suscripciones y recurrentes                                                                                                      | `planned`     | no hay rutas `/finance/merchants`, `/finance/subscriptions` ni `/finance/recurring`                               |
| Deshacer tras eliminar                                                                                                                      | `implemented` | endpoints `POST <entidad>/:id/restore`; toast "Deshacer" en los 9 detalles                                        |
| Papelera de reciclaje (`/finance/recycle-bin`)                                                                                              | `implemented` | `recycle-bin/`; `GET /finance/recycle-bin`; restaurar con `PATCH isActive:true` y `POST <entidad>/:id/restore`    |
| Archivar pide confirmación y ofrece Deshacer                                                                                                | `implemented` | `shared/components/archive-record-dialog.tsx`; hooks `useUnarchive*`                                              |
| Prefill con el agente de IA                                                                                                                 | `planned`     | no existe                                                                                                         |

Las auditorías de formularios y su resultado están en [reference/auditorias/](../../reference/auditorias/README.md).
