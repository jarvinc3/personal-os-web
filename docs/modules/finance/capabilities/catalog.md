# Capacidad: catálogo / cuentas

Rutas:

| Path | UI |
| --- | --- |
| `/finance/accounts` | Instituciones, cuentas, tarjetas. Atajos Categorías y Correos |
| `/finance/accounts/categories` | Categorías |
| `/finance/accounts/sync` | Buzones Gmail y vínculos de institución (no embebido en el listado) |
| `/finance/accounts/institutions/[institutionId]` | Detalle institución; atajo vincular correo |
| `/finance/accounts/cash/[accountId]` | Detalle cash |

Totales de `GET /finance/balance-sheet` (no sumar monedas en cliente). Cuentas CHECKING/SAVINGS/INVESTMENT exigen institución; CASH no. Alta cuenta sin `balance`. Archivo cuenta `PATCH isActive:false`; institución/tarjeta DELETE (409 + `details.dependents`). Saldos tarjeta `POST /cards/:id/balances` números. CREDIT: campo **Balance disponible**, límite obligatorio. Categorías: `icon` un emoji, elegido en un panel con búsqueda o escrito con el teclado; lista con color de la card, FAB de alta y orden solo en memoria. `PATCH` puede cambiar `type` si no hay padre (`parentId: null` desvincula); con padre el tipo no se envía. DELETE system → 404.

Evidencia: `components/accounts/`, `catalog/`, hooks catalog.
