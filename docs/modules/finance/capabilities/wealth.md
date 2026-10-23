# Capacidad: patrimonio

`/finance/wealth` muestra el desglose del patrimonio neto. Se abre al tocar la cifra del hero de Productos; el tab de Productos sigue activo.

- Arriba: patrimonio neto en la moneda base, **Disponible** y **Por cobrar**, con un «?» que abre la entrada del glosario.
- Por moneda: patrimonio nativo, activos (cuentas, efectivo, por cobrar) y deudas (tarjetas, préstamos). Cada grupo se expande en sus productos y cada línea abre el detalle del producto.
- Los cobros vencidos hace más de 90 días viven en **Cobros dudosos**, aparte, y no suman.
- Cada línea de cuenta o tarjeta dice si cuadra con sus movimientos y trae la diferencia cuando no; un punto rojo marca descuadre y uno ámbar, sin conciliar.
- Los «?» de descuadre, conciliación y dudosos abren el glosario del Centro de ayuda. El texto vive solo en `src/modules/help/constants/glossary.ts`.
- La web no suma ni convierte: usa `breakdown.byCurrency` y `breakdown.totals` de `GET /finance/balance-sheet`. La decisión está en [ADR-005](../../../decisions/ADR-005-patrimonio-incluye-por-cobrar.md).
- Si la API responde sin `breakdown` (servidor anterior a esa capacidad), la vista sigue en pie: muestra el balance global y un aviso de que el desglose por moneda no está disponible. Lo mismo hace Productos con sus totales por moneda.

Evidencia: `src/modules/finance/wealth/`, `src/modules/finance/integrity/components/irregularities-section.tsx`, `src/modules/help/components/glossary-help.tsx`.
