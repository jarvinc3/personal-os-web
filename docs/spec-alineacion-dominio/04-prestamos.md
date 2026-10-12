# Fase 04: Préstamos

## Objetivo
Los préstamos siguen el sistema francés de verdad: cada cuota se reparte en mora, seguro, interés y capital, el saldo baja solo por capital y hay abonos extraordinarios.

## Reglas de negocio
1. **R1:** tasa del periodo `r = interestRate / periodsPerYear` (12, 26 o 52 según `installmentFreq`). Es la misma fórmula del cliente en `src/modules/finance/loans/lib/loan-wizard.ts`.
2. **R2:** la tabla de cuotas se genera en `planning/domain/loan-installment-schedule.ts`. Cada cuota guarda `principal`, `interest`, `insurance` y `amount` = principal + interés + seguro, calculados sobre el saldo proyectado. Si `interestRate` es null, todo el pago va a capital (interés 0).
3. **R3:** al pagar una cuota (`pay-next-loan-installment.use-case.ts`), el monto pagado se distribuye en este orden: `lateFee` → `fees` → `insurance` → `interest` → `principal`. **`currentBalance -= principal`**. Hoy resta `installmentAmount`: eso es el bug que corrige esta fase.
4. **R4:** el monto pagado es editable (`amount?` en el body, por defecto la cuota). Si es menor que la cuota, la cuota queda `PARTIAL`. Si es mayor, el excedente se trata como abono (R5) solo si el usuario lo confirma (`excessAsPrepayment=true`); si no, responde 400 `PAYMENT_EXCEEDS_INSTALLMENT`.
5. **R5:** `POST /loans/:id/prepayments`:
   - body: `{ amount, accountId, mode: 'REDUCE_TERM'|'REDUCE_INSTALLMENT', date?, penaltyAmount? }`;
   - crea un `DEBIT` (categoría del sistema "Pago de préstamo", con `systemKind=LOAN_PAYMENT`) de `amount + penalty`, y la penalidad se registra en `fees`;
   - aplica `principal = amount` y recalcula las cuotas **impagas**:
     - `REDUCE_TERM`: misma cuota, menos cuotas (`totalInstallments` baja);
     - `REDUCE_INSTALLMENT`: mismo plazo, cuota nueva (`installmentAmount` baja).
   - Solo se permite si no hay cuotas vencidas impagas. Si las hay, responde 409 `LOAN_HAS_OVERDUE`: "Paga primero las cuotas vencidas."
6. **R6:** mora opcional: `lateFeePolicy: { type:'FIXED'|'PCT_OF_INSTALLMENT', value, graceDays }`. El scheduler marca `OVERDUE` y calcula `lateFee` estimado; es editable.
7. **R7:** tasa `FIXED` o `VARIABLE`. Con `VARIABLE`, `PATCH /loans/:id { interestRate }` recalcula las cuotas impagas.
8. **R8:** `GET /loans/:id/schedule` devuelve la proyección completa. `GET /loans/:id/installments` va con cursor.
9. **R9:** las validaciones actuales de `loan-fields.dto.ts` y `create-loan.dto.ts` (`27444f3d`) se mantienen.

**DECISIÓN (confirmar) D5:** el pago de un préstamo **sí** cuenta como gasto (categoría "Pago de préstamo"), porque el dinero sale de verdad. Alternativa: contar como gasto solo los intereses y cargos, y tratar el capital como reducción de deuda, que es lo correcto contablemente. Se recomienda que el presupuesto cuente el total, que es lo que el usuario entiende, y que la analítica pueda separar el capital.

