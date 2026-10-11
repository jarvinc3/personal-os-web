# Capacidad: transacciones (UI)

`/finance/transactions`: GET paginado. Filtros DTO. Detalle GET `:id`. Create DEBIT/CREDIT, transfers `POST /transfers` (nunca `type: TRANSFER` en create), PATCH, confirm, reverse, DELETE.

Copy “Completado” = `CONFIRMED`.

Evidencia: `src/modules/finance/transactions/`, `src/modules/finance/shared/hooks/use-transactions.ts`, `src/modules/finance/shared/lib/ledger-form.ts` + specs.
