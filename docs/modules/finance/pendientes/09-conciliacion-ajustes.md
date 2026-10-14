# 09 · Conciliación con ajustes

> Primer pendiente del camino a 1.0 (ver [direccion-y-decisiones.md](../direccion-y-decisiones.md)). Personal OS es de uso personal: no busca que los saldos coincidan solos con el banco, sino cerrar cada cuenta y tarjeta en segundos contra el saldo real y dejar la diferencia registrada y explicada.

## Contexto

- El usuario maneja varios bancos (BHD, Popular, Qik), varias cuentas y tarjetas, y movimientos desde muchos frentes.
- La ingesta de correo captura el consumo normal, pero no los cargos que el banco aplica sin aviso: impuesto DGII del 0.15 %, comisiones, cargo por plástico o tarjeta, intereses y otros.
- A fin de mes el saldo de la app casi nunca coincide exactamente con el de la app móvil de cada banco.

## Estado verificado

- El pendiente 02 empareja líneas de un estado de cuenta en PDF con movimientos, pero no cierra contra un saldo final.
- Existen movimientos de tipo ajuste que cambian el saldo sin aparecer en el tablero (fase 1 de la spec).
- No hay entidad de cierre ni historial de conciliaciones por cuenta o tarjeta.

## Comportamiento esperado

- Desde el detalle de una cuenta o tarjeta, el usuario escribe el saldo real que ve en la app del banco (y opcionalmente la fecha de corte; por defecto, hoy).
- La app calcula `diferencia = saldoReal - saldoApp` en la moneda del producto.
- Si la diferencia es distinta de cero, el usuario la reparte en una o más líneas categorizadas (`IMPUESTO_DGII`, `COMISION`, `CARGO_PLASTICO`, `INTERES`, `OTRO`) y la app crea un movimiento de ajuste por línea. Sugerencia automática: si el producto tiene salidas en el período, se propone el 0.15 % de ellas como `IMPUESTO_DGII` y el resto como `OTRO`.
- Con diferencia cero, el cierre se registra igual (sin ajustes).
- Cierre mensual: cada cuenta y tarjeta tiene un historial de conciliaciones (fecha, saldo app, saldo real, diferencia, ajustes creados). Se marca cuál está "al día" este mes y cuáles faltan.
- Analytics: vista "Cargos bancarios" con el total por mes, por banco y por categoría de ajuste.

## Back

### Esquema

- `FinReconciliation`: `id, userId, accountId?, cardId?, currency, asOfDate, appBalance, realBalance, difference, note?, createdAt`. Exactamente uno de `accountId`/`cardId` (check constraint). Índice `(userId, accountId|cardId, asOfDate desc)`.
- `FinReconciliationAdjustment`: `id, reconciliationId, transactionId, kind (IMPUESTO_DGII|COMISION|CARGO_PLASTICO|INTERES|OTRO), amount`. FK a `fin_reconciliations` (`Cascade`) y a `fin_transactions` (`Restrict`).
- Categorías de sistema para cada `kind` (sembradas por usuario, no editables en nombre) para que analytics las agrupe.
- Migración Prisma con fecha posterior a la última; sin drift (`prisma migrate diff ... --exit-code`). Sin backfill.

### Reglas de dominio

- Montos en `Decimal`; la suma de los ajustes debe ser exactamente la diferencia (si no, 422).
- Los ajustes nacen `CONFIRMED`, con tipo ajuste, fecha `asOfDate` y vínculo a la conciliación; no aparecen en el tablero, sí en el historial del producto y en "Cargos bancarios".
- `appBalance` es el saldo confirmado a `asOfDate` (reutiliza el recálculo del pendiente 11 si ya existe; si no, el saldo guardado).
- Borrar una conciliación (solo la última del producto) revierte sus ajustes vía diario de borrados y se puede restaurar sin doble efecto (fase 9).
- Multimoneda: una conciliación por moneda del producto; tarjetas con dos monedas se concilian por separado.

### REST

- `POST /finance/reconciliations/preview` → `{ appBalance, difference, suggestedAdjustments[] }`.
- `POST /finance/reconciliations` (crea cierre + ajustes en una transacción de BD).
- `GET /finance/reconciliations?accountId|cardId` (cursor), `GET /finance/reconciliations/:id`, `DELETE /finance/reconciliations/:id`.
- `GET /finance/reconciliations/status?month=YYYY-MM` → productos conciliados y pendientes del mes.
- `GET /finance/analytics/bank-charges?from&to&groupBy=month|institution|kind`.

### Tools

- `reconcile_product` (preview + confirmación) y `get_bank_charges`.

## Web

- Botón "Conciliar" en el detalle de cuenta y de tarjeta; sheet con saldo real, fecha, diferencia en vivo y reparto en líneas por categoría con la sugerencia precargada.
- Pestaña o sección "Conciliaciones" en el detalle con el historial (cursor, `Empty`, error reintentable).
- Indicador de cierre del mes en Productos (conciliado / pendiente) por cuenta y tarjeta.
- Analytics: tarjeta "Cargos bancarios" con gráfico mensual y desglose por banco y por categoría.
- Hooks `use-reconciliations.ts`; reutiliza campos de monto y moneda compartidos.
- Actualizar `status.md` y [dominio.md](../dominio.md) al terminar.

## Criterios de aceptación

- [ ] Con saldo app 10 000.00 y real 9 950.00, la diferencia es −50.00 y la suma de ajustes debe ser −50.00 o la API responde 422.
- [ ] Tras conciliar, el saldo de la app es exactamente el saldo real a `asOfDate`.
- [ ] Los ajustes no aparecen en el tablero ni en presupuestos, pero sí en el historial del producto y en "Cargos bancarios".
- [ ] La sugerencia propone el 0.15 % de las salidas del período como `IMPUESTO_DGII`.
- [ ] Una conciliación con diferencia cero queda registrada sin crear movimientos.
- [ ] Borrar la última conciliación revierte sus ajustes; restaurarla no duplica el efecto.
- [ ] El estado del mes lista correctamente productos conciliados y pendientes.
- [ ] Migración sin drift.

## Tests

- Back: specs de preview (cálculo de diferencia, sugerencia DGII, multimoneda), de creación (suma ≠ diferencia → 422, ajustes confirmados, saldo final), de borrado/restauración, de status mensual y de analytics de cargos; e2e preview → create → saldo.
- Web: specs del sheet de conciliación (diferencia en vivo, validación de suma, payload), del historial y de la tarjeta de analytics.

## Versión esperada

MINOR en ambos repos (función nueva, `docs/versionado.md` regla 2): web v0.29.0 / back v0.27.0. Las correcciones de la revisión salen como PATCH.
