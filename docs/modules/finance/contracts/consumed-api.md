# Finance — contrato (consumo)

Dueño: `personal-os-back/docs/modules/finance/`. Query keys: `src/modules/finance/types/api.ts` (`['finance', ...]`).

| Superficie UI | HTTP (prefijo `/finance`) |
| --- | --- |
| Resumen | `balance-sheet`, `analytics/*`, `budget-status` |
| Movimientos | `transactions`, `transfers`, confirm/reverse |
| Planificación | ahorros, préstamos (+ `/loans/:id`, `/loans/:id/installments`, `POST /loans/:id/pay-next-installment`), cobros, `budgets` (paginado; **no** hay página `/finance/budgets`) |
| Cuentas | institutions, accounts, cards, categories, `cards/:id/statements` |
| Correos | `email-sync/mailboxes`, `email-sync/sources` (POST vínculo con `bankSenderEmail`), pending/assign/retry, `email-sync/oauth/google/*` |
| Tipos de moneda (`/settings/finance/currencies`) | `exchange-rates?base&quotes` (tasas de hoy UTC, `rate: null` si falta), `base-currency` (POST con rebase) |

Mutaciones de cuentas/tarjetas/loans/instituciones/txs confirmadas/email assign invalidan `FINANCE_BALANCE_SHEET_QUERY_KEY`.

Presupuestos viven en `/finance/planning` (REV-WEB-012). Cuentas y cobros se reciclan con archivar / `CANCELLED`; no hay DELETE.
