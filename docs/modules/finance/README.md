# Finance (web)

Contrato de dominio: **backend** `personal-os-back/docs/modules/finance/`. Aquí solo UI.

| Documento | Contenido |
| --- | --- |
| [overview.md](./overview.md) | Gate, money, chrome |
| [status.md](./status.md) | Estado |
| [capabilities/dashboard.md](./capabilities/dashboard.md) | Resumen y estadísticas |
| [capabilities/catalog.md](./capabilities/catalog.md) | Cuentas |
| [capabilities/transactions.md](./capabilities/transactions.md) | Ledger UI |
| [capabilities/planning.md](./capabilities/planning.md) | Planificación + presupuestos |
| [capabilities/sync.md](./capabilities/sync.md) | Correos: OAuth buzón + vínculo institución |
| [rules/gate.md](./rules/gate.md) | Módulo off, money, ruta muerta |
| [contracts/consumed-api.md](./contracts/consumed-api.md) | Superficies → HTTP |

**No existe** página `/finance/budgets`. Los presupuestos viven en `/finance/planning`.
Cuentas y cobros se reciclan con archivar / `CANCELLED`; no hay DELETE (FKs Restrict en el ledger).
