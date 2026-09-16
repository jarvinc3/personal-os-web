# Capacidad: Gmail sync (web)

Vista secundaria `/finance/accounts/sync` (hermana de Categorías). Header `secondary` título «Correos», back a Cuentas. Atajo en Cuentas (`MailIcon`).

OAuth autoriza el **buzón** (tokens). `returnTo` = `{NEXT_PUBLIC_URL}/finance/accounts/sync?sheet=oauth-gmail-result`. Sin `institutionId`. El callback añade `success=true|false`. Resultado: BottomSheet `floating` (éxito o error). Connect/sync/vínculo requieren `emailSync.enabled`.

Vínculo de banco: institución + correo From completo (`bankSenderEmail`). El dominio no es input. POST `/finance/email-sync/sources` con un Gmail ya conectado. Unique `(userId, institutionId)`: el atajo del detalle de institución queda `disabled` («Conectada a {gmail}») si ya hay source; si no, abre sheet de vínculo (sin Google). Sin buzones: CTA a Correos.

Lista colapsable por Gmail; hijos = instituciones. Pendientes de asignación arriba. Sources inactivas ocultas. Sync sin Redis: UI muestra `reason`.

CORS_ORIGIN del API debe incluir origin de `NEXT_PUBLIC_URL`.
