# Finance — overview

Gate `useFinanceEnabled`: módulo off → CTA Settings `?sheet=finance-sheet` y **no** llama `/finance/*`.

Money: lecturas decimal **strings**; writes **numbers** (`parseFinanceMoney` / `formatFinanceMoney`). Loan `interestRate` UI % → API fracción 0–1. `pctUsed` budgets se calcula en cliente.

Query keys: `src/modules/finance/shared/types/api.ts` (`["finance", ...]`). Mutaciones de cuentas/tarjetas/loans/instituciones/txs confirmadas/email assign invalidan `FINANCE_BALANCE_SHEET_QUERY_KEY`.

Tab bar (5): Resumen, Movimientos, Planificación, Suscripciones, Productos. Estadísticas y Comercios `showInTabBar: false` (`shared/constants/nav.ts`). Comercios tiene atajo en Productos. Suscripciones es el gestor (resumen de costo mensual y anual, cobros recurrentes detectados, filtros por estado y moneda, búsqueda e historial de pagos). Gmail sync no está en tab bar; vive en `/finance/sync` (atajo desde Productos).

## Convenciones de formularios

- Alta y edición comparten la pieza: el `mode` decide título, CTA y texto de ayuda. El alta se habilita por validez del esquema; la edición, solo si hay cambios (`isDirty`).
- Un formulario de ruta usa `FinanceFormScreen` con la barra de envío fija; uno en sheet usa las acciones del `BottomSheet`.
- El dinero usa `FinanceMoneyField` (teclado y calculadora) y la moneda, `FinanceCurrencyPickerSheet` (con bandera). No hay inputs de monto genéricos.
- Cuenta o tarjeta se elige con `DestinationPickerSheet` desde un `DestinationTrigger`, no en un `<select>`.
- Cerrar con cambios sin guardar pide confirmación con `useDiscardChanges` (`shared/hooks/use-discard-changes.tsx`); un guardado con éxito cierra directo.
- Las acciones de un registro viven en el ⋮ del detalle (`RecordOptionsSheet`). "Eliminar" es el último ítem, en rojo, y confirma con `DeleteRecordDialog`.
- Tras eliminar, un toast con "Deshacer" (`showUndoToast`) llama al `POST <entidad>/:id/restore` durante unos segundos. La respuesta del `DELETE` trae `undoId`, que para una transferencia es el `transferGroupId`.
- Los errores del API pasan por `financeErrorMessage` (`shared/lib/finance-error.ts`), que traduce el `message` del servidor. El detalle de validación no se muestra crudo.

Helpers: `src/modules/finance/shared/lib/money.ts`, `ledger-payloads.ts`. Tests: specs `*.spec.ts` bajo `shared/lib/` y cada capability.

> [!WARNING]
> **REV-WEB-012** — docs antiguas reclamaban `/finance/budgets`. El listado de presupuestos vive en `/finance/planning`; el detalle sí tiene ruta propia. Cuentas y cobros se reciclan con archivar / `CANCELLED`; no hay DELETE. [registro archivado](../../archive/review-register.md)
