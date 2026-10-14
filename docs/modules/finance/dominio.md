# Finanzas: cómo funciona hoy

Estado al 14 oct 2026: web v0.23.0 y back v0.21.0. Este documento resume el dominio y los flujos principales tal como están implementados. El contrato HTTP completo vive en `personal-os-back/docs/modules/finance/`. Lo pendiente está en [pendientes/](./pendientes/README.md).

Contexto: bancos dominicanos (BHD, Popular, Qik), moneda principal DOP (RD$).

## Modelo

| Entidad                               | Qué es                                   | Reglas clave                                                                                       |
| ------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Institución                           | Banco o entidad emisora                  | Borrarla da 409 si tiene dependientes (`details.dependents`)                                       |
| Cuenta                                | CHECKING, SAVINGS, INVESTMENT o CASH     | Las bancarias exigen institución; CASH no. Se archiva con `isActive:false`, no se borra            |
| Tarjeta                               | Crédito o débito                         | La de crédito tiene límite, disponible, día de corte y de pago. La de débito suma a su cuenta      |
| Movimiento (`FinTransaction`)         | CREDIT, DEBIT, ADJUSTMENT, CARD_PAYMENT  | Estados `PENDING`, `CONFIRMED`, `REVERSED`, `CANCELLED`                                            |
| Transferencia                         | Dos patas con el mismo `transferGroupId` | Atómica. El destino es solo una cuenta. Comisión opcional (`legs`). La lista muestra una sola fila |
| Corte de tarjeta (`FinCardStatement`) | Ciclo de facturación                     | Abierto, `STATEMENT_CLOSED`, pagado o vencido. Se carga a mano o se importa del PDF del banco      |
| Préstamo                              | Capital, tasa, plazo y cuotas            | La cuota resta solo capital del saldo. Admite abonos a capital (reducir plazo o cuota)             |
| Cobro (cuenta por cobrar)             | Dinero que te deben                      | Pagos parciales, excedente (`excessHandling`) y castigo (write-off)                                |
| Meta de ahorro                        | Objetivo ligado a una cuenta             | Los aportes no crean `DEBIT`. Expone `freeBalance` (disponible libre de la cuenta)                 |
| Presupuesto                           | Límite por periodo                       | Multicategoría, rollover y recurrencia (scheduler). El periodo arranca el `monthStartDay`          |
| Correo de banco (`FinEmailMessage`)   | Correo leído de Gmail                    | Idempotente por huella (`source_id, fingerprint`)                                                  |

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

### Tarjetas de crédito

- Pago de tarjeta: `CARD_PAYMENT` desde una cuenta (`card-payment-sheet.tsx`).
- Corte manual: el usuario baja el estado de cuenta desde la app del banco y carga balance al corte, mínimo y fecha límite en `card-statement-sheet.tsx`. El scheduler cierra los ciclos vencidos.
- El correo de BHD "tu estado de cuenta está disponible" genera un recordatorio (`FINANCE_CARD_STATEMENT_REMINDER`), pero no importa movimientos.

### Importar un estado de cuenta

Manual, desde el detalle de la tarjeta o de la cuenta bancaria ("Importar estado de cuenta", PDF de hasta 10 MB).

1. La web sube el PDF (`POST /finance/cards/:id/statements/import` o `POST /finance/accounts/:id/statements/import`, multipart `file` y `password?`). Si el PDF tiene clave, se pide y no se guarda.
2. El back extrae el texto con pdf.js y un extractor LLM devuelve periodo, saldos, mínimo, fecha límite y movimientos. Si BullMQ está activo, el parseo va a la cola `statement-import`; si no, corre en la misma petición. La web consulta el estado hasta que queda `READY`.
3. La cabecera (periodo, saldos, mínimo y fecha límite) vive en el JSON del import; no hay tabla nueva. Para una cuenta bancaria es la única cabecera.
4. Conciliación (`/finance/statement-imports/[importId]`) con tres grupos: **Coinciden** (misma referencia, o monto y moneda con ±3 días y texto parecido), **Faltan en la app** (se crean al aplicar) y **Sobran en la app** (registrados en el ciclo y ausentes del PDF). Cada línea se puede marcar o ignorar.
5. Al aplicar (`POST /finance/statement-imports/:id/apply`): se crean los movimientos marcados, se cierra el corte de la tarjeta con los datos del PDF y, si el usuario lo pide, se crea un ajuste por la diferencia exacta. Es idempotente. `DELETE` descarta el import.

El estado de cuenta no llega por correo: los bancos no lo envían y la subida es siempre manual. Errores: `STATEMENT_PASSWORD_REQUIRED`, `STATEMENT_PARSE_FAILED`, `STATEMENT_ALREADY_APPLIED`.

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

36 tools de finanzas, filtradas por `moduleSlug`. El chat usa SSE con `clientMessageId` idempotente. Los bloques del chat son solo `markdown` y `action` (`ChatBlock` en `ai-agent/src/shared/ai.types.ts`). Las tools que escriben piden confirmación con la tarjeta de acción.

## Paginación

Usan cursor `{items, nextCursor, hasMore}`: transacciones, presupuestos, historial de instrumento y notificaciones. El resto devuelve arrays (ver [pendientes/04](./pendientes/04-paginacion-uniforme.md)).

Las líneas de un import de estado de cuenta se devuelven completas: un PDF trae decenas de filas, no miles.
