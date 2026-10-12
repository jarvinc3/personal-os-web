# Finance — contrato (consumo)

Dueño: `personal-os-back/docs/modules/finance/`. Query keys: `src/modules/finance/shared/types/api.ts` (`['finance', ...]`).

| Superficie UI | HTTP (prefijo `/finance`) |
| --- | --- |
| Resumen | `balance-sheet`, `analytics/*`, `budget-status` |
| Movimientos | `transactions`, `transfers` (POST y PATCH `:id`), confirm/reverse |
| Planificación | ahorros (`savings-goals`, `:id/contributions` con `accountId`, DELETE del aporte), préstamos (+ `/loans/:id`, `/loans/:id/installments`, `POST /loans/:id/pay-next-installment`), cobros, `budgets` (paginado; listado en `/finance/planning`, detalle en `/finance/budgets/:id`) |
| Cuentas | institutions (+ `:id/logo`), accounts, cards (+ `:id/balances`, `:id/credit-limit`, `:id/statements`), categories |
| Correos | `email-sync/mailboxes`, `email-sync/sources` (POST vínculo con `bankSenderEmail`), pending/assign/retry, `email-sync/oauth/google/*` |
| Tipos de moneda (`/settings/finance/currencies`) | `exchange-rates?base&quotes` (tasas de hoy UTC, `rate: null` si falta), `base-currency` (POST con rebase) |

Mutaciones de cuentas/tarjetas/loans/instituciones/txs confirmadas/email assign invalidan `FINANCE_BALANCE_SHEET_QUERY_KEY`.

Presupuestos: el listado vive en `/finance/planning` (REV-WEB-012); el detalle sí tiene ruta. Cuentas y cobros se reciclan con archivar / `CANCELLED`; no hay DELETE.
