# 12 · Tarjetas prácticas

> Completa las tarjetas para el uso diario sin replicar al banco: crédito disponible, fechas de corte y pago, y corte automático. **No** se calculan intereses: los cobra el banco y entran por el ajuste de conciliación del [09](./09-conciliacion-ajustes.md) (`INTERES`).

## Estado verificado

- Fase 3 de la spec: pago de tarjeta como tipo propio y estado de cuenta (`FinCardStatement`) con estado, mínimo y monto pagado por moneda.
- El corte se crea manualmente; el job diario `CardStatementsScheduler` solo actualiza estados.
- No hay límite de crédito por moneda ni crédito disponible calculado.

## Comportamiento esperado

- Cada tarjeta tiene límite de crédito (por moneda), día de corte y días hasta el pago (o día de pago).
- Crédito disponible = límite − deuda confirmada − pendientes, por moneda.
- El corte se genera solo en el día de corte: cierra el período, fija saldo, mínimo (editable) y fecha límite de pago. El corte manual queda como respaldo.
- Recordatorio de pago N días antes de la fecha límite si el corte no está pagado.

## Back

- `FinCard`: `statementDay (1-31)`, `paymentDueDays` o `paymentDay`, `creditLimit` por moneda (`FinCardLimit: cardId, currency, amount`). Migración sin drift.
- Fechas de corte con la misma regla de fin de mes que suscripciones (día 31 → último día del mes), en la zona horaria del usuario.
- `CardStatementsScheduler` genera el corte del día; idempotente (un corte por tarjeta, moneda y período).
- `GET /finance/cards/:id` y la lista incluyen `availableCredit`, `nextStatementDate`, `nextPaymentDueDate`.
- Evento `FINANCE_CARD_PAYMENT_DUE` según ajustes de notificaciones.
- Sin cálculo de intereses ni período de gracia.

## Web

- Formulario de tarjeta con límite por moneda, día de corte y de pago.
- Detalle de tarjeta: barra de uso del crédito, crédito disponible, próximo corte y fecha límite con cuenta regresiva.
- Productos muestra crédito disponible en la tarjeta. Actualizar `status.md` y [dominio.md](../../modules/finance/dominio.md).

## Criterios de aceptación

- [ ] Con límite 50 000, deuda 12 000 y pendientes 1 000, el disponible es 37 000.
- [ ] El corte se genera automáticamente el día de corte, una sola vez, aun si el job corre dos veces.
- [ ] Día de corte 31 en febrero corta el 28 (o 29).
- [ ] El recordatorio de pago respeta los ajustes y no se envía si el corte está pagado.
- [ ] No existe ningún cálculo de intereses en el código nuevo.
- [ ] Migración sin drift.

## Tests

- Back: specs de crédito disponible multimoneda, fechas de corte y pago (fin de mes, zona horaria), idempotencia del job, recordatorio.
- Web: specs del formulario (validación de días y límites) y del detalle.

## Versión esperada

MINOR: web v0.32.0 / back v0.30.0. Revisión como PATCH.
