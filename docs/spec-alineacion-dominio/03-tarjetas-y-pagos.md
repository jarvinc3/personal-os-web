# Fase 03: Tarjetas, pagos y cortes

## Objetivo
El pago de tarjeta tiene semántica propia y el corte pasa a ser una entidad con estado, pago mínimo y pagado. Todo por moneda.

## Reglas de negocio
1. **R1:** `CARD_PAYMENT` es una operación de 2 patas: `DEBIT` en la cuenta (`legRole=SOURCE`) y `CREDIT` en la tarjeta (`legRole=DESTINATION`), con el mismo `transferGroupId`. La pata de la tarjeta **sube el disponible** (`FinCardBalance.balance += ledgerAmount`).
2. **R2:** no cuenta en analítica, presupuestos ni gasto (I5). En el tablero se muestra "Pago a {tarjeta}", con su propio icono.
3. **R3:** solo tarjetas `CREDIT`. Una de débito responde 400 `CARD_NOT_CREDIT`: "Solo se pagan tarjetas de crédito."
4. **R4:** moneda: el pago va a la moneda elegida (`currency`). Si es distinta de la de la cuenta, se aplica FX con `ResolveAmountsUseCase` (como hoy). Si la tarjeta no tiene saldo en esa moneda, responde 400 `CARD_CURRENCY_MISSING`.
5. **R5:** el corte (`FinCardStatement`) guarda `closingBalance`, `minimumPayment?` (importado o estimado), `dueDate` y `status`. `paidAmount` se **calcula**: Σ de las patas `CARD_PAYMENT` `CONFIRMED` de esa moneda con `transactionDate` en `(cycleEnd, dueDate]`.
6. **R6:** el estado del corte (lo recalcula el scheduler `statements/infrastructure/card-statements.scheduler.ts` y cada pago):
   - `OPEN`: el ciclo está en curso;
   - `CLOSED`: ya cerró y `paid = 0`;
   - `PARTIAL`: `0 < paid < minimumPayment`;
   - `MINIMUM_PAID`: `minimumPayment ≤ paid < closingBalance`;
   - `PAID`: `paid ≥ closingBalance`;
   - `OVERDUE`: pasó `dueDate` y `paid < minimumPayment`.
7. **R7:** pago mínimo estimado, cuando no viene importado: `max(1/36 × closingBalance, 0)`, redondeado a 2 decimales, con `minimumSource=ESTIMATED`. Es la regla de capital del instructivo de la SB; la estimación no incluye intereses ni cargos (análisis §1.2).
8. **R8:** cargos de la tarjeta: categorías del sistema `Intereses`, `Comisiones`, `Avance de efectivo` con `systemKind`. **Sí** cuentan como gasto, pero la analítica las puede separar.
9. **R9:** `GET /cards/:id/statements/:statementId` devuelve el detalle: los movimientos del ciclo (por `ledgerCurrency` y fecha en `[cycleStart, cycleEnd]`), los pagos aplicados y el estado.

**DECISIÓN (confirmar) D4:** el pago de tarjeta **no es un gasto** (`CARD_PAYMENT`). La alternativa de Jarvin era un "gasto que resta de la cuenta y suma al disponible", con categoría. Con eso el consumo se cuenta dos veces, en el consumo y en el pago. Si Jarvin la elige, el pago tendría que excluirse a mano de presupuestos y analítica, que en la práctica es lo mismo que este tipo propio.

