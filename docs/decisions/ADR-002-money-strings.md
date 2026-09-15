# ADR-002: Formato money en Finance UI

- Estado: `accepted`
- Origen: `docs/superpowers/specs/2026-09-11-finance-money-format-design.md` (aplicación verificada en `lib/money.ts`)

## Decisión

El API serializa money como **string**. El cliente parsea a number solo para inputs/writes. No sumar monedas distintas en el cliente; usar balance-sheet.
