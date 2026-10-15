# 13 · Decimales exactos de punta a punta

> Lo que se guarda ya usa `Decimal` y la API devuelve strings (ADR-002), pero analytics, el balance general y las conversiones de moneda convierten a `Number`. Mejora técnica pequeña para evitar errores de redondeo en totales y en cambios de moneda.

## Estado verificado

- Back: servicios de analytics, balance general (net worth) y conversión con `fin_exchange_rates` usan `Number(...)`/`toNumber()` en sumas y multiplicaciones.
- Web: algunos totales y gráficos suman montos como `number`.

## Comportamiento esperado

- Toda suma, resta, conversión y prorrateo de dinero usa `Prisma.Decimal` (back) o una utilidad decimal (web) hasta el último momento.
- Redondeo solo al presentar o persistir: 2 decimales, `ROUND_HALF_EVEN` (o la política de ADR-002 si define otra), documentado.
- `Number` solo para escalas de gráficos, nunca para valores mostrados como monto.

## Back

- Reemplazar `Number`/float en analytics, balance general, resumen semanal, costo equivalente de suscripciones y conversión de moneda por `Decimal`.
- Helper `money.ts` (`sum`, `convert`, `round`) con tests; regla de lint o `rg` en CI que prohíba `toNumber()` en `finance/**/analytics` y conversiones.
- Respuestas siguen como strings (ADR-002).

## Web

- Utilidad decimal (p. ej. `decimal.js-light` o la ya presente) para totales en el cliente; formateadores aceptan string.
- Revisar dashboards, analytics, Productos y suscripciones.

## Criterios de aceptación

- [x] `0.1 + 0.2` en cualquier total de analytics da `0.30` exacto.
- [x] Convertir 1 000 000.00 DOP a USD y sumar con otros montos no pierde centavos frente al cálculo manual con Decimal.
- [x] `rg "toNumber\(\)"` en analytics y conversiones del back no devuelve resultados (salvo escalas de gráfico justificadas).
- [x] El balance general coincide al centavo con la suma de saldos convertidos.

## Implementación

PENDIENTE 13 COMPLETADO — web v0.35.0 · back v0.32.0–v0.32.1 (2026-10-22).

### Back

- `shared/domain/money.ts` gana los helpers `toMoney`, `sumMoney`, `roundDecimal` (`ROUND_HALF_EVEN`), `convertDecimal`, `ratioPercent` y `scalarNumber` sobre `Prisma.Decimal`. `Number` queda solo para ratios y escalas.
- Analytics, balance general, resumen semanal, costo equivalente de suscripciones, `billing.ts` y las conversiones de `fx` usan `Decimal` de punta a punta. El `SUM(...)::float` del repositorio de analytics pasa a `::text` y se lee con `toMoney`. Las respuestas siguen como strings (ADR-002).
- Guard: regla ESLint `no-restricted-syntax` sobre las rutas de lectura de dinero y `pnpm lint:money` (`scripts/finance/check-money-decimals.mjs`), en CI.
- Tests: `money.spec.ts` (0.1 + 0.2, `ROUND_HALF_EVEN`, conversión de un millón), suma decimal en analytics y balance general multimoneda al centavo.

### Web

- Dependencia `decimal.js-light` y utilidad `shared/lib/decimal.ts` (`toDecimal`, `sumDecimals`, `roundDecimal`, `decimalPercent`, `decimalAmount`).
- Totales y gráficos de dashboards, Suscripciones y el anillo usan la utilidad; los formateadores ya aceptaban string.
- Tests: `decimal.spec.ts`, total de `subscription-calendar` y suma de efectivo en `ring-stack`.

## Tests

- Back: specs de `money.ts`, de analytics y balance general con casos de redondeo y multimoneda.
- Web: specs de la utilidad decimal y de los totales en componentes.

## Versión esperada

MINOR (cambio de comportamiento en cálculos visibles): web v0.33.0 / back v0.31.0. Revisión como PATCH.
