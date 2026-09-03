# Finance Module (Web)

## Status

Shell of `/finance` (#14), catalog `/finance/accounts` (#15–#16), dashboard resumen (#17), paginated ledger (#18), capture/confirm/reverse/transfers (#19), paginated budgets (#20), planning (#21), Gmail sync (#22) and the Inicio shortcut plus landing `coming_soon` (#23) are in `personal-os-web`.

What exists today:

- Route `/finance` with module gate (`useFinanceEnabled`) — disabled/unconfigured shows CTA to Settings (`?sheet=finance-sheet`) and **does not** call `/finance/*`
- `/finance` dashboard: `analytics/summary`, spending-by-category, spending-over-time (`points`), budget-status. Charts via `ChartContainer` + Recharts (`src/shared/components/ui/chart.tsx`). `baseCurrency` comes from the summary payload.
- UI under `src/modules/finance/components/`: `layout/` (shell + gate), `catalog/` (instituciones, cuentas, tarjetas, categorías), `dashboard/` (resumen y charts), `transactions/` (listado, detalle, captura y transferencias), `budgets/` (listado paginado y sheet), `planning/` (ahorros, préstamos, cobros), `sync/` (Gmail OAuth y sources)
- `/finance/accounts`: instituciones, cuentas, tarjetas y **categorías** (arrays). Alta de cuenta **sin** `balance`. Archivo: cuenta `PATCH isActive: false`; institución/tarjeta `DELETE`. Saldos de tarjeta: `POST /finance/cards/:id/balances` (números). Categorías: `icon` es emoji; DELETE de system → 404 del API.
- `/finance/transactions`: `GET` paginado `{ items, pagination }` (default `page=1` `limit=20`). Filtros del DTO: fechas, cuenta, tarjeta, tipo, status. Detalle `GET :id`. Create DEBIT/CREDIT (`POST /transactions`), transfers (`POST /transfers`, never `type: TRANSFER` on create), PATCH, confirm, reverse, DELETE.
- `/finance/budgets`: `GET` paginado `{ items, pagination }` (default `page=1` `limit=20`). CRUD. `amountLimit`/`amountSpent` strings; `alertThresholdPct` number. `pctUsed` se calcula en cliente. No usa `list_budgets` del Facade.
- `/finance/planning`: arrays (no paginado). Ahorros (`isCompleted` del API). Préstamos: tasa UI `%` → API fracción `0.12`; archivo `DELETE` / `PATCH isActive: false`. Cobros: sin DELETE (`CANCELLED`); `PAID` sin `paidAmount` lo completa el API.
- `/finance/sync`: OAuth Gmail web (`returnTo` desde `NEXT_PUBLIC_URL`, origin `http://localhost:3000`, nunca Vite `:5173`). `accountId` xor `cardId`. Sources array. POST sync muestra `queued: false` + `reason` si no hay Redis. Callback de Google es el del **API** (`@Public()`).
- Desktop sub-nav (Resumen, Cuentas, Movimientos, Presupuestos, Planificación y Sincronizar listos)
- Money helpers `parseFinanceMoney` / `formatFinanceMoney` (`src/modules/finance/lib/money.ts`). Write payloads (`ledger-payloads.ts`) send amounts as JSON **numbers**.
- REST path constants including `TRANSACTION_REVERSE` and `TRANSFERS`
- Module toggle and config in Settings (`EditFinanceSheet`, slug `finance`)
- Chat with `moduleSlug=finance` (backend tools; subset of REST)
- Authenticated Inicio (`/home`) has a Finanzas shortcut (`APP_ROUTES.app.finance`) next to Keep Awake. Disabled module still opens `/finance` (shell gate, not 404). Landing `modules-data.ts` uses `coming_soon` until tracker #13 marks `available`.

Do **not** copy the mobile tab layout (`Resumen` / `Movimientos` / …) into this repo. Sub-nav is desktop (horizontal), compact scroll on narrow viewports.

Point the client at the API **develop** branch (money-as-string, reverse, OAuth `returnTo`).

## Routes

| Path | Ticket | Notes |
| --- | --- | --- |
| `/finance` | #14 / #17 | Shell + dashboard analytics |
| `/finance/accounts` | #15 / #16 | instituciones, cuentas, tarjetas, categorías |
| `/finance/transactions` | #18 / #19 | listado paginado + detalle + captura, confirm, reverse y transfers |
| `/finance/budgets` | #20 | listado paginado + CRUD |
| `/finance/planning` | #21 | ahorros, préstamos, cobros (arrays) |
| `/finance/sync` | #22 | Gmail OAuth web + sources + trigger sync |

## Money and list shapes

`api-client` already unwraps `{ data, meta }`. Hooks should type the inner payload.

- Read money: decimal **strings**. Write bodies: **numbers** (`parseFinanceMoney`; never send `NaN`).
- Loan `interestRate`: read string|null (`"0.12"` = 12%); write number 0–1. UI percent field. Null ≠ 0.
- Paginated: `GET /finance/transactions`, `GET /finance/budgets` → `{ items, pagination }`
- Arrays: accounts, cards, institutions, categories, savings-goals, loans, receivables, email sources
- Analytics: summary object; spending-over-time `{ points }`; spending-by-category and budget-status arrays

UI copy “Completado” = enum `CONFIRMED` (no `COMPLETED`).

Charts (dashboard, #17): `src/shared/components/ui/chart.tsx` + `recharts`. The shell empty state does **not** mount `ChartContainer`.

## Source of truth

Backend API, schema, money JSON (strings), list pagination, Gmail OAuth, and events:

[`personal-os-back/docs/modules/finance.md`](https://github.com/jarvinc3/personal-os-back/blob/develop/docs/modules/finance.md)

AI tools (not equivalent to REST): [`personal-os-back/docs/ai-tools/finance-tools.md`](https://github.com/jarvinc3/personal-os-back/blob/develop/docs/ai-tools/finance-tools.md)

## Gmail OAuth (web)

`/finance/sync` starts Google consent via `GET /finance/email-sync/oauth/google/url`.

- `returnTo` is always `{NEXT_PUBLIC_URL}/finance/sync/oauth` (local `http://localhost:3000/finance/sync/oauth`). The UI never takes a user-supplied return URL.
- Query includes `accountId` **xor** `cardId` (never both). Foreign `returnTo` origins are rejected by the API (400) and are not built by the client.
- After Google, the **API** public callback 302s to `{returnTo}?success=true|false`. `success=false` shows an error on `/finance/sync/oauth` (not a silent empty).
- POST `.../sources/:id/sync` without Redis returns `{ queued: false, reason }` and the UI shows `reason`.
- Google callback stays on the API (`@Public()`). `/finance/sync` is gated when the module is off.

CORS_ORIGIN on the API must include the origin of `NEXT_PUBLIC_URL`.

## Related

- Settings module: `docs/modules/settings.md`
- Chat / AI: `docs/modules/ai.md`
