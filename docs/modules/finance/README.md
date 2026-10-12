# Finance (web)

Contrato de dominio: **backend** `personal-os-back/docs/modules/finance/`. Aquí solo UI.

| Documento | Contenido |
| --- | --- |
| [overview.md](./overview.md) | Gate, money, chrome |
| [status.md](./status.md) | Estado |
| [capabilities/dashboard.md](./capabilities/dashboard.md) | Resumen y estadísticas |
| [capabilities/catalog.md](./capabilities/catalog.md) | Cuentas |
| [capabilities/transactions.md](./capabilities/transactions.md) | Ledger UI |
| [capabilities/planning.md](./capabilities/planning.md) | Planificación, préstamos, cobros y metas |
| [capabilities/sync.md](./capabilities/sync.md) | Correos: OAuth buzón + vínculo institución |
| [rules/gate.md](./rules/gate.md) | Módulo off, money, ruta muerta |
| [contracts/consumed-api.md](./contracts/consumed-api.md) | Superficies → HTTP |

**No existe** listado `/finance/budgets`. El listado de presupuestos vive en `/finance/planning`; el detalle sí es `/finance/budgets/[budgetId]`.
Cuentas y cobros se reciclan con archivar / `CANCELLED`; no hay DELETE (FKs Restrict en el ledger).

Alta y edición: movimiento, transferencia, préstamo, tarjeta e institución usan vista dedicada; cuenta, categoría, presupuesto, meta, aporte, cobro, registrar cobro, ajustar saldo y vínculos de correo siguen en sheet. Convenciones y componentes en [overview.md](./overview.md#convenciones-de-formularios).

Resultado de las auditorías de formularios: [reference/auditorias/](../../reference/auditorias/README.md).
