# Capacidad: transacciones (UI)

`/finance/transactions`: GET paginado. Filtros DTO. Detalle GET `:id`. Create DEBIT/CREDIT, transfers `POST /transfers` (nunca `type: TRANSFER` en create), PATCH, confirm, reverse, DELETE.

Copy “Completado” = `CONFIRMED`.

Evidencia: `components/transactions/`, `hooks/use-transactions.ts`, `lib/ledger-form.ts` + specs.
