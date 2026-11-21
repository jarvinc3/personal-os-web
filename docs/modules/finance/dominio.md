# Finanzas: cómo funciona hoy

Este documento resume el dominio y los flujos principales tal como están implementados. El contrato HTTP completo vive en `personal-os-back/docs/modules/finance/`. Los specs de los pendientes 01–18 y 18.1, ya implementados, quedan en [docs/archive/pendientes/](../../archive/pendientes/README.md).

El dinero se suma, resta y convierte con decimales exactos: `Prisma.Decimal` en el back (`shared/domain/money.ts`) y `decimal.js-light` en la web (`shared/lib/decimal.ts`). El redondeo es `ROUND_HALF_EVEN` a 2 decimales y ocurre solo al presentar o persistir. La API sigue serializando money como string (ADR-002); `Number` queda solo para escalas de gráfico y porcentajes.

Contexto: bancos dominicanos (BHD, Popular, Qik), moneda principal DOP (RD$).

## Modelo

| Entidad                               | Qué es                                   | Reglas clave                                                                                                                               |
| ------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Institución                           | Banco o entidad emisora                  | Borrarla da 409 si tiene dependientes (`details.dependents`). La de sistema "Efectivo" (`isSystem`) no se edita, archiva ni borra          |
| Cuenta                                | CHECKING, SAVINGS, INVESTMENT o CASH     | Todas exigen institución. Las de efectivo viven en la institución de sistema, una por moneda. Se archiva con `isActive:false`, no se borra |
| Tarjeta                               | Crédito o débito                         | La de crédito tiene límite, disponible, día de corte y de pago. La de débito suma a su cuenta                                              |
| Movimiento (`FinTransaction`)         | CREDIT, DEBIT, ADJUSTMENT, CARD_PAYMENT  | Estados `PENDING`, `CONFIRMED`, `REVERSED`, `CANCELLED`                                                                                    |
| Transferencia                         | Dos patas con el mismo `transferGroupId` | Atómica. El destino es solo una cuenta. Comisión opcional (`legs`). La lista muestra una sola fila                                         |
| Corte de tarjeta (`FinCardStatement`) | Ciclo de facturación                     | Abierto, `STATEMENT_CLOSED`, pagado o vencido. Se carga a mano o se importa del PDF del banco                                              |
| Préstamo                              | Capital, tasa, plazo y cuotas            | La cuota resta solo capital del saldo. Admite abonos a capital (reducir plazo o cuota)                                                     |
| Cobro (cuenta por cobrar)             | Dinero que te deben                      | Pagos parciales, excedente (`excessHandling`) y castigo (write-off)                                                                        |
| Meta de ahorro                        | Objetivo ligado a una cuenta             | Los aportes no crean `DEBIT`. Expone `freeBalance` (disponible libre de la cuenta)                                                         |
| Presupuesto                           | Límite por periodo                       | Multicategoría, rollover y recurrencia (scheduler). El periodo arranca el `monthStartDay`                                                  |
| Correo de banco (`FinEmailMessage`)   | Correo leído de Gmail                    | Idempotente por huella (`source_id, fingerprint`)                                                                                          |

## Estados y edición

- Un movimiento `CONFIRMED` está bloqueado (`TRANSACTION_LOCKED`). Para editarlo se usa "Desbloquear" (`unconfirm`), que existe en movimientos, transferencias y pagos de tarjeta.
- Una reversa queda `REVERSED`, enlazada a su original por `linkedTransactionId`. La lista muestra una sola fila por par, en la fecha del original, con la insignia "Revertido" y ambas patas (original y reversa) al desplegarla. Una reversa parcial (monto distinto) deja dos filas con la insignia "Reversa parcial". El par no suma en los totales y el detalle enlaza al otro movimiento.
- Los ajustes de saldo (`POST /balance-adjustments`, tipo `ADJUSTMENT`) quedan fuera del tablero (`includeAdjustments=false` por defecto) y se ven en el historial de la entidad (`instrument-history-sheet.tsx`).
- Borrar guarda un snapshot en el diario: el toast "Deshacer" llama a `POST <entidad>/:id/restore`, y `/finance/recycle-bin` lista archivados y eliminados.

## Flujos principales

### Registrar un movimiento (flujo guiado)

