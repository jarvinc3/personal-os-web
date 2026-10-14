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
- Vista `/finance/subscriptions`: pantalla principal de Finanzas (en el tab bar, entre Planificación y Productos). Resumen de costo mensual y anual, próximos cobros, detectadas por confirmar o descartar, confirmadas con detalle, búsqueda y filtros, y estados de carga, vacío y error. Detalle de cada suscripción en `/finance/subscriptions/[patternId]`.
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

- Rutas `/finance/merchants`, `/finance/merchants/[merchantId]`, `/finance/subscriptions` y `/finance/subscriptions/[patternId]`.
- `/finance/subscriptions` entra en el **tab bar principal** de Finanzas entre Planificación y Productos; el detalle de la suscripción sale del tab bar. `/finance/merchants` queda fuera del tab bar (`FINANCE_APP_NAV`) con atajo solo en Productos (no en Planificación).
- Suscripciones es una vista principal: resumen (costo mensual y anual de las confirmadas), próximos cobros (usa `GET /finance/recurring/upcoming`), pestañas por estado con búsqueda por comercio, tarjetas con próximo cobro y costo mensual/anual, acciones de confirmar, descartar y editar, y alta manual. El detalle muestra el historial de cobros, el monto promedio, la tolerancia y las mismas acciones.
- Hooks `use-merchants.ts`, `use-recurring.ts`; comercio visible en la fila y el detalle del movimiento (con logo).
- En el formulario de movimiento: autocompletar comercio y sugerir categoría.
- Actualizar `status.md` (hoy `planned`).

## Suscripciones (gestor completo · segundo release del 07)

Referencia: `personal-os-back/docs/implementations/modulo-suscripciones.md`, adaptado a Finanzas (los patrones detectados son la fuente de sugerencias; la suscripción es lo que el usuario gestiona). Se entrega en dos releases dentro del 07: el primero con comercios y detección de recurrentes; el segundo con el gestor completo de suscripciones.

### Back

- Modelo `FinSubscription`: `id, userId, name, normalizedKey, domain?, logoUrl?, amount, currency, billingCycle (WEEKLY|MONTHLY|QUARTERLY|SEMIANNUAL|YEARLY), billingInterval, anchorDate, nextBillingDate, trialEndsAt?, status (ACTIVE|PAUSED|CANCELLED), pausedAt?, cancelledAt?, reminderDaysBefore, lastRemindedFor?, cardId?, accountId?, manageUrl?, notes?, sourcePatternId?, createdAt, updatedAt`.
- Modelo `FinSubscriptionPayment`: `id, subscriptionId, transactionId?, amount, currency, paidAt, source (AUTO|MANUAL), createdAt`.
- `nextBillingDate` se calcula siempre desde `anchorDate` para no arrastrar el desfase de fin de mes (ancla día 31 → febrero 28 → marzo 31).
- Costo mensual equivalente (`amount × períodosPorAño / 12`) y anual; suma multimoneda con `fin_exchange_rates`.
- Job diario de recordatorios: suscripciones `ACTIVE` con `nextBillingDate - reminderDaysBefore <= hoy` y `lastRemindedFor` distinto de `nextBillingDate` → notificación (respeta los ajustes de notificaciones) y actualiza `lastRemindedFor`.
- Emparejado de pagos (mismo comercio, monto ±5 %, fecha ±3 días): corre en el job nocturno y al crear o importar un movimiento se intenta asociar a una suscripción `ACTIVE`. Si coincide una sola, registra el pago y avanza `nextBillingDate`; si hay varias o ninguna, deja la sugerencia para que el usuario confirme.
- REST: `GET/POST /finance/subscriptions`, `GET/PATCH /finance/subscriptions/:id`, `POST /finance/subscriptions/:id/pause|resume|cancel`, `POST /finance/subscriptions/:id/payments`, `GET /finance/subscriptions/summary`, `GET /brands/search` (Logo.dev, compartido con instituciones).
- Logo por dominio con `LogoService` (mismo patrón que instituciones: `domain` + `logoPath`/`customLogoPath`).

### Web

- `/finance/subscriptions` como vista principal: resumen superior (costo mensual y anual, próximos 7 días), lista con logo, monto y ciclo, próximo cobro con cuenta regresiva y badge de estado, y tarjeta de sugerencia desde un patrón detectado.
- Filtros por estado y moneda, búsqueda por nombre; estados de carga, vacío y error.
- Formulario con buscador de marca (autocompleta nombre, dominio y logo) y campos de monto, ciclo e intervalo, primer cobro (ancla), tarjeta o cuenta, recordatorio y `manage_url`.
- Detalle de suscripción: historial de pagos vinculados a movimientos, costo mensual/anual, acciones pausar, reanudar, cancelar y registrar pago manual.

## Criterios de aceptación

- [ ] Movimientos de "UBER *TRIP" de distintas fechas quedan bajo el comercio Uber.
- [ ] Tres cobros mensuales de Netflix se detectan como suscripción sugerida.
- [ ] Confirmar muestra próximo cobro; descartar no la vuelve a sugerir.
- [ ] Una subida >10 % genera aviso.
- [ ] Migración sin drift; specs del normalizador y del detector.
- [ ] El próximo cobro de una suscripción con ancla día 31 no arrastra el desfase de fin de mes.
- [ ] Un cobro dentro de ±5 % y ±3 días de la fecha esperada queda registrado como pago y avanza el próximo cobro.
