# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y [SemVer](https://semver.org/lang/es/). Reglas y ejemplo en [docs/reference/changelog-guide.md](./docs/reference/changelog-guide.md).

## [1.8.0] - 2026-10-12

### Cambiado

- Movimientos lee las transferencias como una operación agrupada (`groupOperations`), con todas sus patas.
- Se mapean los códigos nuevos del back: `TRANSFER_LOCKED`, `SAME_ACCOUNT`, `ACCOUNT_NOT_FOUND` y `TRANSFER_TARGET_NOT_ACCOUNT`.

## [1.7.0] - 2026-10-12

### Agregado

- Comisión opcional y carril (ACH, LBTR, mismo banco) al crear o editar una transferencia.
- El destino de una transferencia es solo una cuenta; el pago de tarjeta sale a su propia acción.
- "Marcar como pendiente" en una transferencia completada, para editarla.

## [1.6.0] - 2026-10-12

### Agregado

- Editar un movimiento completado sin tocar el monto: solo categoría, comercio, descripción y notas. La opción "Marcar como pendiente" lo desbloquea para editar todo.
- Historial de cuenta y tarjeta, con ajustes de saldo y cambios de límite, en una hoja desde el menú de opciones.

### Cambiado

- Los movimientos revertidos, cancelados o rechazados se ven atenuados, con el monto tachado, y no suman en los totales del día ni del mes.

## [1.5.0] - 2026-10-12

### Agregado

- Papelera de reciclaje (`/finance/recycle-bin`), con dos pestañas (archivados y eliminados) y restaurar por registro. Se entra desde la fila "Papelera de reciclaje" de los atajos de Productos.
- Archivar pide confirmación y el aviso ofrece "Deshacer" para desarchivar, en instituciones, cuentas, tarjetas y préstamos.

### Corregido

- Los atajos del menú de opciones (⋮) de un detalle ya abren su formulario. Cerrar el menú hacía un retroceso de historial que cancelaba la apertura de la cuenta, la tarjeta, el préstamo o la vista de edición en el mismo toque.
- Las tarjetas y filas que abren otra vista muestran su loader al tocarlas: presupuestos, metas, préstamos, cobros, cuentas, tarjetas y movimientos.

## [1.4.2] - 2026-10-12

### Corregido

- El asistente de préstamo contaba un mes de más cuando el día del vencimiento todavía no había llegado, y mostraba una cuota pagada de más con el saldo correspondiente.

## [1.4.1] - 2026-10-12

### Cambiado

- La versión que muestra Ajustes sale de `package.json` a través de `next.config.mjs`. Ya no hay que mantener `NEXT_PUBLIC_APP_VERSION` en el `.env`.
- La documentación pasa prettier: el script de formato cubre `md` y existe `format:check`.

## [1.4.0] - 2026-10-12

### Agregado

- Deshacer después de eliminar: cada borrado guarda un snapshot en el API y el toast permite reponerlo desde las 9 pantallas de detalle.
- Prefill del asistente de préstamo desde un enlace del chat con `amount`, `periods`, `ratePercent` o `installment`, `lenderName`, `freq` y `who`.
- El chat pinta enlaces markdown; una ruta interna se abre con `Link`.
- Confirmación con diálogo al cerrar un formulario con cambios sin guardar, en 12 sheets.
- La diferencia en vivo al ajustar el saldo de una cuenta o de una tarjeta.

### Cambiado

- La etiqueta de la cuenta en un movimiento sigue al tipo: "Desde" en un gasto, "Destino" en un ingreso.
- La rueda de fecha objetivo de una meta ya no ofrece días pasados.
- Las reglas de `.cursor/rules` y la documentación del módulo finance apuntan a las rutas reales por capability.
- Las auditorías de formularios viven en `docs/reference/auditorias/` con un resumen de lo aplicado y lo pendiente.

### Corregido

- La herramienta de IA de aporte a meta no enviaba la cuenta, lo que rompía el typecheck del paquete.
