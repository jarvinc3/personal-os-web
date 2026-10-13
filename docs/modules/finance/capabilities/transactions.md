# Capacidad: transacciones (UI)

Rutas: `/finance/transactions` (lista paginada), `/finance/transactions/new`, `/finance/transactions/[transactionId]`, `/finance/transactions/[transactionId]/edit`, `/finance/transfers/new` y `/finance/transfers/[transferId]/edit`.

GET paginado con filtros del DTO. Detalle GET `:id`. Create DEBIT/CREDIT, transfers `POST /transfers` (nunca `type: TRANSFER` en create), PATCH, confirm, reverse, DELETE. La edición de una transferencia usa `PATCH /transfers/:id`.

Copy “Completado” = `CONFIRMED`. La etiqueta del destino sigue al tipo: “Desde” en un gasto, “Destino” en un ingreso. Las acciones del detalle viven en el ⋮ (`RecordOptionsSheet`): "Editar movimiento" o "Editar transferencia" navega a `/edit`, y "Eliminar" confirma con `DeleteRecordDialog`.

Alta guiada (solo en crear): la categoría abre primero; al elegirla, el monto toma el foco con el modo guardado en `module_config.finance.amountEntry` (teclado o calculadora persistente); al confirmar el monto abre el selector de cuenta o tarjeta. En una transferencia el orden es origen, destino y monto.

Un movimiento `REVERSED` lleva la etiqueta “Revertido” en la lista y el detalle, sin sumar a los totales; si tiene un movimiento vinculado, el detalle enlaza al original.

El detalle muestra `planningLink` y permite vincular el movimiento a una cuota de préstamo, un cobro o una meta (`POST/DELETE /transactions/:id/link`). Vincular no crea un movimiento nuevo y quitar el vínculo revierte el efecto.

Evidencia: `src/modules/finance/transactions/`, `src/modules/finance/shared/hooks/use-transactions.ts`, `src/modules/finance/shared/lib/ledger-form.ts` + specs.
