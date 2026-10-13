# Revisión post-alineación del módulo de Finanzas

Fecha: 2026-10-12
Rama revisada: `feat/finance-fase-08` en `personal-os-back` y `personal-os-web`.
Base de contraste: `docs/spec-alineacion-dominio/` (10 documentos, fases 01 a 09).
Este documento es solo diagnóstico: no se aplicaron correcciones.

## Alcance y método

Se leyó la spec completa y se recorrió el código de las nueve fases en los tres
frentes: back (`packages/finance`, `packages/ai-agent`, migraciones y scripts),
web (`src/modules/finance`) y contratos (`docs/modules/finance/contracts`).

Puntos de partida:

- back: `380e093` (fase 08), 22 commits por delante de `develop`.
- web: `17d815e` (fase 08), 22 commits por delante de `develop`.
- migraciones nuevas: `20261015130000` a `20261015210000`.
- scripts de datos: `scripts/finance/backfill-goal-allocations.ts` y
  `scripts/finance/backfill-loan-schedule.ts`.

El orden de la spec era `01, 02, 09, 03, 04, 05, 06, 07, 08`. Por el orden de
commits, la 09 se hizo después de la 08 y antes de la 03 en web (`c2495b9`),
lo cual respeta la dependencia declarada de la 05 con la 09.

## Resumen

Se encontraron 33 hallazgos. La mayoría de los cambios de back de las fases 01
a 09 están implementados; el patrón que más se repite es **back listo y web sin
consumirlo** (presupuesto multicategoría, cortes, desglose de cuotas, apartados
de metas, duplicados). También hay tres riesgos de datos en migraciones y
scripts, y huecos de contrato en las tools del agente.

| Severidad | Cantidad | Foco                                                                                                       |
| --------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| Alto      | 6        | Scripts de datos y migración de idempotencia, rollover, presupuesto multicategoría, detalle de presupuesto |
| Medio     | 17       | Huecos de UI back a web, contrato de cobros, tools del agente, compatibilidad móvil                        |
| Bajo      | 10       | Paginación, contrato de API, proceso de PR y CHANGELOG                                                     |

## Alto

### A1. La migración de idempotencia puede fallar el deploy sin el script de limpieza

`packages/database/prisma/migrations/20261015210000_fin_email_idempotency/migration.sql`
crea el índice único parcial `fin_transactions_user_inst_ref_key` sin comprobar
antes si ya hay filas con la misma
`(user_id, institution_id, external_reference)`. El propio comentario de la
migración dice que los duplicados deben eliminarse antes con
`scripts/finance/dedupe-existing.ts`, pero ese script **no existe**
(`scripts/finance/` solo tiene `backfill-goal-allocations.ts` y
`backfill-loan-schedule.ts`). La spec 08 (paso 2 de la migración) marca esa
detección como obligatoria.

Consecuencia: en una base con duplicados, `prisma migrate deploy` aborta y
bloquea el despliegue. Falta el script, con `--dry-run`, conservando el más
antiguo y borrando el resto por el diario con compensación de saldo.

### A2. `backfill-loan-schedule.ts` puede subir el saldo de préstamos ya pagados

`scripts/finance/backfill-loan-schedule.ts` calcula
`currentBalance = originalAmount - suma(principal)` de las cuotas con `paidAt`.
Las cuotas anteriores a esta fase tienen `principal = 0`: la migración
`20261015170000_fin_loan_schedule` agrega la columna con `DEFAULT 0` y solo marca
`status='PAID'`, sin recalcular el desglose. Por eso la suma de capital pagado es
cero y el script deja `currentBalance = originalAmount`, es decir **revierte el
efecto de todas las cuotas pagadas antes de la fase 04**.

La spec 04 pide tres pasos: (a) recalcular `principal`, `interest` e `insurance`
con la tabla francesa, (b) marcar `PAID` con `paidAmount = amount`, y (c)
recalcular el saldo. El script solo hace (c), y sin el paso (a) el resultado es
incorrecto. Además falta la tabla de respaldo `fin_loan_balance_backup` y el
listado de diferencias por préstamo que pide la spec (hay `--dry-run`, pero se
apoya en el desglose vacío).

