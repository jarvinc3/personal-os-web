# Fase 01: Estados, edición y ajustes

## Objetivo
Cada estado del movimiento tiene reglas de edición explícitas. Los revertidos no cuentan para nada, y los ajustes salen del tablero.

## Reglas de negocio
1. **R1:** `PENDING` → se pueden editar todos los campos (monto, moneda, destino, fecha, tipo DEBIT/CREDIT, categoría, comercio, descripción, notas).
2. **R2:** `CONFIRMED` → solo se pueden editar `categoryId`, `merchant`, `description` y `notes`. Si el cambio toca `amount`, `currency`, `accountId`, `cardId`, `transactionDate` o `type`, responde **409** `TRANSACTION_LOCKED`: "Este movimiento está completado. Márcalo como pendiente para editarlo."
3. **R3:** `POST /transactions/:id/unconfirm`: pasa de `CONFIRMED` a `PENDING` y **revierte** el efecto en el saldo y en `amountSpent`, en la misma `$transaction`. Solo aplica a movimientos que no sean patas de una operación (las transferencias tienen su propio flujo, fase 02) ni estén enlazados a una cuota, un cobro o un aporte; en esos casos responde **409** `TRANSACTION_LINKED`: "Este movimiento está ligado a {cuota|cobro|aporte}. Edítalo desde ahí."
4. **R4:** `REVERSED`, `CANCELLED` y `DECLINED` → solo se edita `notes`, y `categoryId` en `REVERSED`. Lo demás responde 409 `TRANSACTION_IMMUTABLE`: "Este movimiento ya no se puede editar."
5. **R5:** un `REVERSED` y su reverso enlazado (`linkedTransactionId`) no cuentan en saldo (ya se compensan), analítica, presupuestos ni totales del tablero. **[Verificar]** si `analytics.repository.ts` excluye el par original+reverso; si no lo hace, excluir los `status IN (REVERSED)` **y** los movimientos con `linkedTransactionId` apuntando a uno `REVERSED`.
6. **R6:** `ADJUSTMENT` afecta el saldo, **no** cuenta en analítica ni presupuesto, y **no** aparece en `GET /transactions` salvo que se pase `includeAdjustments=true`, o un `type=ADJUSTMENT` explícito.
7. **R7:** nuevo `GET /accounts/:id/history` y `GET /cards/:id/history` (con cursor): ajustes + cambios de límite + cortes cerrados (fase 03), en orden cronológico.

**DECISIÓN (confirmar) D2:** los ajustes siguen en `FinTransaction` y se filtran. Alternativa: una tabla `FinBalanceAdjustment` aparte; obliga a migrar datos y a tocar I1, y no aporta nada.

## Esquema Prisma
Sin cambios en los enums. Se agrega un historial de eventos de la entidad, para los cambios de límite:
```prisma
model FinInstrumentEvent {
  id        String   @id @default(dbgenerated("(uuid_generate_v4())::text"))
  userId    String   @map("user_id")
  accountId String?  @map("account_id")
  cardId    String?  @map("card_id")
  kind      String   // CREDIT_LIMIT_CHANGED | ADJUSTMENT | STATEMENT_CLOSED
  payload   Json     @default("{}")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  account   FinAccount? @relation(fields: [accountId], references: [id], onDelete: Cascade)
  card      FinCard?    @relation(fields: [cardId], references: [id], onDelete: Cascade)
  @@index([accountId, createdAt])
  @@index([cardId, createdAt])
  @@map("fin_instrument_events")
}
```
Los ajustes **no** se duplican aquí: el historial hace un UNION con `FinTransaction` `type=ADJUSTMENT`.

## Migración de datos
Ninguna. Opcional: guardar como `CREDIT_LIMIT_CHANGED` el límite actual de cada `FinCardBalance`, como evento inicial.

## API
| Método | Ruta | Cambio |
|---|---|---|
| PATCH | `/transactions/:id` | Valida R1, R2 y R4 en `ledger/application/update-transaction.use-case.ts`, antes de `repo.updateTransaction` |
| POST | `/transactions/:id/unconfirm` | Nuevo. `UnconfirmTransactionUseCase` (simétrico a `confirm-transaction.use-case.ts`) |
| GET | `/transactions` | Nuevo query `includeAdjustments?: boolean` (por defecto false) en `list-transactions-query.dto.ts`; filtro en `prisma-ledger.repository.ts` (`type: { not: 'ADJUSTMENT' }`) |
| GET | `/accounts/:id/history`, `/cards/:id/history` | Nuevo. `{ items:[{kind, at, amount?, currency?, payload}], nextCursor, hasMore }` |

Respuesta de cada movimiento: se agrega `editable: 'FULL'|'METADATA'|'NOTES'|'NONE'`, para que la UI no repita la regla.

## Web
- `transactions/transaction-detail-screen.tsx`: la opción "Editar" según `editable`, más la acción "Marcar como pendiente".
- `transaction-form.tsx`: deshabilita los campos bloqueados y muestra un banner con candado.
- `transactions-list.tsx` y `month-section.tsx`: `REVERSED`/`CANCELLED`/`DECLINED` con `opacity-50`, el monto en `text-muted-foreground line-through` y la etiqueta; quedan fuera de los totales del mes.
- **Historial de entidad:** una hoja o sección "Historial" en `account-detail-screen.tsx` y `card-detail-screen.tsx`, con el icono `Settings2` ×2 (⚙⚙) para los ajustes.

## Móvil y agente IA
- **Móvil:** se queda con el mismo enum. Si edita un monto confirmado recibirá 409, así que tiene que mostrar el mensaje.
- **Agente:** `update_transaction` ya solo edita metadatos, así que es compatible. Agregar la tool `unconfirm_transaction`.

## Tests
- **Unit:** `update-transaction.use-case.spec.ts` con una matriz estado × campo (R1–R4); `unconfirm` revierte el saldo y `amountSpent`; `unconfirm` sobre un movimiento enlazado da 409.
- **Repo:** el listado excluye `ADJUSTMENT` por defecto.
- **e2e** (`test/finance.e2e-spec.ts`): PATCH con monto sobre `CONFIRMED` → 409; unconfirm → PATCH → confirm deja el saldo correcto. Agregar `finInstrumentEvent` a `test/helpers/prisma.mock.ts`.

## Criterios de aceptación
- No se puede cambiar el monto de un movimiento completado sin desbloquearlo antes.
- Los revertidos se ven grises y no suman en ningún total.
- Los ajustes no salen en Movimientos y sí en el historial.

## Riesgos
- Tools o la app móvil que hoy editan el monto de movimientos confirmados.
- Que la analítica cuente los reversos dos veces: verificar R5 con datos reales.