Categoría → monto → cuenta o tarjeta. El monto abre con teclado o calculadora según la preferencia `amountEntry` de la configuración, y la cuenta propuesta es `defaultAccountId`. La transferencia sigue el mismo patrón (`transfer-form.tsx`) y puede sugerir una meta de la cuenta destino (`suggestGoalId`).

### Vincular un movimiento

Desde el detalle del movimiento, "Vincular" (`link-transaction-sheet.tsx`) lo asocia a una cuota de préstamo, un cobro o un aporte a meta: `POST /finance/transactions/:id/link`. El agente tiene la tool `link_transaction`.

### Efectivo

Cada usuario tiene una institución de sistema "Efectivo" (`type: cash`, `isSystem`) con una cuenta por moneda; se crea sola (alta de usuario, listado o migración `20261021110000_fin_cash_institution`) y no se edita, archiva ni borra. Productos la muestra como una tarjeta con icono de efectivo y el total convertido a la moneda base (`cash.totalBase`); si falta una tasa, marca "Balance incompleto" y el detalle sigue mostrando cada moneda sin convertir. Al abrirla: el bloque Saldo del header lista cada moneda sin un contenedor aparte, el menú ⋮ solo ofrece **Nueva cuenta** (sin editar, archivar ni borrar la institución) y las pestañas son **Cuentas** y **Préstamos**. La pestaña Préstamos es solo lectura: muestra los préstamos sin institución bancaria (`institutionId: null`) y deja de listar uno en cuanto se liga a un banco. La cuenta de la moneda base no se borra (se desactiva) y solo se sugiere el nombre "Efectivo <moneda>" al introducir una moneda que aún no tiene cuenta. Mover dinero entre cuentas de efectivo es una transferencia normal.

### Tarjetas de crédito

- Pago de tarjeta: `CARD_PAYMENT` desde una cuenta (`card-payment-sheet.tsx`).
- Crédito disponible por moneda: el back expone `availableCredit` en la respuesta de la tarjeta (`balance` confirmado menos los movimientos `PENDING`) y la web lo muestra en el hero y la barra de uso del detalle y en Productos. Sin límite no hay disponible.
- Corte automático: el job diario cierra los ciclos vencidos y crea un estado por moneda, con saldo al corte, mínimo y fecha límite. El corte manual (`card-statement-sheet.tsx`) queda como respaldo para cargar los datos del banco.
- Próximo corte y pago: la tarjeta trae `nextStatementDate` y `nextPaymentDueDate`, y el detalle muestra la cuenta regresiva.
- Recordatorio de pago: `CardPaymentRemindersScheduler` emite `finance.card_payment.due` `reminders.cardDueDaysBefore` días antes (default 3), una sola vez por corte y sin enviarlo si ya está pagado.
- El correo de BHD "tu estado de cuenta está disponible" genera un recordatorio (`FINANCE_CARD_STATEMENT_REMINDER`), pero no importa movimientos.

### Importar un estado de cuenta

Manual, desde el detalle de la tarjeta o de la cuenta bancaria ("Importar estado de cuenta", PDF de hasta 10 MB).

1. La web sube el PDF (`POST /finance/cards/:id/statements/import` o `POST /finance/accounts/:id/statements/import`, multipart `file` y `password?`). Si el PDF tiene clave, se pide y no se guarda.
2. El back extrae el texto con pdf.js y un extractor LLM devuelve periodo, saldos, mínimo, fecha límite y movimientos. Si BullMQ está activo, el parseo va a la cola `statement-import`; si no, corre en la misma petición. La web consulta el estado hasta que queda `READY`.
3. La cabecera (periodo, saldos, mínimo y fecha límite) vive en el JSON del import; no hay tabla nueva. Para una cuenta bancaria es la única cabecera.
4. Conciliación (`/finance/statement-imports/[importId]`) con tres grupos: **Coinciden** (misma referencia, o monto y moneda con ±3 días y texto parecido), **Faltan en la app** (se crean al aplicar) y **Sobran en la app** (registrados en el ciclo y ausentes del PDF). Cada línea se puede marcar o ignorar.
5. Al aplicar (`POST /finance/statement-imports/:id/apply`): se crean los movimientos marcados, se cierra el corte de la tarjeta con los datos del PDF y, si el usuario lo pide, se crea un ajuste por la diferencia exacta. Es idempotente. `DELETE` descarta el import.

