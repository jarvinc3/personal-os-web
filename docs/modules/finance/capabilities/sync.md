# Capacidad: Gmail sync (web)

Vista secundaria `/finance/sync` (hermana de Categorías). Header `secondary` título «Correos», back a Productos. Atajo en Productos (`MailIcon`).

OAuth autoriza **solo el buzón** (tokens). `returnTo` = `{NEXT_PUBLIC_URL}/finance/sync?sheet=oauth-gmail-result`: el callback vuelve **siempre** a `/finance/sync`, añade `success=true|false` y no lleva `institutionId`. Resultado: BottomSheet `floating` (éxito o error). La institución se vincula **después**, en un paso aparte: primero se conecta el buzón y luego cada remitente con una institución.

Vínculo de banco: institución + correos From del banco (`bankSenderEmails`). El dominio no es input. POST `/finance/email-sync/sources` con un Gmail ya conectado. Unique `(userId, institutionId)`: el atajo del detalle de institución queda `disabled` («Conectada a {gmail}») si ya hay source; si no, abre sheet de vínculo (sin Google). Sin buzones: CTA a Correos.

El efectivo (`CASH`) no se liga a mano a ninguna institución: el back lo guarda en la institución de sistema «Efectivo» que crea y mantiene por usuario, y rechaza vincularle un correo.

Ajustes: `emailSync.enabled` es el interruptor de la sincronización por correo y el back lo exige para conectar, sincronizar y vincular (403 si está apagado). `emailSync.automatic` solo gobierna el sync programado (`gmail-auto-sync.scheduler.ts` según `emailSync.schedule`: cada X minutos, mínimo 15, u horas fijas).

Lista colapsable por Gmail; hijos = instituciones (remitente + último sync + botón circular de sync). Pendientes de asignación arriba, cada uno con «Reintentar» (`POST /finance/email-sync/pending/:id/retry`); si el reintento no lo asigna, se sigue eligiendo destino a mano en el sheet. Sources inactivas ocultas. Sync automático opt-in en Ajustes → Finanzas. «Sincronizar ahora» en el sheet del vínculo (sección propia) y en Opciones de la institución. Sync sin Redis: UI muestra `reason`.

CORS_ORIGIN del API debe incluir origin de `NEXT_PUBLIC_URL`.