## Esquema Prisma
```prisma
enum FinTransactionType {
  DEBIT
  CREDIT
  TRANSFER
  ADJUSTMENT
  CARD_PAYMENT // nuevo: se aplica a las dos patas
}
enum FinCardStatementStatus {
  OPEN
  CLOSED
  PARTIAL
  MINIMUM_PAID
  PAID
  OVERDUE
  @@map("fin_card_statement_status")
}
enum FinAmountSource {
  IMPORTED
  ESTIMATED
  MANUAL
  @@map("fin_amount_source")
}
model FinCardStatement {
  // + nuevos
  minimumPayment Decimal?               @map("minimum_payment") @db.Decimal(15, 2)
  minimumSource  FinAmountSource?       @map("minimum_source")
  status         FinCardStatementStatus @default(CLOSED)
  importedAt     DateTime?              @map("imported_at") @db.Timestamptz(6)
}
model FinCategory {
  // + nuevo
  systemKind String? @map("system_kind") // INTEREST | FEE | CASH_ADVANCE | BANK_FEE
}
```
> Agregar un valor a un enum en Postgres (`ALTER TYPE ... ADD VALUE`) no puede ir dentro de una transacción junto con su uso. Por eso va en **una migración aparte**, antes de la migración de datos.

## Migración de datos
1. Convertir las transferencias viejas a tarjeta:
   ```sql
   UPDATE fin_transactions t SET type='CARD_PAYMENT'
   WHERE t.transfer_group_id IN (
     SELECT transfer_group_id FROM fin_transactions WHERE card_id IS NOT NULL AND transfer_group_id IS NOT NULL);
   ```
   Los saldos no cambian, porque el efecto ya era el mismo.
2. Recalcular `status` y `minimumPayment` (estimado) de los cortes existentes con un script TS idempotente (`scripts/finance/backfill-statement-status.ts`), que llame al servicio.

## API
| Método | Ruta | Body / respuesta |
|---|---|---|
| POST | `/card-payments` | `{ fromAccountId, cardId, amount>0, currency, transactionDate, statementId? }` → `{ transferGroupId, debit, credit, statement? }` |
| PATCH / DELETE | `/card-payments/:id` | Mismas reglas que una transferencia (fase 02, R2–R4) |
| GET | `/cards/:id/statements` | Se agregan `status`, `minimumPayment`, `paidAmount` y `dueDate`. **Con cursor** |
| GET | `/cards/:id/statements/:statementId` | `{ statement, movements:[…], payments:[…] }` |
| PATCH | `/cards/:id/statements/:statementId` | `{ minimumPayment?, closingBalance?, dueDate? }` → `minimumSource=MANUAL` |
| POST | `/cards/:id/statements/import` | multipart PDF → 202 `{ jobId }`. **Solo reserva el contrato en esta fase**: responde 501 "Próximamente" |

## Web
- `cards/card-detail-screen.tsx`:
  - el bloque de saldos pasa a **Disponible / Deuda actual / Balance al corte**;
  - un botón "Pagar tarjeta" que abre la hoja `card-payment-sheet.tsx` con origen (solo cuentas), moneda (las monedas de la tarjeta) y monto, con atajos "Pago mínimo", "Balance al corte" y "Otro".
- **Lista de cortes:** cada fila abre una hoja de detalle con el estado y su cuenta regresiva hasta la fecha límite.
- Quitar la opción de destino tarjeta de la transferencia (fase 02).

## Móvil y agente IA
- **Móvil:** usar `/card-payments`. Los campos nuevos del corte son opcionales.
- **Agente:**
  - tools nuevas `pay_card` y `get_card_statement`;
  - `get_finance_summary` excluye `CARD_PAYMENT` del gasto.

## Tests
- **Unit:** un pago sube el disponible y no cambia `amountSpent`; se prueba R6 en todos sus estados con fechas límite; pago bimoneda.
- **e2e:** pagar y obtener el detalle del corte. Actualizar el mock (`finCardStatement` con los campos nuevos).

## Criterios de aceptación
- Pagar la tarjeta no aparece en gastos ni en presupuestos.
- El corte muestra mínimo, pagado y estado correctos.

## Riesgos
- **Migración del enum:** tiene que ir separada.
- **Analítica que filtra `type='DEBIT'`:** las patas `DEBIT` de `CARD_PAYMENT` ahora tienen `type=CARD_PAYMENT`. Revisar `analytics.repository.ts` y `budget-threshold.service.ts`.
