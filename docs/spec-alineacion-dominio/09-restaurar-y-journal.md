# Fase 09: Restaurar y diario de borrados

## Objetivo
`POST …/:id/restore` (`427cc21`) nunca aplica un efecto dos veces, restaura las operaciones completas y el diario tiene retención.

## Reglas de negocio
1. **R1:** restaurar es atómico e idempotente. Si `restoredAt` ya está puesto, responde 409 `ALREADY_RESTORED`: "Esto ya se restauró." Hoy ya se filtra `restoredAt: null` en `shared/infrastructure/deletion-journal.repository.ts`; se agrega el código de error.
2. **R2:** saldo y presupuesto se reaplican **solo** para los movimientos del snapshot que estaban `CONFIRMED` **y** cuyo efecto se revirtió al borrar (`snapshot.reversedLedgerIds`). Hay que verificar con un test que coincidan exactamente con los que compensó el borrado.
3. **R3:** las operaciones (transferencias, `CARD_PAYMENT`, comisiones) se borran y se restauran completas: el snapshot guarda todas las patas del `transferGroupId`. Restaurar solo una pata responde 409 `PARTIAL_OPERATION`.
4. **R4:** los enlaces de planificación (`revertPlanningLinks`: cobro, cuota, aporte):
   - al borrar, el snapshot guarda las filas de `FinReceivablePayment`, `FinLoanInstallment.paidAt/transactionId` y las asignaciones de metas;
   - al restaurar, se reponen y se recalculan `applyReceivableBalance`, `applySavingsGoalBalance` y el saldo del préstamo, en este orden: filas → enlaces → ledger → saldos derivados.
5. **R5:** no se puede restaurar si choca con datos nuevos (p. ej. ya existe otra cuenta con el mismo `accountNumber`, u otra institución con el mismo nombre). Responde 409 `RESTORE_CONFLICT` con `details`.
6. **R6:** retención: las entradas con `restoredAt IS NULL` y más de 30 días se purgan con un job diario (`DeletionJournalRetentionScheduler`). El "Deshacer" de la UI solo se ofrece durante la vida del toast; después, una vista "Eliminados recientes" (P2, opcional).
7. **R7:** el tamaño del snapshot de una institución debe ser ≤ 5 MB. Si lo supera, el snapshot se guarda igual y la UI avisa: "Esta institución tiene muchos datos; restaurarla puede tardar." Nunca se omite el snapshot.

**DECISIÓN (confirmar) D10:** retención de 30 días. Alternativa: 7 días (menos almacenamiento) o sin límite.

## Esquema Prisma
```prisma
model FinDeletionJournal {
  // + nuevos (el modelo ya existe, migración 20261015120000)
  operationGroupId String? @map("operation_group_id") // transferGroupId si aplica
  sizeBytes        Int     @default(0) @map("size_bytes")
  expiresAt        DateTime @map("expires_at") @db.Timestamptz(6) // backfill: created_at + 30 días
  @@index([expiresAt])
}
```

## Migración de datos
`UPDATE fin_deletion_journal SET expires_at = created_at + interval '30 days' WHERE expires_at IS NULL;` La columna se agrega primero como nullable y se llena antes del NOT NULL.

## API
- `POST /{entidad}/:id/restore`: sin cambios en la ruta. Agrega los errores R1, R3 y R5.
- `GET /deletions?cursor` (opcional): eliminados recientes.

## Web
- `shared/components/undo-toast.tsx`: manejar 409 con un mensaje en español.
- `finance-error-messages.ts`: agregar los códigos nuevos.

## Móvil y agente IA
- **Móvil:** sin cambios obligatorios.
- **Agente:** tool `restore_deleted`, opcional y con confirmación.

## Tests (clave)
- Borrar y restaurar un movimiento `CONFIRMED` deja el saldo igual al original (no ×2).
- Borrar y restaurar una transferencia: las dos patas vuelven y los saldos de las dos cuentas quedan iguales.
- Borrar y restaurar un pago de cobro: `paidAmount` y el estado vuelven.
- Borrar y restaurar una institución con cuentas, tarjetas, préstamos y vínculos de correo deja todo igual (comparar el estado completo antes y después).
- Restaurar dos veces → 409.
- La purga borra solo lo vencido.
- Actualizar `test/helpers/prisma.mock.ts` (`finDeletionJournal` con los campos nuevos).

## Criterios de aceptación
- Ninguna secuencia de borrar y restaurar cambia saldos, presupuestos ni planificación respecto al estado anterior al borrado.

## Riesgos
- **Restaurar en cascada una institución con datos editados después del borrado:** R5 lo cubre.