## Esquema Prisma
```prisma
enum FinInstallmentStatus {
  PENDING
  PARTIAL
  PAID
  OVERDUE
  @@map("fin_installment_status")
}
enum FinRateType {
  FIXED
  VARIABLE
  @@map("fin_rate_type")
}
model FinLoan {
  // + nuevos
  rateType         FinRateType @default(FIXED) @map("rate_type")
  insuranceAmount  Decimal?    @map("insurance_amount") @db.Decimal(15, 2)
  lateFeePolicy    Json?       @map("late_fee_policy")
  prepaymentPenaltyPct Decimal? @map("prepayment_penalty_pct") @db.Decimal(5, 4)
  disbursementDate DateTime?   @map("disbursement_date") @db.Date
  prepayments      FinLoanPrepayment[]
}
model FinLoanInstallment {
  // + nuevos
  principal  Decimal              @default(0) @db.Decimal(15, 2)
  interest   Decimal              @default(0) @db.Decimal(15, 2)
  insurance  Decimal              @default(0) @db.Decimal(15, 2)
  fees       Decimal              @default(0) @db.Decimal(15, 2)
  lateFee    Decimal              @default(0) @map("late_fee") @db.Decimal(15, 2)
  paidAmount Decimal              @default(0) @map("paid_amount") @db.Decimal(15, 2)
  status     FinInstallmentStatus @default(PENDING)
}
model FinLoanPrepayment {
  id            String   @id @default(dbgenerated("(uuid_generate_v4())::text"))
  loanId        String   @map("loan_id")
  amount        Decimal  @db.Decimal(15, 2)
  penalty       Decimal  @default(0) @db.Decimal(15, 2)
  mode          String   // REDUCE_TERM | REDUCE_INSTALLMENT
  paidAt        DateTime @map("paid_at") @db.Date
  transactionId String?  @unique @map("transaction_id")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  loan          FinLoan  @relation(fields: [loanId], references: [id], onDelete: Cascade)
  transaction   FinTransaction? @relation(fields: [transactionId], references: [id], onDelete: SetNull)
  @@index([loanId, paidAt])
  @@map("fin_loan_prepayments")
}
```

## Migración de datos (de riesgo)
1. Script TS `scripts/finance/backfill-loan-schedule.ts`, idempotente y por préstamo:
   - (a) recalcula `principal`, `interest` e `insurance` de todas las cuotas con R2;
   - (b) marca `status=PAID` y `paidAmount = amount` en las que tienen `paidAt`;
   - (c) **recalcula `currentBalance`** = `originalAmount − Σ principal` de las pagadas.
2. Antes de escribir, guarda el valor anterior en `notes`/`aiMetadata` o en una tabla temporal `fin_loan_balance_backup(loan_id, old_balance, new_balance)`.
3. Con `--dry-run`, lista las diferencias por préstamo.

**DECISIÓN (confirmar) D6:** recalcular `currentBalance` a partir de la tabla. Alternativa: conservar el saldo que el usuario escribió y solo corregir los pagos futuros. Hay que elegir por préstamo si Jarvin tiene saldos tomados del banco: en ese caso, el saldo del banco manda y se recalcula la tabla hacia adelante.

## API
| Método | Ruta | Notas |
|---|---|---|
| POST | `/loans/:id/pay-next-installment` | Body opcional `{ amount?, accountId?, excessAsPrepayment? }`. Responde con el desglose |
| POST | `/loans/:id/prepayments` | R5. Respuesta `{ prepayment, loan, schedulePreview }` |
| GET | `/loans/:id/prepayments/preview?amount&mode` | Ahorro de intereses y fecha de fin nueva, sin escribir |
| GET | `/loans/:id/schedule` | Proyección |
| GET | `/loans/:id/installments` | Con cursor |

Errores: 400 `PAYMENT_EXCEEDS_INSTALLMENT` "El pago supera la cuota. ¿Quieres aplicar el excedente como abono a capital?"; 409 `LOAN_HAS_OVERDUE`; 404 `LOAN_NOT_FOUND`.

## Web
- `loans/loan-detail-screen.tsx`:
  - tarjeta de cuota "Cuota N de M · vence … · capital X · interés Y";
  - una hoja `installment-detail-sheet.tsx` con el desglose y el historial (fecha, cuenta y enlace al movimiento);
  - un botón "Abonar a capital" que abre `loan-prepayment-sheet.tsx` (monto, modo con vista previa del ahorro y aviso de penalidad).
- Asistente (`loan-wizard.tsx`): pide seguro mensual y tipo de tasa en "Detalles opcionales".

## Móvil y agente IA
- **Móvil:** `pay-next-installment` sin body sigue funcionando.
- **Agente:**
  - `mark_loan_installment_paid` debe usar el mismo caso de uso (hoy solo hay doc, verificar);
  - tools nuevas `prepay_loan` (con confirmación) y `get_loan_schedule`.

## Tests
- **Unit:**
  - tabla francesa con un caso numérico fijo (p. ej. RD$100,000, 18% anual, 12 meses → cuota 9,168.00);
  - la distribución de R3;
  - un abono con cada modo produce la tabla esperada;
  - el backfill es idempotente.
- **e2e:** pagar y abonar. Agregar `finLoanPrepayment` al mock.

## Criterios de aceptación
- Después de una cuota, el saldo baja solo por el capital.
- El abono reduce el plazo o la cuota según lo elegido.

## Riesgos
- **El backfill cambia saldos visibles:** comunicarlo y correr `dry-run` primero.
- **Préstamos sin tasa:** quedan con interés 0, y es correcto.
