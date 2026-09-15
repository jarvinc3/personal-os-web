# Capacidad: Gmail sync (web)

`/finance/sync` y `/finance/sync/oauth`. Sources también en Cuentas.

`returnTo` siempre `{NEXT_PUBLIC_URL}/finance/sync/oauth?next={/finance/sync|/finance/accounts}`. Nunca URL libre. Query `institutionId` requerido. API callback 302 `{returnTo}?success=true|false`. `success=false` error visible. Connect/sync requieren `emailSync.enabled`.

Cola **Movimientos por asignar**: picker cuentas/tarjetas activas de esa institución; XOR; retry re-rutea. Sources inactivas ocultas. Sync sin Redis: UI muestra `reason`.

CORS_ORIGIN del API debe incluir origin de `NEXT_PUBLIC_URL`.
