# 08 · Suscripciones

> Pendiente nuevo, separado de [07](./07-comercios-recurrentes-suscripciones.md). El 07 entrega comercios y la detección básica de recurrentes; aquí vive el gestor completo de suscripciones, que nació como módulo aparte (`personal-os-back/docs/implementations/modulo-suscripciones.md`) y se integró en Finanzas por su relación con los movimientos.

## Estado verificado

- El 07 deja `FinMerchant`, `FinTransaction.merchantId` y `FinRecurringPattern` con `status`, `kind`, `lastSeenAt`, `amountTolerance` y detección nocturna.
- No existen tablas de suscripción ni de pagos, ni rutas `/finance/subscriptions` con modelo propio. La vista actual de `/finance/subscriptions` solo lista patrones detectados.
- `LogoService` (Logo.dev) y el buscador de marcas (`GET /brands/search`) ya existen para instituciones.

## Comportamiento esperado

- Una suscripción es lo que el usuario gestiona: monto fijo, ciclo de facturación, próximo cobro, tarjeta o cuenta de cobro, recordatorio, enlace de gestión y notas. Los patrones detectados en 07 son la fuente de sugerencias ("detectamos un cobro recurrente de X, ¿es una suscripción?").
- Vista principal `/finance/subscriptions` dentro del tab bar, entre Planificación y Productos, al nivel de las demás vistas principales.
- Detalle por suscripción con historial de pagos vinculados a movimientos.
- Alertas de renovación N días antes, con job diario y notificación sujeta a los ajustes del usuario.

## Back

### Esquema

- `FinSubscription`: `id, userId, name, normalizedKey, domain?, logoPath?, customLogoPath?, amount, currency, billingCycle (WEEKLY|MONTHLY|QUARTERLY|SEMIANNUAL|YEARLY), billingInterval, anchorDate, nextBillingDate, trialEndsAt?, status (ACTIVE|PAUSED|CANCELLED), pausedAt?, cancelledAt?, reminderDaysBefore, lastRemindedFor?, cardId?, accountId?, manageUrl?, notes?, sourcePatternId?, createdAt, updatedAt`.
- `FinSubscriptionPayment`: `id, subscriptionId, transactionId?, amount, currency, paidAt, source (AUTO|MANUAL), createdAt`. Único `(subscriptionId, transactionId)`. FKs a `fin_subscriptions` (`Cascade`) y `fin_transactions` (`SetNull`).
- `FinRecurringPattern` gana la relación inversa `subscriptions`; `User`, `FinCard` y `FinAccount` también.
- Migración Prisma con fecha posterior a la última; sin drift (`prisma migrate diff ... --exit-code`). Datos de prueba: sin backfill.

### Reglas de dominio

- `nextBillingDate` se calcula siempre desde `anchorDate`, nunca desde el cobro anterior, para no arrastrar el desfase de fin de mes (ancla día 31 → febrero 28 → marzo 31; 29 de febrero → 28).
- `billingInterval` multiplica el ciclo (mensual cada 2 meses = `MONTHLY` + `2`).
- Costo mensual equivalente (`amount × períodosPorAño / interval / 12`) y anual; la suma es multimoneda y se convierte a la moneda base con `fin_exchange_rates`.
- Estados: `ACTIVE`, `PAUSED` (con `pausedAt`) y `CANCELLED` (con `cancelledAt`). Reanudar recalcula `nextBillingDate` desde hoy.
- `trialEndsAt` marca el fin de la prueba; el primer cobro real es el ancla.

### Recordatorios

- Job diario: suscripciones `ACTIVE` con `nextBillingDate - reminderDaysBefore <= hoy` y `lastRemindedFor` distinto de `nextBillingDate` → evento `FINANCE_SUBSCRIPTION_RENEWAL_DUE`, notificación según los ajustes de notificaciones y `lastRemindedFor = nextBillingDate`.

### Emparejado de pagos

- Criterios: mismo comercio normalizado, misma moneda, monto ±5 % y fecha ±3 días del `nextBillingDate`.
- Corre en el job nocturno y también al crear o importar un movimiento (el ledger llama a un puerto `SUBSCRIPTION_MATCHER` tras persistir).
- Si coincide una sola suscripción, registra `FinSubscriptionPayment` con `source = AUTO` y avanza `nextBillingDate`; si coinciden varias o ninguna, no registra nada y deja la sugerencia para que el usuario confirme.
- Registro manual de pago desde el detalle (`source = MANUAL`).

### REST

- `GET/POST /finance/subscriptions`, `GET/PATCH /finance/subscriptions/:id`.
- `POST /finance/subscriptions/:id/pause|resume|cancel`.
- `GET/POST /finance/subscriptions/:id/payments`.
- `POST /finance/subscriptions/:id/logo`.
- `GET /finance/subscriptions/summary` (costo mensual y anual, próximos cobros).
- Logo por dominio con `LogoService` (`domain` + `logoPath`/`customLogoPath`); buscador de marcas `GET /brands/search`.

### Tools

- `list_subscriptions` (ya en 07 lista recurrentes; aquí debe incluir las suscripciones gestionadas), `create_subscription`, `confirm_subscription_payment`.

## Web

- `/finance/subscriptions` como vista principal en el tab bar, entre Planificación y Productos.
- Resumen superior: costo mensual y anual de las activas (convertido a la moneda base), total de activas y próximos cobros (7 días).
- Tarjeta de sugerencia desde un patrón detectado, con acción para crearla como suscripción.
- Lista con logo, nombre, monto y ciclo, próximo cobro con cuenta regresiva y badge de estado (`ACTIVE`/`PAUSED`/`CANCELLED`).
- Filtros por estado y moneda, búsqueda por nombre; estados de carga (esqueleto), vacío (`Empty`) y error reintentable.
- Formulario con buscador de marca que autocompleta nombre, dominio y logo; campos de monto y moneda, ciclo e intervalo, primer cobro (ancla), prueba (`trialEndsAt`), tarjeta o cuenta, recordatorio (`reminderDaysBefore`), `manageUrl` y notas.
- Detalle `/finance/subscriptions/[subscriptionId]`: costo mensual/anual, próximo cobro, historial de pagos vinculados a movimientos y acciones pausar, reanudar, cancelar y registrar pago manual. `Link` con pending, `AlertDialog` para cancelar.
- Hooks `use-subscriptions.ts`; reutiliza el selector de categorías y los campos compartidos de Finanzas.
- Actualizar `status.md` y [dominio.md](../dominio.md) al terminar.

## Criterios de aceptación

- [ ] El próximo cobro de una suscripción con ancla día 31 no arrastra el desfase de fin de mes (31 ene → 28 feb → 31 mar).
- [ ] Un cobro dentro de ±5 % y ±3 días de la fecha esperada queda registrado como pago y avanza `nextBillingDate`.
- [ ] Dos suscripciones candidatas no registran pago automático; el usuario confirma.
- [ ] El recordatorio se notifica una sola vez por ciclo y respeta los ajustes de notificaciones.
- [ ] El resumen suma multimoneda usando la moneda base del usuario.
- [ ] `PAUSED` no genera recordatorios ni empareja pagos; `CANCELLED` conserva el historial.
- [ ] Migración sin drift; specs del cálculo de fechas, del costo equivalente y del emparejado.
