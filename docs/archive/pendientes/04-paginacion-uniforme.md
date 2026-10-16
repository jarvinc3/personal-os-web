# 04 · Paginación uniforme en las listas que crecen

## Problema

Con cursor `{items, nextCursor, hasMore}` hoy están: `GET /transactions`, `GET /budgets`, `GET /accounts|cards/:id/history` y notificaciones. `GET /cards/:id/statements` acepta `CursorQueryDto` en el back, pero `use-card-statements.ts` no pide más páginas. El resto devuelve arrays completos. En la web cada hook resuelve el "cargar más" a su manera (`useInfiniteQuery` solo en `use-budgets.ts` e `use-instrument-history.ts`).

Listas que crecen sin límite y hoy devuelven arrays (verificado en los controllers):

| Endpoint                                                        | Hook web                     |
| --------------------------------------------------------------- | ---------------------------- |
| `GET /finance/loans/:id/installments`                           | `use-loan-installments.ts`   |
| `GET /finance/receivables/:id/payments`                         | `use-receivables.ts`         |
| `GET /finance/savings-goals/:id/contributions` y `/allocations` | `use-savings-goals.ts`       |
| `GET /finance/email-sync/messages`                              | `use-email-sources.ts`       |
| `GET /finance/email-sync/pending`                               | `use-email-sources.ts`       |
| `GET /finance/budgets/:id/transactions`                         | `use-budgets.ts` (verificar) |
| `GET /finance/recycle-bin`                                      | `use-recycle-bin.ts`         |

Quedan sin paginar los catálogos chicos: cuentas, tarjetas, instituciones, categorías, monedas. `loans/:id/schedule` (proyección) también queda entero.

## Back

- Aceptar `CursorQueryDto` (`cursor`, `limit` 1-100, por defecto 20) en cada endpoint de la tabla y devolver `{ items, nextCursor, hasMore }`.
- Cursor opaco por `(fecha, id)` en el orden actual de cada lista (cuotas: más antigua primero; el resto: más reciente primero).
- Compatibilidad: cambio de contrato; la web se actualiza en el mismo ciclo. Actualizar las tools del agente que consumen esas listas (`list_pending_emails`, etc.) para pedir la primera página y decir si hay más.
- e2e por endpoint: primera página, siguiente, última (`hasMore=false`).

## Web

- Hook común `useInfiniteFinanceList({ queryKey, endpoint, params })` en `shared/hooks/` sobre `useInfiniteQuery`, con `getNextPageParam` desde `nextCursor`.
- Componente `InfiniteListSentinel` con IntersectionObserver (carga automática) y botón "Cargar más" como respaldo accesible.
- Migrar los hooks de la tabla, más `use-card-statements.ts`, `use-budgets.ts` y `use-instrument-history.ts` al hook común.
- Las invalidaciones existentes siguen usando el prefijo `["finance", ...]`.

## Criterios de aceptación

- [x] Todos los endpoints de la tabla paginan con el mismo formato.
- [x] Todas las listas que crecen usan `useInfiniteFinanceList` y cargan al hacer scroll.
- [x] Sin regresiones en totales ni detalles que hoy suman sobre el array completo (mover esas sumas al back si hace falta).
- [x] Tests: e2e del back y spec del hook.