El estado de cuenta no llega por correo: los bancos no lo envían y la subida es siempre manual. Errores: `STATEMENT_PASSWORD_REQUIRED`, `STATEMENT_PARSE_FAILED`, `STATEMENT_ALREADY_APPLIED`.

### Conciliar una cuenta o tarjeta

A fin de mes el saldo de la app casi nunca coincide con el banco (impuestos, comisiones, cargos por plástico, intereses). En el detalle de la cuenta o la tarjeta de crédito, "Conciliar" abre el sheet. Las tarjetas de débito se concilian desde su cuenta enlazada, que es donde vive el saldo:

1. El usuario escribe el saldo real que ve en la app del banco y la fecha de corte (hoy por defecto). La web muestra la diferencia en vivo contra el saldo de la app.
2. `POST /finance/reconciliations/preview` propone el 0.15 % de las salidas del mes como impuesto DGII y el resto como otro cargo; la web precarga esas líneas.
3. El usuario ajusta las líneas (tipo y monto). Deben sumar exactamente la diferencia: si no, el botón queda bloqueado y la API responde 422.
4. `POST /finance/reconciliations` crea el cierre y un movimiento de ajuste por línea. Los ajustes mueven el saldo pero no aparecen en el tablero ni en presupuestos.
5. El historial de "Conciliaciones" vive en el detalle; el producto aparece como conciliado o pendiente del mes en Productos. En Productos, debajo de ese indicador, la tarjeta "Cargos bancarios" suma los ajustes por mes, banco y tipo.
6. Borrar el último cierre lo revierte (toast "Deshacer" y papelera); restaurarlo no duplica el efecto.

### Integridad interna de saldos (invariante I1)

El saldo guardado de cada cuenta y tarjeta debe ser siempre la suma de sus movimientos confirmados. No es una conciliación contra el banco: es la app comprobando que no se contradice a sí misma.

1. `GET /finance/integrity/check` compara el saldo guardado con el recalculado desde el inicio (saldo inicial cero más los movimientos `CONFIRMED`; pendientes y revertidos no cuentan) y registra cada desviación abierta en `fin_balance_drifts`. Con `?accountId=` o `?cardId=` se limita a un producto.
2. `POST /finance/integrity/recalculate` corrige el saldo guardado a la suma de los movimientos y cierra la desviación. No crea movimientos; el recálculo va en la misma transacción que la corrección.
3. Un job nocturno (`BalanceIntegrityScheduler`) recorre los productos de cada usuario y emite `FINANCE_BALANCE_DRIFT_DETECTED` por desviación nueva o cambiada. La notificación se controla con `notifications.balanceIntegrity`.
4. En la web, el detalle de cuenta o tarjeta de crédito (las de débito usan su cuenta) muestra un banner con saldo guardado, esperado y diferencia, más "Recalcular" con confirmación. Productos lista las desviaciones abiertas y Ajustes → Finanzas tiene "Verificar ahora". Esa sección solo consulta con la app activa; desactivada, muestra el aviso para activarla.

La diferencia con el banco sigue siendo cosa de la conciliación ([09](../../archive/pendientes/09-conciliacion-ajustes.md)); una desviación de I1 se recalcula, no se concilia.

### Préstamos

Asistente de alta con tabla de amortización previa (`amortization-plan.ts`, `amortization-sheet.tsx`). En el detalle: pagar la siguiente cuota con su desglose (capital, interés, seguro: `insurance_amount`), hoja de cuota (`installment-detail-sheet.tsx`) y abono a capital con vista previa (`loans/:id/prepayments/preview`).

### Ingesta de correo de bancos

1. El usuario conecta Gmail (OAuth, `gmail.readonly`) en `/finance/sync` y vincula cada remitente a una institución. Al volver del OAuth, el sheet `oauth-gmail-result` ofrece un paso de sincronización: enciende lo automático (`emailSync.automatic`), elige el horario (chips: cada 15 min, cada hora, cada 6 h u horas fijas con pasos de 5 min), el modo de importación (`DIRECT` o `PENDING`) y, si ya hay instituciones ligadas, "Sincronizar ahora". Se guarda con la misma configuración de módulo y se refleja en Ajustes → Finanzas. Si `emailSync.automatic` ya estaba encendido, el paso muestra el resumen con "Cambiar".
2. `gmail-auto-sync.scheduler.ts` corre según `emailSync.schedule` (intervalo mínimo de 15 min u horas fijas) si `emailSync.automatic` está activo. También hay sincronización manual.
3. Un extractor LLM convierte cada correo en movimiento. Dedupe: huella única, referencia, confirmación repetida y reversa existente. Los posibles duplicados se resuelven con "Unir" o "No es duplicado".
4. `emailSync.mode`: `DIRECT` confirma lo importado; `PENDING` lo deja por confirmar.
5. Sin cuenta o tarjeta destino, o sin monto, el correo queda en pendientes. Tools: `list_pending_emails`, `assign_pending_email`, `retry_pending_email` y `complete_pending_email_amount`.
6. Nómina de Popular (depósito a la cuenta 3447): se reconoce aunque el correo no traiga monto. Se propone el monto de `fixedIncome`.

