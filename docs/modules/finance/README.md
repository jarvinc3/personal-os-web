# Finance (web)

Contrato de dominio: **backend** `personal-os-back/docs/modules/finance/`. Aquí solo UI.

| Documento                                                      | Contenido                                  |
| -------------------------------------------------------------- | ------------------------------------------ |
| [dominio.md](./dominio.md)                                     | Cómo funciona hoy: modelo y flujos         |
| [overview.md](./overview.md)                                   | Gate, money, chrome                        |
| [capabilities/dashboard.md](./capabilities/dashboard.md)       | Resumen y estadísticas                     |
| [capabilities/catalog.md](./capabilities/catalog.md)           | Cuentas                                    |
| [capabilities/transactions.md](./capabilities/transactions.md) | Ledger UI                                  |
| [capabilities/planning.md](./capabilities/planning.md)         | Planificación, préstamos, cobros y metas   |
| [capabilities/sync.md](./capabilities/sync.md)                 | Correos: OAuth buzón + vínculo institución |
| [rules/gate.md](./rules/gate.md)                               | Módulo off, money, ruta muerta             |
| [contracts/consumed-api.md](./contracts/consumed-api.md)       | Superficies → HTTP                         |

Estado y trabajo pendiente: GitHub Issues del repo. Los specs de los pendientes 01–18 y 18.1, ya implementados, quedan archivados en [docs/archive/pendientes/](../../archive/pendientes/README.md).

**No existe** listado `/finance/budgets`. El listado de presupuestos vive en `/finance/planning`; el detalle sí es `/finance/budgets/[budgetId]`.
Cuentas y cobros se reciclan con archivar / `CANCELLED`; no hay DELETE (FKs Restrict en el ledger).

Alta y edición: movimiento, transferencia, préstamo, tarjeta e institución usan vista dedicada; cuenta, categoría, presupuesto, meta, aporte, cobro, registrar cobro, ajustar saldo y vínculos de correo siguen en sheet. Convenciones y componentes en [overview.md](./overview.md#convenciones-de-formularios).
