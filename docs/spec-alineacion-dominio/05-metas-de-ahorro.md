# Fase 05: Metas de ahorro

## Objetivo
La meta vive dentro de una cuenta bancaria. Aportar es **apartar** dinero, no gastarlo.

## Reglas de negocio
1. **R1:** cada meta tiene `accountId`, que debe ser una cuenta (`CHECKING`, `SAVINGS` o `INVESTMENT`; `CASH` está permitido; tarjetas no). Si no se envía, responde 400 `GOAL_ACCOUNT_REQUIRED`: "Elige la cuenta donde guardas este dinero."
2. **R2:** dos modos (`mode`):
   - `EARMARK`: la meta usa una cuenta compartida y los aportes son asignaciones **sin movimiento**;
   - `DEDICATED`: la cuenta es exclusiva de la meta, y `currentAmount` = saldo de la cuenta (opcionalmente con un tope).
3. **R3:** `EARMARK`: `POST /savings-goals/:id/allocations { amount, date?, notes?, fromTransferGroupId? }` crea un `FinSavingsGoalAllocation` con signo `+`. Si el usuario quiere aportar desde **otra** cuenta, la UI crea **antes** una transferencia (fase 02) hacia la cuenta de la meta y la enlaza con `fromTransferGroupId`.
4. **R4:** retiro: una asignación con signo `−` (`kind=WITHDRAWAL`). Si se usa para un gasto, se puede enlazar `transactionId` del gasto. `spendReducesProgress` (por meta, default true) decide si un gasto enlazado resta del progreso.
5. **R5:** invariante: Σ de lo apartado en todas las metas `EARMARK` de una cuenta ≤ `FinAccount.balance`. Si un aporte lo viola, responde 409 `EARMARK_EXCEEDS_BALANCE`: "No tienes suficiente saldo libre en {cuenta}."
6. **R6:** las cuentas exponen `earmarkedAmount` y `freeBalance = balance − earmarkedAmount`.
7. **R7:** ninguna asignación crea un `DEBIT`. **Esto revierte el comportamiento de `697cdafa`** (`record-savings-goal-contribution.use-case.ts`).

**DECISIÓN (confirmar) D7:** el modo por defecto es `EARMARK`, y las metas no separan el dinero. Alternativa: `DEDICATED` siempre, que obliga a tener una cuenta por meta, y en RD es poco común salvo en Qik o en cuentas de ahorro aparte.

## Esquema Prisma
```prisma
enum FinGoalMode {
  EARMARK
  DEDICATED
  @@map("fin_goal_mode")
}
enum FinAllocationKind {
  CONTRIBUTION
  WITHDRAWAL
  @@map("fin_allocation_kind")
}
model FinSavingsGoal {
  // + nuevos
  accountId            String?     @map("account_id") // obligatorio por DTO; nullable solo por los datos viejos
  mode                 FinGoalMode @default(EARMARK)
  spendReducesProgress Boolean     @default(true) @map("spend_reduces_progress")
  account              FinAccount? @relation(fields: [accountId], references: [id], onDelete: SetNull)
  @@index([accountId])
}
```
`FinSavingsGoalContribution` pasa a funcionar como "asignación":
```prisma
model FinSavingsGoalContribution {
  // existentes: id, goalId, amount, contributedAt, notes, accountId, transactionId
  kind             FinAllocationKind @default(CONTRIBUTION)
  transferGroupId  String?           @map("transfer_group_id")
}
```
El nombre de la tabla no cambia, para no romper la app móvil. `amount` siempre es positivo y el signo lo da `kind`.

## Migración de datos (de riesgo)
1. Para cada aporte con `transaction_id` (creados después de `697cdafa`):
   - (a) si el `DEBIT` "Aporte: …" sigue `CONFIRMED`, **borrarlo sin compensar dos veces**: usar el caso de uso de borrado del ledger, que repone el saldo y `amountSpent`, y luego poner `transaction_id = NULL`;
   - (b) poner `account_id` en la meta = la cuenta del aporte más frecuente.
2. Las metas sin cuenta quedan con `account_id NULL` y la UI pide asignarla (banner).
3. Script `scripts/finance/backfill-goal-allocations.ts`, idempotente y con `--dry-run`. Antes de correrlo, desactivar `revertPlanningLinks` para los aportes (`prisma-ledger.repository.ts`). Si no, borrar el `DEBIT` eliminaría el aporte.

## API
| Método | Ruta | Notas |
|---|---|---|
| POST | `/savings-goals` | Ahora exige `accountId` y acepta `mode?` |
| POST | `/savings-goals/:id/allocations` | `{ kind, amount>0, date?, notes?, fromTransferGroupId?, transactionId? }`. R3–R5 |
| DELETE | `/savings-goals/:id/allocations/:allocId` | Sin efecto en el ledger |
| GET | `/savings-goals/:id/allocations` | Con cursor |
| POST/GET/DELETE | `/savings-goals/:id/contributions` | **Deprecated** como alias de `allocations` con `kind=CONTRIBUTION`. Ignora `accountId` si coincide con la cuenta de la meta; si es otra cuenta, crea la transferencia de R3 |
| GET | `/accounts`, `/accounts/:id` | Se agregan `earmarkedAmount` y `freeBalance` |

## Web
- `savings-goals/components/savings-goal-sheet.tsx`: selector de cuenta (solo cuentas) y modo.
- `savings-goal-contribution-sheet.tsx` → "Apartar", "Retirar" y "Desde otra cuenta" (transferencia + enlace).
- `account-detail-screen.tsx`: "Libre / Apartado".

## Móvil y agente IA
- **Móvil:** el alias `/contributions` lo mantiene funcionando.
- **Agente:**
  - `create_savings_goal` agrega `accountId`;
  - la tool de aporte (`1fd5ceb2`) pasa a `allocate_to_goal`.

## Tests
- **Unit:** R5 (rechaza un apartado mayor que el saldo libre); retiro; el backfill repone el saldo y `amountSpent` exactamente una vez.
- **e2e:** crear una meta con cuenta, apartar y ver `freeBalance`. Actualizar el mock.

## Criterios de aceptación
- Aportar a una meta no cambia el saldo de la cuenta ni el gasto.
- El saldo libre se ve en la cuenta.

## Riesgos
- **Backfill que borra movimientos:** hacer un respaldo del diario antes. Esta fase depende de la fase 09.