Los correos de ejemplo por banco están en `personal-os-back/packages/finance/test/fixtures/bank-emails/{bhd,popular,qik}/`.

### Configuración del módulo (Ajustes → Finanzas)

`finance-module-settings-form.tsx`, tipos en `src/modules/settings/types/module-config.types.ts`:

| Clave                         | Uso                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| `amountEntry`                 | Teclado o calculadora al abrir un monto                                                                   |
| `fixedIncome`                 | Sueldo: monto, `BIWEEKLY`/`MONTHLY`, días de pago y cuenta. Se usa como sugerencia en la nómina sin monto |
| `defaultAccountId`            | Cuenta propuesta en gastos y transferencias                                                               |
| `monthStartDay`               | Día 1-28 en que arranca el mes financiero (presupuestos y totales)                                        |
| `reminders.cardDueDaysBefore` | Aviso antes del vencimiento de tarjeta                                                                    |
| `notifications.*`             | Alertas de presupuesto, movimiento detectado, reporte mensual, etc.                                       |
| `emailSync.*`                 | `enabled`, `automatic`, `autoCategorize`, `mode` y `schedule`                                             |

## Agente de IA

> **Histórico.** El chat, sus bloques y el contexto de entidad se retiraron de la web en AI-0. Las tools y los contratos del back siguen vigentes y se conservan como referencia para AI-9.

36 tools de finanzas, filtradas por `moduleSlug`. El chat usaba SSE con `clientMessageId` idempotente. Los bloques del chat retirado (`ChatBlock`) eran `markdown`, `action`, `transaction_card`, `transaction_list`, `budget_progress`, `loan_summary` y `chart`; la web los renderizaba en `src/modules/ai/components/blocks/` (`chart` con barras, dona y línea en `chat-chart.tsx`). Tools de comercios, recurrentes y suscripciones: `list_merchants`, `list_subscriptions` (recurrentes detectados y suscripciones gestionadas), `confirm_recurring`, `create_subscription` y `confirm_subscription_payment`. Las tools que escriben piden confirmación con la tarjeta de acción.

El agente recibía además `context` (`ChatContext`: `moduleSlug`, `screen?`, `entityRef?: { type, id }`). Cada detalle de Finanzas registraba su entidad con `useRegisterChatContext` y el botón del header abría `/chat` con `entityType`, `entityId`, `entityLabel` y `screen` en la URL. Ese contexto se retiró con el chat; los contratos del back se conservan como referencia para AI-9.

Cubren el contexto: movimiento (y transferencia en el mismo detalle), cuenta, tarjeta, institución, préstamo, cuota (hoja), cobro, meta de ahorro, presupuesto y corte de tarjeta (hoja). `email_message` no tiene pantalla propia y no registra chip.

## Paginación

Usan cursor `{items, nextCursor, hasMore}`: transacciones, presupuestos, movimientos de un presupuesto, cortes de tarjeta, historial de instrumento, cuotas de préstamo, cobros de un cobro, aportes de una meta, correos pendientes y procesados, eliminados de la papelera y notificaciones. Todas las listas que crecen usan `useInfiniteFinanceList` + `InfiniteListSentinel`, que carga al hacer scroll y deja un botón "Cargar más" como respaldo.

Siguen devolviendo arrays los catálogos chicos (cuentas, tarjetas, instituciones, categorías, monedas), los listados de metas, préstamos y cobros, y la proyección completa de cuotas (`/loans/:id/schedule`).

`/finance/recycle-bin` devuelve `{ archived, items, nextCursor, hasMore }`: los archivados van completos y los eliminados paginan por fecha.

Las líneas de un import de estado de cuenta se devuelven completas: un PDF trae decenas de filas, no miles.