### A3. `backfill-goal-allocations.ts` no repone `amountSpent` ni pasa por el diario

`scripts/finance/backfill-goal-allocations.ts` borra el `DEBIT` de cada aporte e
incrementa `finAccount.balance` directamente en un `$transaction`. No usa el caso
de uso de borrado del ledger y no escribe entrada en `fin_deletion_journal`.

La spec 05 (migración, paso 1a) pide usar el caso de uso de borrado del ledger,
que repone el saldo y `amountSpent`. Al no hacerlo:

- los presupuestos siguen contando el aporte borrado como gasto;
- el borrado no es restaurable ni auditable desde el diario;
- se salta el outbox de eventos.

Riesgo de datos visible (gasto inflado) y de trazabilidad.

### A4. Falta `GET /budgets/:id/transactions` y el detalle de presupuesto muestra datos incompletos

La spec 07 agrega `GET /budgets/:id/transactions` (con cursor) para reemplazar el
`useTransactions({ categoryId })` de la web. El endpoint no existe: en
`packages/finance/src/planning/presentation/budgets.controller.ts` no hay esa
ruta.

La web sigue con el patrón viejo en
`src/modules/finance/budgets/budget-detail-screen.tsx:147`: filtra por
`categoryId: budget.categoryId` (solo la primera categoría) y por `type: "DEBIT"`.
Con un presupuesto de varias categorías o con subcategorías incluidas, el detalle
solo lista una parte de los movimientos que sí suman en `amountSpent`.

### A5. La web no consume el presupuesto multicategoría

El back acepta y devuelve `categoryIds`, `includeChildren`, `rollover`,
`recurring`, `carriedOver` y `effectiveLimit` (fase 07, versión 1.15.0). La web
no los ve:

- `src/modules/finance/budgets/lib/budget-form.ts` mantiene `categoryId: string`
  y el formulario tiene un solo `CategoryTrigger` con
  `setValue("categoryId", ...)` (`budget-sheet.tsx:364`). No hay chips de varias
  categorías, ni toggle de incluir subcategorías, ni sección de rollover.
- `FinanceBudget` en `src/modules/finance/shared/types/entities.ts:305` no
  incluye `categories`, `carriedOver` ni `effectiveLimit`.
- `budget-payloads.ts` sí sabe armar `categoryIds`, pero nadie le pasa más de
  una.

El propio CHANGELOG de web 1.14.0 lo reconoce: «el formulario actual manda una
categoría». Es el hueco de UI más grande entre back y web.

### A6. Rollover y recurrencia no hacen nada

`FinBudget.carriedOver` se lee y se mapea
(`src/modules/finance/planning/application/planning-mappers.ts:20`), pero no hay
cálculo que lo llene desde el periodo anterior en ningún punto del back. Tampoco
hay job que cree el periodo siguiente cuando `recurring = true`: solo se guardan
los campos (`planning.service.ts:83,136`).

La spec 07 (R5 y R6) pide que el rollover ajuste el límite efectivo y que el
scheduler cree el presupuesto recurrente. Hoy el usuario puede activar ambos y no
pasa nada; el límite efectivo siempre es `amountLimit`.

## Medio

### M1. Transferencias: falta `suggestGoalId` y el puente de compatibilidad con tarjeta

- La spec 02 (R8) pide devolver `suggestGoalId` cuando el destino es la cuenta de
  una meta. No existe en ningún archivo del back ni de la web.
- La spec 02 (R1) pide que `POST /transfers` con `toCardId` se redirija una
  versión a `CreateCardPaymentUseCase` con cabecera `Deprecation: true`. En su
  lugar, `transfers.controller.ts` (`assertAccountTarget`) responde 400
  `TRANSFER_TARGET_NOT_ACCOUNT` de inmediato. Eso rompe la app móvil en el
  cambio, sin periodo de gracia.

### M2. La comisión de transferencia no se ve ni cuenta en la web

El back excluye la pata `FEE` del listado agrupado: `SOURCE_TRANSFER_LEG`
(`packages/finance/src/ledger/infrastructure/logical-transaction-query.ts`)
exige `type: 'DEBIT'` y `legRole` nulo o `SOURCE`. La web no lee `legs` en
ningún componente, así que la comisión solo viaja dentro de la operación y nunca
se muestra.

