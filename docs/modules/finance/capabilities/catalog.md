# Capacidad: catálogo / cuentas

Rutas:

| Path | UI |
| --- | --- |
| `/finance/accounts` | Instituciones, cuentas, tarjetas. Atajos Categorías y Correos |
| `/finance/accounts/categories` | Categorías |
| `/finance/accounts/sync` | Buzones Gmail y vínculos de institución (no embebido en el listado) |
| `/finance/accounts/institutions/[institutionId]` | Detalle institución; atajo vincular correo |
| `/finance/accounts/[accountId]` | Detalle cuenta; suma los movimientos de sus tarjetas de débito |
| `/finance/accounts/cards/[cardId]` | Detalle tarjeta de crédito: estados de cuenta y movimientos |
| `/finance/loans/[loanId]` | Detalle préstamo: saldo, progreso y cuotas |

Totales de `GET /finance/balance-sheet` (no sumar monedas en cliente). Cuentas CHECKING/SAVINGS/INVESTMENT exigen institución; CASH no. Alta cuenta sin `balance`. Archivo cuenta `PATCH isActive:false`; institución/tarjeta DELETE (409 + `details.dependents`). Saldos tarjeta `POST /cards/:id/balances` números. CREDIT: campo **Balance disponible**, límite obligatorio. Categorías: `icon` un emoji, elegido en un panel con búsqueda o escrito con el teclado; lista con color de la card, FAB de alta y orden solo en memoria. `PATCH` puede cambiar `type` si no hay padre (`parentId: null` desvincula); con padre el tipo no se envía. DELETE system → 404.

Evidencia: `components/accounts/`, `catalog/`, hooks catalog.

Vistas de detalle (implementadas):

- Cuenta, tarjeta y préstamo son vistas secundarias, igual que institución: header secundario con volver y barra de pestañas oculta (`isFinanceSecondaryView` en `components/layout/finance-authenticated-page.tsx`). El contenido de cuenta y tarjeta usa el mismo contenedor redondeado que se solapa bajo el hero.
- Ruta única `/finance/accounts/[accountId]` para toda cuenta (CASH, CHECKING, SAVINGS, INVESTMENT); la tarjeta de débito abre el detalle de su cuenta ligada y esa vista suma los movimientos de la cuenta y de la tarjeta. `/finance/accounts/cash/[accountId]` quedó eliminada.
- `/finance/accounts/cards/[cardId]` muestra la tarjeta con pestañas **Estados de cuenta** (`GET /finance/cards/:id/statements`) y **Movimientos** (filtrados por `cardId`).
- `/finance/loans/[loanId]` muestra saldo, progreso y la lista de cuotas (`GET /finance/loans/:id/installments`). Se abre desde el detalle de institución y desde Planificación.
- Tocar una cuenta, tarjeta o préstamo abre su detalle; editar, ajustar saldo y archivar viven en el menú "..." del detalle, que reutiliza `AccountSheet`, `CardSheet`, `LoanSheet` y sus hojas de saldo.
- Cara de tarjeta de crédito: **deuda usada** (`límite − disponible`), con una barra de utilización por moneda. El listado de institución sigue mostrando el disponible (`CardProductRow`).
- El estado de cuenta muestra corte, vencimiento, balance del estado, pagado y restante. No hay pago mínimo: la API no lo expone.
- Reglas de estados de cuenta en `personal-os-back/docs/modules/finance/capabilities/statements.md`.
- Mockups de referencia en `docs/suggest/`.
