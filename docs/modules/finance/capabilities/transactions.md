# Capacidad: transacciones (UI)

Rutas: `/finance/transactions` (lista paginada), `/finance/transactions/new`, `/finance/transactions/[transactionId]`, `/finance/transactions/[transactionId]/edit`, `/finance/transfers/new` y `/finance/transfers/[transferId]/edit`.

GET paginado con filtros del DTO. Detalle GET `:id`. Create DEBIT/CREDIT, transfers `POST /transfers` (nunca `type: TRANSFER` en create), PATCH, confirm, reverse, DELETE. La edición de una transferencia usa `PATCH /transfers/:id`.

Copy “Completado” = `CONFIRMED`. La etiqueta del destino sigue al tipo: “Desde” en un gasto, “Destino” en un ingreso. Las acciones del detalle viven en el ⋮ (`RecordOptionsSheet`): "Editar movimiento" o "Editar transferencia" navega a `/edit`, y "Eliminar" confirma con `DeleteRecordDialog`.

Evidencia: `src/modules/finance/transactions/`, `src/modules/finance/shared/hooks/use-transactions.ts`, `src/modules/finance/shared/lib/ledger-form.ts` + specs.
