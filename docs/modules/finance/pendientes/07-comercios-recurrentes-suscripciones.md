# 07 · Comercios, pagos recurrentes y suscripciones

## Estado verificado

- `FinTransaction.merchant` es texto libre (`schema.prisma`).
- `FinRecurringPattern` existe en el esquema (`merchant`, `avgAmount`, `frequency`, `nextExpectedDate`, `confidenceScore`), pero no tiene REST, fachada, scheduler ni tools.
- No hay rutas `/finance/merchants`, `/finance/subscriptions` ni `/finance/recurring`. La landing pública promete "Detección de gastos recurrentes".

## Comportamiento esperado

### Comercios

- Cada movimiento queda asociado a un comercio canónico ("UBER *TRIP 1234", "Uber Eats" → Uber). El usuario puede renombrar, unir comercios y poner categoría por defecto y logo.
- Al registrar o importar un movimiento de un comercio conocido se sugiere su categoría.
- Pantalla `/finance/merchants`: lista con gasto del mes y detalle con sus movimientos.

### Recurrentes y suscripciones

- Detección: mismo comercio, monto parecido (±10 %) y periodicidad (7, 14, 30 o 365 días con tolerancia), mínimo 3 ocurrencias (2 para anuales confirmadas por el usuario).
- Vista `/finance/subscriptions` (atajo en Planificación): patrones detectados por confirmar o descartar, y confirmados con próximo cobro, monto promedio y costo mensual/anual.
- Alertas: "subió de precio" (>10 % sobre el promedio), "no llegó" (pasó la fecha esperada + tolerancia) y "próximo cobro" N días antes (usa los ajustes de notificaciones).
- También alta manual de un recurrente (ej. préstamo informal, renta) sin esperar la detección.

## Back

- Modelo `FinMerchant`: `id, userId, name, normalizedKey, aliases String[], categoryId?, logoUrl?, createdAt`; índice único `(userId, normalizedKey)`. `FinTransaction.merchantId?` (FK, `SetNull`), conservando `merchant` como texto original.
- Normalizador puro `normalize-merchant.ts` (mayúsculas, quitar números de referencia, `*`, sufijos de ciudad, prefijos de pasarela) con specs a partir de los fixtures de correos BHD/Popular/Qik.
- Backfill dentro de la migración o en el primer arranque (los datos actuales son de prueba; se pueden borrar).
- `FinRecurringPattern`: agregar `merchantId`, `status (SUGGESTED|CONFIRMED|DISMISSED)`, `kind (SUBSCRIPTION|BILL|INCOME|OTHER)`, `lastSeenAt`, `amountTolerance`.
- Scheduler nocturno `recurring-detection.scheduler.ts`; respetar `DISMISSED`.
- REST: `GET/PATCH /finance/merchants`, `POST /finance/merchants/:id/merge`, `GET /finance/recurring` (cursor, ver 04), `POST /finance/recurring`, `PATCH /finance/recurring/:id` (confirmar, descartar, editar), `GET /finance/recurring/upcoming?days=30`.
- Eventos para notificaciones: `FINANCE_RECURRING_PRICE_CHANGED`, `FINANCE_RECURRING_MISSED`, `FINANCE_RECURRING_UPCOMING`.
- Tools: `list_subscriptions`, `confirm_recurring`, `list_merchants`.
- La ingesta de correo asigna `merchantId` al crear el movimiento.

## Web

- Rutas `/finance/merchants`, `/finance/merchants/[merchantId]`, `/finance/subscriptions`; registrar en `FINANCE_APP_NAV` (fuera del tab bar) y atajos en Planificación y Productos.
- Hooks `use-merchants.ts`, `use-recurring.ts`; comercio visible en la fila y el detalle del movimiento (con logo).
- En el formulario de movimiento: autocompletar comercio y sugerir categoría.
- Actualizar `status.md` (hoy `planned`).

## Criterios de aceptación

- [ ] Movimientos de "UBER *TRIP" de distintas fechas quedan bajo el comercio Uber.
- [ ] Tres cobros mensuales de Netflix se detectan como suscripción sugerida.
- [ ] Confirmar muestra próximo cobro; descartar no la vuelve a sugerir.
- [ ] Una subida >10 % genera aviso.
- [ ] Migración sin drift; specs del normalizador y del detector.
