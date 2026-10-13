# Fase 07: Presupuestos

## Objetivo
Presupuestos de varias categorías (incluidas sus subcategorías), con periodos y rollover opcional, y reglas claras de qué cuenta.

## Reglas de negocio
1. **R1:** un presupuesto tiene 1..N categorías, todas `EXPENSE`.
2. **R2:** una categoría no puede estar en dos presupuestos que se solapen en el periodo. Si pasa, responde 409 `CATEGORY_ALREADY_BUDGETED`: "{categoría} ya está en el presupuesto {nombre} para este periodo."
3. **R3:** las subcategorías de cada categoría incluida cuentan automáticamente (`includeChildren`, por defecto true).
4. **R4:** cuenta para `amountSpent` solo un `DEBIT` `CONFIRMED` con categoría en el conjunto y fecha en el periodo. **No** cuentan `TRANSFER`, `CARD_PAYMENT`, `ADJUSTMENT`, patas `SOURCE`/`DESTINATION` ni las asignaciones de metas. **Sí** cuentan las comisiones de transferencia (`FEE`) y los cargos de tarjeta si su categoría está incluida. Si un `CREDIT` con categoría de gasto es un reembolso, **resta** (`refundsReduceSpent`, por defecto true).
5. **R5:** periodos `MONTHLY`, `BIWEEKLY` y `CUSTOM` (como hoy). Con `recurring=true` (nuevo), el presupuesto del periodo siguiente se crea solo: lo crea el scheduler al iniciar el periodo.
6. **R6:** rollover: `NONE | SURPLUS | SURPLUS_AND_DEFICIT`. El límite efectivo es `amountLimit + carriedOver`, donde `carriedOver` sale del periodo anterior.
7. **R7:** `amountSpent` se mantiene materializado. La lógica del ledger (`budget-threshold.service.ts` y donde se actualiza `amountSpent` en `prisma-ledger.repository.ts`) busca los presupuestos por **conjunto de categorías**, ya no por `categoryId`.

**DECISIÓN (confirmar) D9:** presupuesto multicategoría con subcategorías incluidas. Alternativa: mantener una sola categoría (lo de hoy) y agrupar solo en la UI. Es más simple, pero no permite "Comida = Súper + Restaurantes" con un solo tope.

## Esquema Prisma
```prisma
enum FinBudgetRollover {
  NONE
  SURPLUS
  SURPLUS_AND_DEFICIT
  @@map("fin_budget_rollover")
}
model FinBudget {
  // categoryId: se mantiene, nullable (deprecated; = primera categoría por compatibilidad)
  categoryId      String?           @map("category_id")
  name            String?
  includeChildren Boolean           @default(true) @map("include_children")
  rollover        FinBudgetRollover @default(NONE)
  carriedOver     Decimal           @default(0) @map("carried_over") @db.Decimal(15, 2)
  recurring       Boolean           @default(false)
  categories      FinBudgetCategory[]
}
model FinBudgetCategory {
  budgetId   String      @map("budget_id")
  categoryId String      @map("category_id")
  budget     FinBudget   @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  category   FinCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@id([budgetId, categoryId])
  @@index([categoryId])
  @@map("fin_budget_categories")
}
```
El `@@unique([userId, categoryId, periodStart, periodEnd])` se elimina. La regla R2 se valida en el servicio, y además con una restricción de exclusión opcional.

## Migración de datos
1. `INSERT INTO fin_budget_categories(budget_id, category_id) SELECT id, category_id FROM fin_budgets ON CONFLICT DO NOTHING;`
2. `name` = el nombre de la categoría.
3. Recalcular `amountSpent` de los presupuestos activos con R3 y R4 (puede subir, porque ahora incluye subcategorías). Usar un script con `--dry-run`.

## API
- `POST/PATCH /budgets`: `{ name?, categoryIds: string[] (1..20), periodType, periodStart, periodEnd?, amountLimit>0, alertThresholdPct?, includeChildren?, rollover?, recurring? }`. Durante 1 versión se acepta `categoryId` (singular) como `[categoryId]`.
- `GET /budgets` (con cursor, como hoy): agrega `categories[]`, `carriedOver` y `effectiveLimit`.
- `GET /budgets/:id/transactions`: con cursor. Reemplaza el `useTransactions({categoryId})` de la web, que además evita el error `categoryId must be a UUID` de la auditoría.

## Web
- `budgets/components/budget-sheet.tsx`: selector multicategoría (chips), toggle "Incluir subcategorías", rollover en "Detalles opcionales" y la sugerencia de 3 meses ya existente, aplicada al conjunto.
- `budget-detail-screen.tsx`: usar `GET /budgets/:id/transactions`.

## Móvil y agente IA
- **Móvil:** se mantiene `categoryId` en la respuesta.
- **Agente:** `create_or_update_budget` acepta `categoryIds`.

## Tests
- **Unit:** R2, R3, R4 (reembolso que resta, `CARD_PAYMENT` que no cuenta), cálculo del rollover.
- **e2e:** presupuesto de 2 categorías y alerta de umbral. Agregar `finBudgetCategory` al mock.

## Criterios de aceptación
- Un presupuesto "Comida" con Súper + Restaurantes suma los dos, más sus subcategorías.

## Riesgos
- **El recálculo cambia los porcentajes visibles.**
- **Rendimiento:** hay que agregar un índice en `fin_budget_categories(category_id)` para el lookup en cada movimiento (ya está en el snippet).