Peor: `visibleTransactionTotals` en
`src/modules/finance/shared/lib/transactions-query.ts:154` excluye todo lo que
tenga `transferGroupId` (`isTransferTransaction`), así que la comisión tampoco
suma en los totales del mes, aunque la spec 02 (R5) la cuenta como gasto. El
back sí la incluye en analítica (`REAL_MOVEMENT` en `analytics.repository.ts`),
lo que crea otra inconsistencia: aparece en analítica pero no en el tablero.

### M3. Metas: «Desde otra cuenta» no existe y el selector de cuenta no se envía

La spec 05 (R3) pide que aportar desde otra cuenta cree antes una transferencia y
la enlace con `fromTransferGroupId`. En la web:

- `src/modules/finance/savings-goals/components/savings-goal-contribution-sheet.tsx`
  tiene un selector de cuenta, pero el payload
  (`buildSavingsGoalContributionBody`) solo manda `amount`, `kind`, `date` y
  `notes`: el `accountId` que el usuario elige se descarta.
- `fromTransferGroupId` no se usa en ningún archivo de web (la búsqueda no da
  resultados).

El back sí acepta `fromTransferGroupId` en el DTO de asignación.

### M4. `spendReducesProgress` nunca se usa

El campo existe en el esquema, en `FinanceSavingsGoal` de web y en los DTO, pero
no se lee en ninguna lógica: la búsqueda de `spendReducesProgress` no da
resultados fuera de tipos. La spec 05 (R4) dice que decide si un gasto enlazado
resta del progreso. Hoy el progreso siempre es la suma de asignaciones
(`savings-goal-progress.ts`), sin ese ajuste.

### M5. Cobros: el excedente no queda en el ledger y no se valida el destino

En `record-receivable-payment.use-case.ts`:

- La spec 06 (R1) dice registrar un `CREDIT` por el monto real recibido. El
  código solo registra `appliedAmount`; con `CREDIT_BALANCE` o
  `APPLY_TO_RECEIVABLE` el excedente no entra al ledger aunque el dinero se
  recibió.
- La spec 06 (R2, `EXTRA_INCOME`) pide dividir el `CREDIT` en dos patas con el
  mismo `transferGroupId`. El código crea **dos movimientos sueltos** con dos
  llamadas a `createTransaction`, sin `transferGroupId`, así que en el tablero
  aparecen como dos filas separadas.
- `APPLY_TO_RECEIVABLE` solo comprueba que el cobro destino exista; no valida que
  esté abierto, como pide la spec.
- `creditBalance` se acumula con `addReceivableCreditBalance` pero no hay ningún
  endpoint ni flujo para devolverlo o aplicarlo después.

### M6. Cortes: falta hoja de detalle, edición manual y selección de moneda

- `card-statements-section.tsx` pinta las filas, pero no abre ninguna hoja de
  detalle. No se muestran los movimientos del ciclo ni los pagos aplicados
  (`GET /cards/:id/statements/:statementId` existe en el back y no se usa).
- El back ofrece `PATCH /cards/:id/statements/:statementId` para mínimo, cierre y
  vencimiento; la web no tiene hook ni llamada (`useUpdateCardStatement` no
  aparece).
- `card-payment-sheet.tsx` fija `currency = currencies[0]`: no hay selector de
  moneda, así que una tarjeta bimoneda no puede elegir en qué moneda pagar
  (spec 03, R4).
- La lista `GET /cards/:id/statements` no usa cursor, aunque la spec 03 lo pide.

### M7. Préstamos: sin desglose de cuota ni campos de seguro y tasa en el formulario

- No existe `installment-detail-sheet.tsx`. El detalle del préstamo muestra
  capital e interés en una línea (`loan-detail-screen.tsx:317`) pero no el
  desglose completo (seguro, cargos, mora, pagado) ni el historial con enlace al
  movimiento que pide la spec 04.
- `loan-form.ts` y `loan-wizard.tsx` no tienen campos para `insuranceAmount` ni
  `rateType`. El tipo `FinanceLoan` de web ya los declara, pero no hay UI para
  fijarlos, así que se quedan en el valor por defecto del back (`FIXED`, sin
  seguro).

