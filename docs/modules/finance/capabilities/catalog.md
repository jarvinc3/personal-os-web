# Capacidad: catálogo / cuentas

Rutas:

| Path | UI |
| --- | --- |
| `/finance/accounts` | Instituciones, cuentas, tarjetas, categorías, sources Gmail |
| `/finance/accounts/categories` | Categorías |
| `/finance/accounts/institutions/[institutionId]` | Detalle institución |
| `/finance/accounts/cash/[accountId]` | Detalle cash |

Totales de `GET /finance/balance-sheet` (no sumar monedas en cliente). Cuentas CHECKING/SAVINGS/INVESTMENT exigen institución; CASH no. Alta cuenta sin `balance`. Archivo cuenta `PATCH isActive:false`; institución/tarjeta DELETE (409 + `details.dependents`). Saldos tarjeta `POST /cards/:id/balances` números. CREDIT: campo **Balance disponible**, límite obligatorio. Categorías: `icon` emoji; DELETE system → 404.

Evidencia: `components/accounts/`, `catalog/`, hooks catalog.
