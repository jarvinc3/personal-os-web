# 07 · Comercios y pagos recurrentes

## Estado verificado

- `FinTransaction.merchant` es texto libre (`schema.prisma`).
- `FinRecurringPattern` existe en el esquema (`merchant`, `avgAmount`, `frequency`, `nextExpectedDate`, `confidenceScore`), pero no tiene REST, fachada, scheduler ni tools.
- No hay rutas `/finance/merchants` ni `/finance/recurring`. La landing pública promete "Detección de gastos recurrentes".

> El gestor completo de suscripciones (tablas propias, pagos vinculados, recordatorios, ciclos de facturación, vista principal en el tab bar) vive en [08 · Suscripciones](./08-suscripciones.md). Este pendiente solo entrega comercios y la detección básica de recurrentes.

## Comportamiento esperado

### Comercios

- Cada movimiento queda asociado a un comercio canónico ("UBER *TRIP 1234", "Uber Eats" → Uber). El usuario puede renombrar, unir comercios y poner categoría por defecto y logo.
- Al registrar o importar un movimiento de un comercio conocido se sugiere su categoría.
- Pantalla `/finance/merchants`: lista con gasto del mes y detalle con sus movimientos.

### Recurrentes

- Detección: mismo comercio, monto parecido (±10 %) y periodicidad (7, 14, 30 o 365 días con tolerancia), mínimo 3 ocurrencias (2 para anuales confirmadas por el usuario).
- Vista `/finance/subscriptions` (básica): patrones detectados por confirmar o descartar, y confirmados con próximo cobro, monto promedio y costo mensual y anual. Atajo en Planificación; fuera del tab bar.
- Alertas: "subió de precio" (>10 % sobre el promedio), "no llegó" (pasó la fecha esperada + tolerancia) y "próximo cobro" N días antes (usa los ajustes de notificaciones).
- También alta manual de un recurrente (ej. préstamo informal, renta) sin esperar la detección.

## Back

- Modelo `FinMerchant`: `id, userId, name, normalizedKey, aliases String[], categoryId?, logoUrl?, createdAt`; índice único `(userId, normalizedKey)`. `FinTransaction.merchantId?` (FK, `SetNull`), conservando `merchant` como texto original.
- Normalizador puro `normalize-merchant.ts` (mayúsculas, quitar números de referencia, `*`, sufijos de ciudad, prefijos de pasarela) con specs a partir de los fixtures de correos BHD/Popular/Qik.
- Los datos actuales son de prueba: no hay backfill ni script de migración; el comercio se resuelve al crear o importar cada movimiento.
- `FinRecurringPattern`: agregar `merchantId`, `status (SUGGESTED|CONFIRMED|DISMISSED)`, `kind (SUBSCRIPTION|BILL|INCOME|OTHER)`, `lastSeenAt`, `amountTolerance`, `confirmedAt`, `createdAt`.
- Scheduler nocturno `recurring-detection.scheduler.ts`; respetar `DISMISSED`.
- REST: `GET/PATCH /finance/merchants`, `POST /finance/merchants/:id/merge`, `POST /finance/merchants/:id/logo`, `GET /finance/merchants/suggest`, `GET /finance/recurring` (cursor, ver 04), `POST /finance/recurring`, `PATCH /finance/recurring/:id` (confirmar, descartar, editar), `GET /finance/recurring/upcoming?days=30`.
- Eventos para notificaciones: `FINANCE_RECURRING_PRICE_CHANGED`, `FINANCE_RECURRING_MISSED`, `FINANCE_RECURRING_UPCOMING`; el listener respeta el ajuste `recurringAlerts` de Finanzas.
- Tools: `list_subscriptions`, `confirm_recurring`, `list_merchants` (la primera lista los recurrentes detectados; el gestor de 08 añadirá su propia tool).
- La ingesta de correo asigna `merchantId` al crear el movimiento.

## Web

- Rutas `/finance/merchants`, `/finance/merchants/[merchantId]` y `/finance/subscriptions`.
- Comercios queda fuera del tab bar (`FINANCE_APP_NAV`) con atajo solo en Productos (no en Planificación). Suscripciones queda fuera del tab bar con atajo en Planificación.
- Hooks `use-merchants.ts`, `use-recurring.ts`; comercio visible en la fila y el detalle del movimiento (con logo).
- En el formulario de movimiento: autocompletar comercio y sugerir categoría.
- Actualizar `status.md` (hoy `planned`).

## Criterios de aceptación

- [ ] Movimientos de "UBER *TRIP" de distintas fechas quedan bajo el comercio Uber.
- [ ] Tres cobros mensuales de Netflix se detectan como suscripción sugerida.
- [ ] Confirmar muestra próximo cobro; descartar no la vuelve a sugerir.
- [ ] Una subida >10 % genera aviso.
- [ ] Migración sin drift; specs del normalizador y del detector.
