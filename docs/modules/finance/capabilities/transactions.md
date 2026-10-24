# Capacidad: transacciones (UI)

Rutas: `/finance/transactions` (lista paginada), `/finance/transactions/new`, `/finance/transactions/[transactionId]`, `/finance/transactions/[transactionId]/edit`, `/finance/transfers/new` y `/finance/transfers/[transferId]/edit`.

GET paginado con filtros del DTO. Detalle GET `:id`. Create DEBIT/CREDIT, transfers `POST /transfers` (nunca `type: TRANSFER` en create), PATCH, confirm, reverse, DELETE. La edición de una transferencia usa `PATCH /transfers/:id`.

Copy “Completado” = `CONFIRMED`. La etiqueta del destino sigue al tipo: “Desde” en un gasto, “Destino” en un ingreso. Las acciones del detalle viven en el ⋮ (`RecordOptionsSheet`): "Editar movimiento" o "Editar transferencia" navega a `/edit`, y "Eliminar" confirma con `DeleteRecordDialog`.

Alta guiada (solo en crear): la categoría abre primero; al elegirla, el monto toma el foco con el modo guardado en `module_config.finance.amountEntry` (teclado o calculadora persistente); al confirmar el monto abre el selector de cuenta o tarjeta. En una transferencia el orden es origen, destino y monto.

Antes de guardar un gasto, `assessExpenseBalance` compara el monto con el saldo de la cuenta elegida. En efectivo, si quedaría negativo, se bloquea con el saldo disponible; en una cuenta bancaria, un `AlertDialog` muestra el saldo resultante y pide confirmación. Solo aplica a gastos en la misma moneda de la cuenta; la conversión la resuelve el back.

Si la categoría tiene un presupuesto vigente en la fecha del movimiento y el gasto supera lo disponible, `budgetOverageForExpense` calcula el exceso y un `AlertDialog` pide confirmación antes de guardar. Cancelar conserva el formulario; registrar igual continúa. Solo compara importes en la moneda base, que es la de los presupuestos.

Las fechas se muestran con la abreviatura corta en español de la app (`18 sep 2026`), no con la forma del ICU (`sept`) ni en ISO. El detalle muestra el comercio tal como se escribió, aunque exista un nombre canónico. La URL del formulario de alta refleja el tipo elegido (`?type=DEBIT|CREDIT`).

La hora de un movimiento se lee en la zona horaria del perfil, también si el navegador está en otra zona: la lista, el detalle y el formulario muestran la misma hora del día y el mismo día local cerca de la medianoche (`toUserWallClock` sobre el instante que guarda el API).

La lista de Movimientos suma a cada mes una sección **Programados** con la próxima cuota de cada préstamo y los cobros futuros de las suscripciones. Son avisos: no cambian los saldos ni los totales del mes, y desaparecen cuando el pago registra la siguiente fecha. Una suscripción sin método de pago se distingue en la fila.

Un movimiento `REVERSED` lleva la etiqueta “Revertido” en la lista y el detalle, sin sumar a los totales; si tiene un movimiento vinculado, el detalle enlaza al original.

El detalle muestra `planningLink` y permite vincular el movimiento a una cuota de préstamo, un cobro o una meta (`POST/DELETE /transactions/:id/link`). Vincular no crea un movimiento nuevo y quitar el vínculo revierte el efecto.

Evidencia: `src/modules/finance/transactions/`, `src/modules/finance/shared/hooks/use-transactions.ts`, `src/modules/finance/shared/lib/ledger-form.ts` + specs.
