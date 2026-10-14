# 11 · Integridad de saldos

> La spec de alineación fija el invariante **I1**: el saldo de cada cuenta y tarjeta es siempre la suma de sus movimientos confirmados. Hoy el saldo se guarda y se suma o resta en cada movimiento, y nada verifica el invariante. Este pendiente garantiza que la app no se contradiga a sí misma; la diferencia con el banco la resuelve el [09](./09-conciliacion-ajustes.md).

## Estado verificado

- `FinAccount.balance` y los saldos de tarjeta se actualizan incrementalmente en los casos de uso del ledger, transferencias, pagos de tarjeta, préstamos, metas, reversas y restauraciones.
- No existe recálculo desde los movimientos ni detección de desviaciones.

## Comportamiento esperado

- Un servicio de dominio calcula el saldo esperado de un producto a partir de su saldo inicial y de sus movimientos `CONFIRMED` (excluye pendientes y revertidos; las reversas netean al original).
- Un job nocturno y un endpoint comparan saldo guardado vs. esperado y registran las desviaciones.
- La UI muestra una alerta en el producto afectado con la diferencia y una acción "Recalcular" que corrige el saldo guardado (no crea movimientos).

## Back

### Reglas de dominio

- Fórmula por tipo: ingresos suman, gastos restan; transferencia resta en origen y suma en destino (más comisión en origen); pago de tarjeta resta en la cuenta y reduce la deuda de la tarjeta; pago de préstamo resta en la cuenta y reduce el saldo del préstamo solo por capital; aportes a meta no cambian el saldo de la cuenta (apartan); ajustes suman o restan; revertidos no suman.
- Todo en `Decimal`; comparación exacta (tolerancia cero).
- Restaurar un borrado no aplica dos veces su efecto (fase 9): el recálculo lo verifica.
- El recálculo corre dentro de la misma transacción de BD que lo corrige.

### Esquema

- `FinBalanceDrift`: `id, userId, accountId?, cardId?, currency, storedBalance, expectedBalance, difference, detectedAt, resolvedAt?`. Migración sin drift.

### REST y jobs

- `GET /finance/integrity/check` (todos los productos del usuario) y `GET /finance/integrity/check?accountId|cardId`.
- `POST /finance/integrity/recalculate` (`accountId|cardId`) → corrige y marca `resolvedAt`.
- `BalanceIntegrityScheduler` nocturno; emite `FINANCE_BALANCE_DRIFT_DETECTED` (notificación según ajustes).

## Web

- Banner de alerta en el detalle de cuenta/tarjeta y badge en Productos cuando hay deriva abierta, con diferencia y botón "Recalcular" (`AlertDialog` de confirmación).
- Sección en `/settings/finance` o en Sync para correr la verificación manual.
- Hooks `use-integrity.ts`. Actualizar `status.md` y [dominio.md](../dominio.md).

## Criterios de aceptación

- [ ] Para cada tipo de movimiento (transacción, transferencia con y sin comisión, pago de tarjeta, pago y abono a capital de préstamo, aporte a meta, ajuste, reversa, borrado y restauración) el saldo guardado coincide con el recalculado.
- [ ] Una desviación introducida a mano en BD se detecta en el check y en el job, y "Recalcular" la corrige.
- [ ] Pendientes y revertidos no afectan el saldo esperado.
- [ ] Sin desviaciones, no hay banners ni notificaciones.
- [ ] Migración sin drift.

## Tests

- Back: test de propiedad/escenario que ejecuta una secuencia mixta de todos los tipos de movimiento (incluidas reversas y restauraciones) y afirma I1 tras cada paso; specs por tipo; spec del job y del endpoint de recálculo; e2e que corrompe un saldo y lo detecta.
- Web: specs del banner, del badge y del flujo de recálculo.

## Versión esperada

MINOR: web v0.31.0 / back v0.29.0. Revisión como PATCH.
