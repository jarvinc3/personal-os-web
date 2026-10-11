# ADR-003: Listas con scroll infinito y paginación por cursor

- Estado: `accepted`
- Fecha: 2026-10-11

## Contexto

Las vistas de lista paginan de forma distinta: presupuestos usa botones "Anterior" / "Siguiente" y un contador "Página X de Y"; notificaciones ya usa `useInfiniteQuery` pero con un botón "Cargar más"; movimientos precarga todas las páginas. El API pagina por página (`page` / `limit`, `{ page, limit, total, totalPages }`).

La regla de UI de este repo es scroll infinito: la lista trae más filas al bajar, sin botones de página.

## Decisión

- Toda vista de lista usa scroll infinito, disparado por `IntersectionObserver` sobre un centinela al final, con `useInfiniteQuery` de TanStack Query.
- No hay botones "Anterior" / "Siguiente" ni contador de páginas. El tamaño de tanda es un `limit` único.
- El contrato del API es por cursor: `cursor` + `limit` de entrada, `{ items, nextCursor, hasMore }` de salida. La web no interpreta el cursor; solo lo reenvía en `getNextPageParam`.
- Mientras el API no cambie, la web no inventa un cursor: la migración de código va junto con el cambio de contrato del back.

## Alternativas

- **Reusar offset con `useInfiniteQuery`**: sin cambios en el API, pero repite o salta filas con inserciones concurrentes.
- **Mantener botones de página**: es el control que esta regla prohíbe.
- **"Cargar más" manual como mecanismo principal**: obliga a un toque por tanda; se admite solo como respaldo cuando el scroll automático falla.

## Consecuencias

Regla registrada en `.cursor/rules/list-infinite-scroll.mdc`. Tipos y hooks de la web (`FinancePaginated`, `use-notifications.ts`, `budgets-list.tsx`, `use-transactions.ts`) se migran cuando el back sirva el cursor. Decisión espejo en `personal-os-back/docs/decisions/ADR-006-cursor-pagination.md`.
