# CONTEXT.md — glosario del dominio (web)

Vocabulario del dominio del cliente web de Personal OS. El código es la fuente. Cada entrada define qué es una cosa, en una o dos frases, con los sinónimos rechazados bajo `_Avoid_`. Infraestructura, tooling y utilidades no entran.

Los términos marcados como **en conflicto** todavía no tienen un significado acordado; ver [Conflictos abiertos](#conflictos-abiertos).

## Producto

**Módulo de producto**
Una de las áreas registradas en `MODULE_REGISTRY`: `finance`, `agenda`, `projects`, `subscriptions` y `health`. Solo `finance` tiene rutas de app hoy; agenda, projects, subscriptions y health viven como hojas en Ajustes. _Avoid_: llamar "módulo" a una carpeta de `src/modules/`, a Keep Awake, Home, Landing, Settings, Notifications o AI.

**Módulo activo / apagado**
Un módulo de producto con `isEnabled` en `UserModuleEntry`. Un módulo apagado no llama su API; muestra un CTA a Ajustes.

**Configuración de módulo**
Ajustes propios de un módulo de producto (`ModuleConfig`), versionados y guardados por usuario. `fieldGuide` es el texto de ayuda de una opción.

## Identidad

**Usuario** (`User`)
La persona dueña de la cuenta. Su perfil (`UserProfile`, `GET /users/me`) guarda nombre, avatar, zona horaria, idioma y preferencias. _Avoid_: "cuenta" para el usuario.

**Sesión de autenticación** (`AuthSession`)
El estado de acceso del usuario: usuario + token. Su proveedor hoy es `supabase`. _Avoid_: "sesión" a secas; chat y Keep Awake tienen su propia sesión.

**Preferencias** (`UserPreferences`)
Ajustes globales del usuario, no de un módulo: tema, onboarding, tono de IA, canales de notificación y privacidad.

## Dinero

**Money**
Un monto con su moneda. En lecturas del API viaja como string decimal; en escrituras, como number. Ver [ADR-002](./docs/decisions/ADR-002-money-strings.md).

**Moneda base** (`baseCurrency`)
La moneda con la que se reportan totales y balance sheet. **Monedas seguidas** (`trackedCurrencies`) son las que el módulo muestra además de la base.

**Ledger**
El registro de movimientos y los saldos que produce. `ledgerAmount` y `ledgerCurrency` son el monto en la moneda de la cuenta o tarjeta tras convertir; `amountBaseCurrency` es el mismo monto en moneda base.

**Movimiento** (`Transaction`, `FinanceTransaction`)
Un asiento del ledger. Su tipo es `DEBIT` (gasto), `CREDIT` (ingreso), `TRANSFER` (una pata de transferencia) o `ADJUSTMENT` (ajuste de saldo). _Avoid_: "transacción" para una transacción de base de datos.

**Estado del movimiento** (`FinanceTransactionStatus`)
`PENDING`, `CONFIRMED`, `DECLINED`, `CANCELLED` o `REVERSED`. La UI muestra `CONFIRMED` como "Completado"; no existe un estado `COMPLETED`.

**Transferencia**
Un movimiento de dos patas con el mismo `transferGroupId`: una de débito en la cuenta de origen y una de crédito en la de destino. No se crea con `type: TRANSFER` en el alta de movimientos.

**Ajuste de saldo** (`ADJUSTMENT`)
Un movimiento que corrige el saldo de una cuenta. No es gasto ni ingreso y no lleva categoría.

**Balance sheet** (`FinanceBalanceSheet`)
Los activos y pasivos a una fecha, en moneda base: activos = cuentas; pasivos = deudas de tarjetas + préstamos. **Patrimonio neto** (`netWorth`) es activos menos pasivos; falta (`INCOMPLETE`) si una tarjeta no tiene límite. **Cash flow** es ingresos menos gastos del periodo.

## Catálogo

**Institución** (`Institution`)
El banco, cooperativa, billetera, casa de bolsa o efectivo donde vive el dinero. Tipos: `bank`, `credit_union`, `digital_wallet`, `broker`, `cash`, `other`.

**Cuenta** (`Account`)
Un saldo de dinero, en una institución o en efectivo. Tipos: `CHECKING`, `SAVINGS`, `CASH`, `INVESTMENT`. _Avoid_: "cuenta" para el usuario.

**Tarjeta** (`Card`)
Un instrumento de pago ligado a una institución, de tipo `CREDIT` o `DEBIT`, con una o varias redes (`VISA`, `MASTERCARD`, `AMEX`, `DISCOVER`, `OTHER`). Lleva un balance por moneda.

**Estado de cuenta** (`CardStatement`)
El ciclo cerrado de una tarjeta de crédito: `cycleStart`, `cycleEnd`, `dueDate`, `closingBalance`, `amountPaid`, `remaining` y estado `PENDING`, `PARTIAL` o `PAID`. El ciclo en curso se proyecta en el cliente y no tiene cifras.

**Categoría** (`Category`)
La clasificación de un movimiento, de tipo `EXPENSE` o `INCOME`, con jerarquía por `parentId`. Una categoría `isSystem` la define el sistema y no se borra.

**Archivar / Eliminar**
Archivar desactiva (`isActive: false`) institución, cuenta, tarjeta o préstamo y conserva el historial. Eliminar manda el registro a la papelera de reciclaje (`recycle bin`) con restauración temporal. Los cobros no se eliminan: pasan a `CANCELLED`. _Avoid_: usar uno por el otro.

## Planificación

**Presupuesto** (`Budget`)
Un tope de gasto de una categoría en un periodo (`MONTHLY`, `BIWEEKLY`, `CUSTOM`), con `amountLimit`, `amountSpent` y `alertThresholdPct`.

**Meta de ahorro** (`SavingsGoal`)
Un objetivo de dinero con `targetAmount`, `currentAmount` y fecha opcional. **Aporte** (`Contribution`) es cada monto apartado para la meta; se liga a una cuenta y a un movimiento, y su borrado lo revierte.

**Préstamo** (`Loan`)
Dinero que el usuario debe: `originalAmount`, `currentBalance`, `installmentAmount`, `installmentFreq` (`WEEKLY`, `BIWEEKLY`, `MONTHLY`), `totalInstallments`, `paidInstallments` e `interestRate` como fracción 0–1. **Cuota** (`Installment`) es cada pago programado.

**Cobro** (`Receivable`)
Dinero que le deben al usuario: `debtorName`, `amount`, `paidAmount` y estado `PENDING`, `PARTIAL`, `PAID` o `CANCELLED`. Un préstamo es una deuda del usuario; un cobro es un crédito a su favor.

## Correo

**Buzón** (`Mailbox`)
Una cuenta de Gmail conectada por OAuth para importar correos bancarios.

**Fuente de correo** (`EmailSource`)
El vínculo entre un buzón y una institución, con el remitente del banco (`bankSenderEmail`). Es único por institución.

**Instrumento**
La cuenta o tarjeta a la que se refiere un correo bancario.

**Mensaje pendiente** (`PendingEmailMessage`)
Un correo ya leído por el extractor que espera asignarse a un movimiento. `instrumentHint`, `lastFourHint` y `accountNumberHint` apuntan al instrumento del correo.

## Otros módulos

**Notificación** (`Notification`)
Un aviso al usuario por canal `IN_APP`, `PUSH` o `EMAIL`, leído o pendiente.

**Sesión de chat** (`AiSession`)
Una conversación con el agente, con contexto de módulo (`moduleSlug`) y un hilo de mensajes.

**Acción de IA** (`Action`)
Una operación que el agente propone y que el usuario confirma (o cancela) antes de ejecutar.

**Sesión de Keep Awake** (`KeepAwakeSessionState`)
El estado de mantener la pantalla despierta, solo en cliente. No es un módulo de producto y no toca el backend. **Fase** (`KeepAwakePhase`) es su estado: `idle`, `activating`, `active`, `pausing`, `paused`, `ending` o `interrupted`.

## Conflictos abiertos

Términos con más de un significado en el código, sin uso dominante. Cada uno necesita una decisión humana.

| Término            | Significados en el código                                                                                                                                                                                                                                                          | Decisión pendiente                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `balance`          | Saldo contable de una cuenta (`FinanceAccount.balance`); crédito **disponible** en la tarjeta (`FinanceCardBalance.balance`, doc `capabilities/dashboard.md`); deuda pendiente del préstamo (`FinanceLoan.currentBalance`); deuda al corte (`CardStatement.closingBalance`).        | Si `FinanceCardBalance.balance` pasa a `availableCredit` y `FinanceLoan.currentBalance` a `outstandingPrincipal`. |
| `cuenta` / `account` | Cuenta del usuario (login, `edit-account-form`, `use-delete-account`) y cuenta financiera (`FinanceAccount`).                                                                                                                                                                       | Cuál es el término canónico para cada uno.                                                              |
| `módulo` / `module`  | Slug de `MODULE_REGISTRY` (5); carpeta de feature en `src/modules/` (8 áreas); módulo de chat (`ModuleChatSlug`, incluye `general`).                                                                                                                                                | Cuál es el término canónico para cada uno.                                                              |
| `sesión` / `session` | Autenticación (`AuthSession`); chat (`AiSession`); Keep Awake (`KeepAwakeSessionState`).                                                                                                                                                                                           | Si cada uso se califica siempre.                                                                        |
| `provider`         | Autenticación (`AuthProvider` = `supabase`); modelo de IA (`AiProviderInfo`, `defaultProvider`); correo (`FinanceEmailSource.provider`).                                                                                                                                           | Si cada uso se califica siempre.                                                                        |
