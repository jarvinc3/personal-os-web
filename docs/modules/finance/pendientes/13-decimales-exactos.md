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

- [ ] `0.1 + 0.2` en cualquier total de analytics da `0.30` exacto.
- [ ] Convertir 1 000 000.00 DOP a USD y sumar con otros montos no pierde centavos frente al cálculo manual con Decimal.
- [ ] `rg "toNumber\(\)"` en analytics y conversiones del back no devuelve resultados (salvo escalas de gráfico justificadas).
- [ ] El balance general coincide al centavo con la suma de saldos convertidos.

## Tests

- Back: specs de `money.ts`, de analytics y balance general con casos de redondeo y multimoneda.
- Web: specs de la utilidad decimal y de los totales en componentes.

## Versión esperada

MINOR (cambio de comportamiento en cálculos visibles): web v0.33.0 / back v0.31.0. Revisión como PATCH.
