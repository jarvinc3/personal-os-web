# Fase 06: Cobros (cuentas por cobrar)

## Objetivo
Registrar lo que realmente se cobró, resolver el excedente y permitir el castigo de deudas incobrables.

## Reglas de negocio
1. **R1:** un pago crea un `CREDIT` en la cuenta por el **monto real recibido** (`record-receivable-payment.use-case.ts`).
2. **R2:** se aplica al cobro `min(monto, pendiente)`. El excedente `excess = monto − pendiente` se resuelve con `excessHandling`:
   - `EXTRA_INCOME`: la parte excedente del `CREDIT` se queda como ingreso con la categoría del sistema "Ingreso extra" (`systemKind=EXTRA_INCOME`). El `CREDIT` se divide en dos patas con el mismo `transferGroupId`: la parte aplicada (sin categoría de ingreso, porque es devolución de deuda) y la parte extra;
   - `CREDIT_BALANCE`: el excedente queda como `creditBalance` del cobro (saldo a favor del deudor, para devolver o aplicar después);
   - `APPLY_TO_RECEIVABLE`: se aplica a `targetReceivableId`, que debe ser del mismo usuario y estar abierto.
3. **R3:** si hay excedente y no viene `excessHandling`, responde **422** `RECEIVABLE_EXCESS_UNRESOLVED`: "El pago supera lo pendiente por {excess}. Elige qué hacer con la diferencia." con `details: { outstanding, excess }`. Reemplaza al 400 actual, y la UI muestra las 3 opciones.
4. **R4:** `POST /receivables/:id/write-off { amount?, reason? }`: cierra el cobro con `status=WRITTEN_OFF` y `writtenOffAmount = pendiente`. No crea movimiento; la analítica lo puede mostrar como "Pérdidas".
5. **R5:** estados: `PENDING`, `PARTIAL`, `PAID`, `CANCELLED` y **`WRITTEN_OFF`** (nuevo). `PAID` cuando `paidAmount ≥ amount`. Se calcula en `planning/infrastructure/receivable-balance.ts`.

**DECISIÓN (confirmar) D8:** la UI propone `EXTRA_INCOME` por defecto. Alternativa: `CREDIT_BALANCE` por defecto, que es más conservador.

## Esquema Prisma
```prisma
enum FinReceivableStatus {
  PENDING
  PARTIAL
  PAID
  CANCELLED
  WRITTEN_OFF
}
model FinReceivable {
  // + nuevos
  creditBalance    Decimal @default(0) @map("credit_balance") @db.Decimal(15, 2)
  writtenOffAmount Decimal @default(0) @map("written_off_amount") @db.Decimal(15, 2)
  writtenOffAt     DateTime? @map("written_off_at") @db.Timestamptz(6)
}
model FinReceivablePayment {
  // + nuevos
  appliedAmount  Decimal @map("applied_amount") @db.Decimal(15, 2) // backfill = amount
  excessAmount   Decimal @default(0) @map("excess_amount") @db.Decimal(15, 2)
  excessHandling String? @map("excess_handling")
}
```

## Migración de datos
`UPDATE fin_receivable_payments SET applied_amount = amount WHERE applied_amount IS NULL;` (se agrega la columna primero como nullable y se llena antes de marcarla NOT NULL). El nuevo valor del enum va en una migración aparte.

## API
| Método | Ruta | Body |
|---|---|---|
| POST | `/receivables/:id/payments` | `{ amount>0, accountId, paidAt?, notes?, excessHandling?, targetReceivableId? }` |
| POST | `/receivables/:id/write-off` | `{ reason? }` |
| GET | `/receivables/:id/payments` | Con cursor |

## Web
- `receivable-payment-sheet.tsx`: si `amount > pendiente`, un bloque inline con las 3 opciones.
- `receivable-detail-screen.tsx`: acción "Castigar deuda" en el ⋮.

## Móvil y agente IA
- **Móvil:** antes recibía 400 y ahora recibe 422. Si no maneja el 422, sigue viendo un error equivalente.
- **Agente:** tool `record_receivable_payment`.

## Tests
- **Unit:** las 3 vías de excedente; R5; el castigo no mueve saldos.
- **e2e:** pagar de más sin `excessHandling` → 422; con `excessHandling` → 201.

## Criterios de aceptación
- Se puede registrar un cobro por más de lo pendiente y queda claro qué pasó con la diferencia.

## Riesgos
- **Dividir el `CREDIT` en dos patas:** hay que asegurar que solo la parte extra cuente como ingreso en la analítica.
