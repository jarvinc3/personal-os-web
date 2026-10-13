# 01 · Agrupar cada reversa con su original en la lista

## Problema

Cuando un movimiento se revierte (por correo del banco o a mano), la lista de Movimientos muestra el original y la reversa como dos filas separadas, a veces en días distintos. La reversa se ve en gris y tachada (`month-section.tsx`) y la fila solo lleva el ícono `Undo2` (`transaction-status-mark.tsx`). La etiqueta "Revertido" y el enlace entre los dos solo están en el detalle (`transaction-detail-screen.tsx`).

Verificado: `month-section.tsx` y `group-transactions-*.ts` no agrupan por `linkedTransactionId`.

## Comportamiento esperado

- La lista muestra **una sola fila** por par original + reversa, en la fecha del original.
- La fila lleva el badge "Revertido" junto al monto (tachado, fuera de totales, como hoy).
- Al tocarla se expande (o abre el detalle) y muestra las dos patas: original y reversa con su fecha y origen (correo o manual).
- Si la reversa cae en otro mes que el original: se agrupa en el mes del original y en el mes de la reversa no aparece fila suelta.
- Una reversa cuyo original no está cargado en la página actual (paginación) se muestra sola con el badge "Revertido" y el enlace "Ver original"; cuando llega el original se fusionan.
- Reversa parcial (monto distinto al original): no se agrupa como reversa total; muestra badge "Reversa parcial" en las dos filas.

## Back

No hace falta cambio obligatorio: `GET /finance/transactions` ya devuelve `status` y `linkedTransactionId`.

Opcional (mejor): agregar `reversal: { id, amount, date } | null` en cada original para no depender del orden de páginas. Si se hace, documentarlo en el contrato y cubrirlo en `logical-transaction-query`.

## Web

- `src/modules/finance/transactions/lib/`: nueva función pura `groupReversals(items)` → `{ original, reversal? }[]`, con spec.
- `month-section.tsx` / `transactions-list.tsx`: renderizar el grupo; badge con `TRANSACTION_STATUS_LABEL.REVERSED`.
- Totales del mes: verificar que el par no sume (el original queda `REVERSED` o neutralizado: mantener la regla actual).
- Mismo tratamiento en las listas por cuenta, tarjeta y presupuesto que reutilicen `month-section`.

## Criterios de aceptación

- [ ] Un movimiento revertido y su reversa se ven como una fila con badge "Revertido".
- [ ] El par no altera los totales del mes ni del tablero.
- [ ] Expandir/abrir muestra las dos patas con enlace a cada una.
- [ ] La reversa en otro mes no duplica filas.
- [ ] Spec unitaria de `groupReversals` (pares, huérfanos, parcial, meses distintos).