### M8. Préstamos: una cuota se puede marcar pagada sin movimiento

En `pay-next-loan-installment.use-case.ts` el movimiento se crea solo si hay
`accountId` (`command.accountId ?? loan.accountId`). Si el préstamo no tiene
cuenta y el body no la trae, la cuota pasa a `PAID` y el saldo baja, pero no sale
dinero de ninguna parte y no hay error. La spec 04 (R3) asume que el pago crea un
`DEBIT`.

### M9. Categorías del sistema de tarjeta sin sembrar

La spec 03 (R8) pide las categorías `Intereses`, `Comisiones` y
`Avance de efectivo` con `systemKind` (`INTEREST`, `FEE`, `CASH_ADVANCE`). Las
migraciones solo siembran «Comisiones bancarias» (sin `system_kind`),
«Pago de préstamo» (`LOAN_PAYMENT`) e «Ingreso extra» (`EXTRA_INCOME`). No existe
ninguna categoría con `INTEREST` ni `CASH_ADVANCE`.

### M10. Duplicados: back y agente sí, web casi nada

- La web nunca pide `possibleDuplicates=true`; `OPTIONAL_KEYS` en
  `transactions-query.ts` no lo incluye. No hay pantalla ni filtro de revisión.
- El badge «¿Duplicado?» solo aparece en el detalle
  (`transaction-detail-screen.tsx:270`). En la lista de movimientos no hay
  badge, aunque la spec 08 lo pide en la fila y en el detalle.
- `email-sync-display.ts` no traduce ni cuenta `SKIPPED_DUPLICATE`, así que
  `/finance/sync` no muestra el contador de duplicados evitados (spec 08).

### M11. Sin `STATEMENT_CLOSED` en el historial

`FinInstrumentEvent` se crea solo con `CREDIT_LIMIT_CHANGED`
(`catalog.repository.ts:384`). El scheduler de cortes
(`card-statements.scheduler.ts`) no registra `STATEMENT_CLOSED`, así que el
historial de tarjeta (`GET /cards/:id/history`) no incluye los cierres que la
spec 01 (R7) y 03 esperan.

### M12. La analítica y el tablero tratan distinto los reversos

La spec 01 (R5) pide verificar que el par original y reverso no cuente dos veces.
`analytics.repository.ts` filtra `status = 'CONFIRMED'`, lo que excluye el
original `REVERSED` pero sí incluye el `CREDIT` del reverso en los totales de
ingreso. En el tablero, `visibleTransactionTotals` también lo incluye. No hay
test que confirme el resultado con datos reales; queda como riesgo abierto de
doble conteo en ingresos.

### M13. Falta `record_receivable_payment` en las tools

Las tools nuevas de las fases 01 a 08 están casi completas
(`unconfirm_transaction`, `pay_card`, `get_card_statement`, `get_loan_schedule`,
`prepay_loan`, `allocate_to_goal`, `list_possible_duplicates`). La única tool
prometida que no existe es `record_receivable_payment` (spec 06). El facade
tampoco expone ese caso de uso, así que el agente no puede registrar cobros.

### M14. Tools que no exponen los campos nuevos

- `create_or_update_budget` acepta `categoryIds`, pero no `includeChildren`,
  `rollover` ni `recurring` (`tool-arg-schemas.ts:210`).
- `create_transfer` no acepta `fee` ni `rail` (spec 02 los agrega al DTO).
- `create_savings_goal` acepta `accountId` y `mode` (bien), pero
  `update_savings_goal` solo permite `name` y `targetAmount`: no se pueden
  cambiar cuenta, modo ni `spendReducesProgress`.
- `get_card_statement` solo acepta `cardId`; el detalle con `statementId` no se
  puede pedir.

### M15. Alias deprecado de aportes ausente

La spec 05 (API) mantiene `POST/GET/DELETE /savings-goals/:id/contributions`
como alias deprecado de `allocations`. El controlador solo expone `allocations`;
el alias no existe. Cualquier cliente viejo (app móvil) que use
`/contributions` recibe 404.

### M16. Sin cobertura e2e de las fases 03 a 09

