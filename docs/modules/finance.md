# Finance Module (Web)

## Status

Finance **screens are not implemented** in `personal-os-web`. There is no `/finance` route, no hooks, and no sheets.

What exists today:

- Module toggle and config in Settings (`EditFinanceSheet`, slug `finance`)
- Path constants in `src/shared/constants/api-endpoints.ts` (`API_ENDPOINTS.FINANCE`) — unused by UI
- Chat with `moduleSlug=finance` (backend tools; subset of REST)

Do **not** copy the mobile tab layout (`Resumen` / `Movimientos` / …) into this repo. When web UI is built, design for the browser and follow the backend contract.

## Source of truth

Backend API, schema, money JSON (strings), list pagination, Gmail OAuth, and events:

[`personal-os-back/docs/modules/finance.md`](https://github.com/jarvinc3/personal-os-back/blob/develop/docs/modules/finance.md)

AI tools (not equivalent to REST): [`personal-os-back/docs/ai-tools/finance-tools.md`](https://github.com/jarvinc3/personal-os-back/blob/develop/docs/ai-tools/finance-tools.md)

## Gmail OAuth (web)

The API already supports a web return after Google consent (`returnTo` whose origin is in `CORS_ORIGIN`, plus optional `accountId` **xor** `cardId`). There is still **no** finance Gmail UI on web to start that flow.

Until a screen exists, connecting a bank mailbox is mobile or a manual API call.

## Related

- Settings module: `docs/modules/settings.md`
- Chat / AI: `docs/modules/ai.md`
