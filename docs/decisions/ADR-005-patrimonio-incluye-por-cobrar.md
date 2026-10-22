# ADR-005: El patrimonio neto incluye los cobros pendientes

- Estado: `accepted`
- Fecha: 2026-10-21
- Origen: web #207, back #163

## Decisión

El patrimonio neto suma los cobros pendientes que no están vencidos o que vencieron hace 90 días o menos. Los cobros vencidos hace más de 90 días se muestran en un bloque aparte, **Dudosos**, y no suman.

La cifra principal del patrimonio incluye esos cobros. Las vistas muestran además **Disponible** (cuentas y efectivo) y **Por cobrar** (los cobros que sí suman), para que el usuario vea de dónde sale el total.

## Motivo

Un cobro pendiente es dinero que el dueño ya ganó y todavía puede cobrar. Excluirlo hace que el patrimonio parezca menor de lo que es, sobre todo cuando una parte importante del negocio vive en cobros. Incluirlo sin límite exagera el patrimonio con deudas viejas que probablemente no se cobren. El corte de 90 días separa ambos casos con una regla simple y visible.

## Consecuencias

- `GET /api/finance/balance-sheet` calcula el patrimonio con las líneas de activos: cuentas, efectivo y cobros vigentes.
- Los cobros dudosos llegan en `breakdown.byCurrency[].doubtfulReceivables` y en `totals.doubtfulReceivables`; nunca se suman a `netWorth`.
- La web no recalcula sumas: muestra los totales y las líneas que devuelve el back.
- Los totales se agrupan por moneda. La cifra principal usa la moneda base del usuario y cada moneda conserva su propio patrimonio.
- El dinero apartado en metas de ahorro sigue dentro del saldo de su cuenta; no se suma dos veces.
- Un cobro no es dinero disponible: no cambia el saldo de ninguna cuenta.
- Pagar, cancelar o castigar un cobro lo saca de la suma en la siguiente consulta. No hay recálculo retroactivo.

## Evidencia

- `personal-os-back/packages/finance/src/balance-sheet/`.
- `personal-os-back/docs/modules/finance/capabilities/balance-sheet.md`.
- `personal-os-web/src/modules/finance/wealth/`.
