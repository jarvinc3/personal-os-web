# Finance Module (Web)

## Status

Shell of `/finance` (#14) and catalog `/finance/accounts` (#15) are in `personal-os-web`. There is no dashboard or ledger UI yet.

What exists today:

- Route `/finance` with module gate (`useFinanceEnabled`) — disabled/unconfigured shows CTA to Settings (`?sheet=finance-sheet`) and **does not** call `/finance/*`
- `/finance/accounts`: instituciones, cuentas y tarjetas (arrays, no paginados). Alta de cuenta **sin** `balance`. Archivo: cuenta `PATCH isActive: false`; institución/tarjeta `DELETE`. Saldos de tarjeta: `POST /finance/cards/:id/balances` (números).
- Desktop sub-nav (Resumen y Cuentas listos; el resto visible sin 404 hasta sus tickets)
- Money helpers `parseFinanceMoney` / `formatFinanceMoney` (`src/modules/finance/lib/money.ts`)
- REST path constants including `TRANSACTION_REVERSE`
- Module toggle and config in Settings (`EditFinanceSheet`, slug `finance`)
- Chat with `moduleSlug=finance` (backend tools; subset of REST)

Do **not** copy the mobile tab layout (`Resumen` / `Movimientos` / …) into this repo. Sub-nav is desktop (horizontal), compact scroll on narrow viewports.

Point the client at the API **develop** branch (money-as-string, reverse, OAuth `returnTo`).

## Routes

| Path | Ticket | Notes |
| --- | --- | --- |
| `/finance` | #14 | Shell + empty resumen |
| `/finance/accounts` | #15 | instituciones, cuentas, tarjetas |
| `/finance/transactions` | #18 / #19 | not routed yet |
| `/finance/budgets` | #20 | not routed yet |
| `/finance/planning` | #21 | not routed yet |
| `/finance/sync` | #22 | not routed yet |

## Money and list shapes

`api-client` already unwraps `{ data, meta }`. Hooks should type the inner payload.

- Read money: decimal **strings**. Write bodies: **numbers** (`parseFinanceMoney`; never send `NaN`).
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

The API already supports a web return after Google consent (`returnTo` whose origin is in `CORS_ORIGIN`, plus optional `accountId` **xor** `cardId`). There is still **no** finance Gmail UI on web to start that flow (`#22`). Local origin: `NEXT_PUBLIC_URL=http://localhost:3000` (not Vite 5173).

## Related

- Settings module: `docs/modules/settings.md`
- Chat / AI: `docs/modules/ai.md`