`test/finance.e2e-spec.ts` no menciona `card-payments`, `prepayments`,
`allocations`, `write-off`, `possibleDuplicates`, `merge`, `not-duplicate`,
`unconfirm` ni `restore`. Solo hay una mención de `statements`. Sí hay tests
unitarios por caso de uso y de dominio, pero la spec pide un e2e por fase
(crear y listar agrupado, pagar y ver el corte, borrar y restaurar, etc.).

### M17. `finBudgetCategory` no está en el mock de Prisma

`test/helpers/prisma.mock.ts` no incluye `finBudgetCategory` (la búsqueda da 0
resultados). La spec 06 de reglas de PR advierte que hay que actualizar el mock
con cada modelo nuevo, y que ya falló una vez por eso. Ningún e2e crea
presupuestos, por eso no se ve aún; el primer test que use el modelo fallará.

## Bajo

### B1. `GET /cards/:id/statements/:statementId` puede mostrar pagos fuera de la ventana

`card-statements.service.ts` filtra los pagos con
`transactionDate > cycleEnd` sin tope superior. La spec 03 (R5) define la ventana
`(cycleEnd, dueDate]`; un pago posterior al vencimiento se muestra como aplicado
a ese corte.

### B2. Paginación del historial en memoria

`instrument-history.service.ts` carga todos los eventos y ajustes y pagina en
memoria. En una cuenta con años de historia, cada página lee todo.

### B3. Migraciones que mezclan esquema y datos

La spec 06 de reglas de PR pide que cada migración de datos vaya en su propia
migración, separada de la de esquema. Se cumple para el enum de `CARD_PAYMENT` y
`WRITTEN_OFF` (bien), pero no en `20261015140000_fin_transfer_legs` (DDL,
backfill de `leg_role` y siembra de categoría),
`20261015160100_fin_card_statement_status` (DDL y conversión a `CARD_PAYMENT`) ni
`20261015200000_fin_budget_categories` (DDL y backfill de categorías). El riesgo
de orden es bajo porque las migraciones que usan tipos nuevos van después de la
que los crea.

### B4. Falta el recálculo de `amountSpent` de presupuestos existentes

La spec 07 (migración, paso 3) pide recalcular `amountSpent` de los presupuestos
activos con subcategorías. No hay script para eso, así que el gasto histórico no
incluye subcategorías hasta que entre un movimiento nuevo.

### B5. Sin entrada de CHANGELOG para la fase 08 en back

El CHANGELOG de back llega a 1.15.0 (fase 07) y `package.json` sigue en 1.15.0,
aunque la rama tiene cuatro commits de fase 08. El de web sí documenta el badge
de duplicado en 1.15.0.

### B6. Una rama para todas las fases

La spec de reglas de PR pide «una fase = un PR a `develop`». La rama
`feat/finance-fase-08` contiene las nueve fases (22 commits) y `develop` sigue en
`3bec5a9` y `17d815e`. Dificulta revisar y revertir por fase.

### B7. `getStatementDetail` mezcla tipos de movimiento

El detalle del corte excluye `CARD_PAYMENT` pero incluye cualquier otro tipo
(`ADJUSTMENT`, por ejemplo) dentro del ciclo, sin filtrar por consumo.

### B8. `destinationPending` no se refleja en la web

El back guarda el estado `PENDING` de la pata destino
(`prisma-ledger.repository.ts:765`), pero la web no ofrece esa opción ni muestra
el estado de cada pata.

### B9. Los scripts de datos no tienen test de idempotencia

Los dos scripts de datos no tienen test, aunque la spec 04 y 05 lo piden
(el backfill es idempotente; el backfill repone el saldo y `amountSpent`
exactamente una vez).

### B10. Sin vista de «Eliminados recientes»

La spec 09 marca `GET /deletions` como opcional; el back expone
`GET /finance/recycle-bin` en su lugar. No es un problema, pero el nombre difiere
del contrato escrito.

## Lo que sí quedó alineado

Para no dejar la impresión de que todo está pendiente, estas piezas están
implementadas y con tests unitarios:

- Fase 01: reglas de edición por estado, campo `editable`, `unconfirm`,
  `includeAdjustments`, `GET /accounts|cards/:id/history`, exclusión de ajustes
  del listado.
