# Fase 02: Transferencias

## Objetivo
Una transferencia es **una operación atómica entre cuentas**, opcionalmente con comisión, y en el tablero se ve como una sola fila.

## Reglas de negocio
1. **R1:** origen y destino deben ser **cuentas** (`fromAccountId`, `toAccountId`) distintas. Si viene `toCardId`, la ruta es `POST /card-payments` (fase 03). Durante 1 versión, `POST /transfers` con `toCardId` **se redirige internamente** a `CreateCardPaymentUseCase` y responde con `Deprecation: true`. Después de esa versión responde 400 `TRANSFER_TARGET_NOT_ACCOUNT`: "El destino de una transferencia debe ser una cuenta. Para pagar una tarjeta usa Pagar tarjeta."
2. **R2:** al crear, editar, borrar o restaurar, las dos patas (y la comisión, si la hay) van en **una sola** `prisma.$transaction`. Hoy `update-transfer.use-case.ts` hace dos `updateTransaction` por separado, y hay que mover esa lógica a `repo.updateTransfer(...)`.
3. **R3:** solo se edita si **todas** las patas están en `PENDING`. Si no, responde 409 `TRANSFER_LOCKED`: "Esta transferencia está completada. Márcala como pendiente para editarla." También existe `POST /transfers/:id/unconfirm`, que pasa todas las patas a `PENDING` y revierte los saldos.
4. **R4:** `DELETE /transactions/:id` sobre una pata borra **toda** la operación (todas las patas del `transferGroupId`), con una sola entrada en el diario (fase 09).
5. **R5:** comisión opcional, `fee: { amount, categoryId? }`. Crea una tercera pata `DEBIT` en el origen con el mismo `transferGroupId`, `role=FEE` y la categoría del sistema "Comisiones bancarias". **Sí** cuenta como gasto (es un costo real).
6. **R6:** `rail` opcional: `SAME_BANK | ACH | LBTR | OTHER`. Se guarda y la UI calcula "llega aprox." (ACH: mismo día después de las 2 PM si se envía antes de la 1 PM; LBTR: unos 8 min; ver el análisis §1.4). El estado de la pata destino se puede crear como `PENDING` (`destinationPending=true`).
7. **R7:** `GET /transactions` agrupa: con `groupOperations=true` (el valor por defecto para la web), las patas de un `transferGroupId` vuelven como **un** ítem `{ kind:'OPERATION', operationType:'TRANSFER', legs:[...] }`. Si se filtra por `accountId`, se devuelve solo la pata de esa cuenta.
8. **R8 (integración con metas):** si `toAccountId` es la cuenta de una meta (fase 05), la respuesta trae `suggestGoalId`. La UI pregunta "¿Contar como aporte?" y, si el usuario acepta, se llama `POST /savings-goals/:id/allocations { fromTransferGroupId }`.

**DECISIÓN (confirmar) D3:** la integración transferencia ↔ meta es solo por enlace explícito. Alternativa: que una transferencia hacia la cuenta de una meta sume sola al progreso. No se recomienda, porque mezcla el dinero libre con el apartado.

## Esquema Prisma
```prisma
enum FinOperationLegRole {
  SOURCE
  DESTINATION
  FEE
  @@map("fin_operation_leg_role")
}
enum FinTransferRail {
  SAME_BANK
  ACH
  LBTR
  OTHER
  @@map("fin_transfer_rail")
}
model FinTransaction {
  // + nuevos (opcionales)
  legRole FinOperationLegRole? @map("leg_role")
  rail    FinTransferRail?
}
```
Los datos existentes no se tocan. `legRole` se llena en la migración de datos.

## Migración de datos
```sql
UPDATE fin_transactions SET leg_role='SOURCE'      WHERE transfer_group_id IS NOT NULL AND type='DEBIT'  AND leg_role IS NULL;
UPDATE fin_transactions SET leg_role='DESTINATION' WHERE transfer_group_id IS NOT NULL AND type='CREDIT' AND leg_role IS NULL;
```
Las transferencias viejas con destino tarjeta (`card_id` en la pata CREDIT) se convierten en `CARD_PAYMENT` en la fase 03.

## API
| Método | Ruta | Body / reglas |
|---|---|---|
| POST | `/transfers` | `CreateTransferDto` = `{fromAccountId, toAccountId, amount>0, currency?, transactionDate, description?, notes?, fee?, rail?, destinationPending?}`. **Se eliminan** `fromCardId`/`toCardId` del DTO (con compatibilidad según R1) |
| PATCH | `/transfers/:id` | `UpdateTransferDto` (parcial de lo anterior), R3 |
| POST | `/transfers/:id/unconfirm` y `/transfers/:id/confirm` | Todas las patas, en una sola `$transaction` |
| DELETE | `/transfers/:id` | Alias de R4. Devuelve `{ undoId }` |

Errores: 400 `SAME_ACCOUNT` "El origen y el destino no pueden ser la misma cuenta"; 404 `ACCOUNT_NOT_FOUND`; 409 `TRANSFER_LOCKED`.

## Web
- `transactions/components/transfer-form.tsx` y `transfer-form-screen.tsx`:
  - al montar, abrir el selector de origen (solo cuentas); al elegirlo, abrir el selector de destino (solo cuentas, sin el origen); después, foco en `FinanceMoneyField`;
  - sección "Detalles opcionales" con la comisión y el `rail`.
- `transactions-list.tsx`: una fila por operación, con los dos logos y "Popular → BHD".
- `shared/components/pickers/destination-picker-sheet.tsx`: prop `accountsOnly`.

## Móvil y agente IA
- **Móvil:** sigue funcionando por el puente de R1 y debe migrar a `/card-payments`.
- **Agente:** la tool `create_transfer` cambia su schema (sin `toCardId`) y se agrega `pay_card` (fase 03).

## Tests
- **Unit:** si falla la segunda pata, no se modifica nada (simular una excepción dentro de la `$transaction`); editar con una pata `CONFIRMED` → 409; borrar una pata borra la operación entera; con comisión se crean 3 patas, la comisión cuenta como gasto y las patas no.
- **e2e:** crear, listar agrupado y editar en pendiente. Actualizar el mock.

## Criterios de aceptación
- Ninguna transferencia queda con una sola pata.
- No se puede editar una transferencia completada.
- En Movimientos, cada transferencia es una fila.

## Riesgos
- **Puente de compatibilidad:** hay que retirarlo en la versión siguiente.
- **Agrupar en la paginación:** el cursor debe ser por operación. Usar `(transactionDate, transferGroupId ?? id)` como clave.