- Fase 02: pata `legRole`, `rail`, comisión atómica, `PATCH/DELETE /transfers`,
  `unconfirm` y `confirm`, agrupación en `GET /transactions` y `accountsOnly` en
  el selector de destino.
- Fase 03: `CARD_PAYMENT`, estados de corte con mínimo estimado, pagos,
  `POST /card-payments` con validación de tipo y moneda, import reservado con 501.
- Fase 04: tabla francesa, distribución del pago en el orden de la spec, abonos
  con vista previa, `LOAN_HAS_OVERDUE`, categoría del sistema de pago de
  préstamo.
- Fase 05: `accountId` y `mode`, apartados sin movimiento,
  `EARMARK_EXCEEDS_BALANCE`, `earmarkedAmount` y `freeBalance` en cuentas.
- Fase 06: 422 `RECEIVABLE_EXCESS_UNRESOLVED` con `details`, `write-off`,
  categoría «Ingreso extra», UI de las tres opciones y «Castigar deuda».
- Fase 07: esquema y validación de `categoryIds` (409
  `CATEGORY_ALREADY_BUDGETED`), búsqueda de presupuesto por conjunto de
  categorías.
- Fase 08: huella de correo, idempotencia por referencia, `possibleDuplicateOfId`,
  `merge` y `not-duplicate`, tool `list_possible_duplicates`, badge en el
  detalle.
- Fase 09: retención de 30 días, `operationGroupId`, `sizeBytes`,
  `PARTIAL_OPERATION`, `ALREADY_RESTORED`, `RESTORE_CONFLICT`, aviso de snapshot
  grande en la web.

## Huecos de UI back a web (resumen)

| Capacidad de back                                                      | Web                                           | Referencia                               |
| ---------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------- |
| Presupuesto multicategoría, `includeChildren`, `rollover`, `recurring` | Formulario de una sola categoría              | `budget-form.ts`, `budget-sheet.tsx:364` |
| `GET /budgets/:id/transactions`                                        | Usa `useTransactions({ categoryId })`         | `budget-detail-screen.tsx:147`           |
| `suggestGoalId` en transferencias                                      | No existe la pregunta de contar como aporte   | sin archivo                              |
| Comisión de transferencia (`legs`)                                     | No se lee `legs`; no se muestra ni suma       | `transactions-query.ts:154`              |
| Aporte desde otra cuenta (`fromTransferGroupId`)                       | No existe; el `accountId` elegido se descarta | `savings-goal-contribution-sheet.tsx`    |
| `GET /cards/:id/statements/:statementId`                               | Sin hoja de detalle                           | `card-statements-section.tsx`            |
| `PATCH /cards/:id/statements/:statementId`                             | Sin hook ni llamada                           | sin archivo                              |
| Desglose de cuota e historial de préstamo                              | Solo capital e interés en una línea           | `loan-detail-screen.tsx:317`             |
| `insuranceAmount`, `rateType` en préstamos                             | Sin campos en formulario ni asistente         | `loan-form.ts`                           |
| `possibleDuplicates`, badge en fila, contador en sync                  | Solo badge en el detalle                      | `transaction-detail-screen.tsx:270`      |
| `STATEMENT_CLOSED` en historial                                        | El back no lo emite y la web no lo muestra    | `catalog.repository.ts:384`              |
| Monedas de la tarjeta al pagar                                         | Usa siempre `currencies[0]`                   | `card-payment-sheet.tsx:58`              |

## Orden sugerido de corrección

1. Scripts de datos A2, A3 y A1 (riesgo de corromper saldos o bloquear el
   deploy). Correr siempre `--dry-run` y respaldar antes.
2. Rollover y recurrencia A6, y `GET /budgets/:id/transactions` A4.
3. Presupuesto multicategoría en web A5 (chips, incluir subcategorías,
   rollover).
4. Comisión de transferencia M2 y apartados «Desde otra cuenta» M3.
5. Cortes M6 y cuotas de préstamo M7.
6. Cobros M5 y tools del agente M13 y M14.
7. Duplicados M10, `STATEMENT_CLOSED` M11 y el resto de medios.
8. Tests e2e M16, `finBudgetCategory` en el mock M17 y los bajos.
