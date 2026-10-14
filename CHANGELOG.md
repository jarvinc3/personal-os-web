# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y [SemVer](https://semver.org/lang/es/). Reglas y ejemplo en [docs/reference/changelog-guide.md](./docs/reference/changelog-guide.md).

## [0.31.1] - 2026-10-20

### Corregido

- El diálogo de confirmación de «Recalcular» se cierra cuando el check deja de listar la desviación; antes quedaba abierto tras corregir el saldo.

### Cambiado

- Specs de integridad que cubren el cierre del diálogo tras el recálculo, además de la selección de desviaciones y el armado del body.

## [0.31.0] - 2026-10-20 - Integridad de saldos

### Agregado

- Banner de «Saldo descuadrado» en el detalle de cuenta y de tarjeta de crédito, con saldo guardado, esperado, diferencia y botón «Recalcular» con confirmación.
- Lista de desviaciones abiertas en Productos, con el mismo recálculo, y sección «Integridad de saldos» con «Verificar ahora» en `/settings/finance`.
- Hooks `useFinanceIntegrity` y `useRecalculateBalance`; ajuste de notificación «Saldos descuadrados».
- Specs de la lógica del banner, del badge y del flujo de recálculo.

## [0.30.2] - 2026-10-19

### Corregido

- El filtro de moneda del anillo de suscripciones se aplica a la lista de tarjetas, y los segmentos «Sin categoría» y «Sin método» filtran esas suscripciones.
- El calendario de próximos cobros reutiliza el agrupado por día compartido.
- Planificación deja de mostrar el atajo a Suscripciones, que ya está en el tab bar.

## [0.30.1] - 2026-10-19

### Cambiado

- Las claves internas de agrupación del anillo de suscripciones usan constantes con nombre. Sin cambio de comportamiento.

## [0.30.0] - 2026-10-19

### Agregado

- Vista Suscripciones rediseñada: hero con costo mensual, equivalente anual, activas y tendencia contra el mes anterior; anillo por categoría, tarjeta-cuenta o moneda que filtra las tarjetas; próximos cobros a 30 días y calendario mensual; alertas descartables; tarjetas con barra del ciclo; bandeja de detectados; y pie de canceladas con el ahorro anual.
- Hooks `useSubscriptionsBreakdown`, `useSubscriptionsUpcoming`, `useSubscriptionAlerts` y descarte de alertas.
- Selector de categoría en el formulario de suscripción.

### Cambiado

- La pestaña Recurrentes desaparece: confirmar un detectado crea la suscripción y actualiza el contador, y confirmados y descartados pasan a una bandeja aparte.

## [0.29.1] - 2026-10-19

### Corregido

- La tarjeta «Cargos bancarios» incluye el desglose por banco, además del gráfico mensual y el desglose por tipo.
- Las tarjetas de débito dejan de ofrecer «Conciliar» y «Conciliaciones»: su saldo se cierra desde la cuenta enlazada.

### Cambiado

- Specs del rango anual de cargos y de la magnitud de un monto.

## [0.29.0] - 2026-10-19 - Conciliación

### Agregado

- Sheet «Conciliar» en el detalle de cuenta y de tarjeta: saldo real, fecha de corte, diferencia en vivo y reparto en líneas por tipo con la sugerencia precargada.
- Sección «Conciliaciones» con el historial del producto, borrado del último cierre y Deshacer.
- Indicador del mes en Productos (productos conciliados y pendientes) y tarjeta «Cargos bancarios» en Planificación con el desglose mensual, por banco y por tipo.
- Tipos, hooks, endpoints y validación de la suma de los ajustes.

## [0.28.2] - 2026-10-14

### Corregido

- Editar una suscripción ya puede vaciar los campos opcionales (fin de la prueba, enlace de gestión y notas): el formulario envía `null` y el servidor deja de tomar la omisión como «sin cambios».

### Cambiado

- Specs del payload de suscripción que cubren el vaciado de los campos opcionales.

## [0.28.1] - 2026-10-14

### Cambiado

- El formulario de suscripción usa `undefined` como «sin borrador» y deja de mezclar `null` y `undefined` para el mismo caso. Sin cambio de comportamiento.

## [0.28.0] - 2026-10-14 - Suscripciones

### Agregado

- Vista `/finance/subscriptions` como principal del tab bar, entre Planificación y Productos: resumen de costo mensual y anual en la moneda base, recurrentes detectados, filtros por estado y moneda, búsqueda y lista con estado.
- Detalle de suscripción con costo mensual y anual, próximo cobro, historial de pagos vinculados a movimientos y acciones de pausar, reanudar, cancelar y registrar pago manual.
- Formulario de suscripción con buscador de marca, monto, ciclo e intervalo, ancla del primer cobro, prueba, tarjeta o cuenta, recordatorio, enlace de gestión y notas.
- Sección «Suscripciones» en los ajustes de Finanzas con días de recordatorio y agrupación; avisos de renovación y subidas de precio en las alertas del módulo.
- Specs del etiquetado de ciclo y estado, del formulario de suscripción y del registro de módulos.

### Cambiado

- `/settings/subscriptions` redirige a `/settings/finance#suscripciones`; el módulo Suscripciones sale del registro, el nav, los ajustes y el selector de contexto del chat.
- Los docs de Finanzas, Ajustes y IA reflejan que Suscripciones vive dentro de Finanzas.

## [0.27.2] - 2026-10-14

### Corregido

- El globo de la dona del bloque de chat `chart` formatea el monto con la moneda del bloque, igual que las barras y la línea.
- La tarjeta de un recurrente confirmado muestra el costo anual además del mensual.
- El total mensual de recurrentes confirmados solo aparece cuando la lista está completa, para no mostrar una suma parcial.

### Cambiado

- Los datos del bloque de chat `chart` viven en un helper puro cubierto con specs (serie, colores y título).
- `contracts/consumed-api.md` documenta las superficies `merchants` y `recurring`; `dominio.md` y `status.md` dejan de decir que el gráfico no tiene componente.

## [0.27.1] - 2026-10-14

### Corregido

- Suscripciones vuelve a quedar fuera del tab bar principal, con atajo en Planificación. El 07 entrega comercios y la detección de recurrentes; el gestor completo de suscripciones (tablas propias, pagos y recordatorios) pasa al pendiente 08 y no se implementa ahora.

### Cambiado

- La spec 07 se limita a comercios y recurrentes; el gestor de suscripciones se documenta en `docs/modules/finance/pendientes/08-suscripciones.md`.

## [0.27.0] - 2026-10-14 - Comercios y suscripciones detectadas

### Agregado

- Comercios: cada movimiento se asocia a un comercio canónico ("UBER *TRIP 1234" y "Uber Eats" caen en Uber). Pantalla `/finance/merchants` con el gasto del mes y detalle con sus movimientos, logo, renombrar y unir comercios, y categoría por defecto.
- Suscripciones: pantalla `/finance/subscriptions` (en el tab bar principal, entre Planificación y Productos) con los cobros recurrentes detectados por confirmar o descartar, los confirmados con próximo cobro, monto promedio y costo mensual y anual, y alta manual.
- El formulario de movimiento autocompleta el comercio y sugiere su categoría; la fila y el detalle muestran el comercio con su logo.
- Ajuste "Cobros recurrentes" en la configuración de Finanzas; las alertas de subida de precio, cobro no llegado y próximo cobro respetan ese interruptor.
- Atajo a Comercios en Productos; atajo a Suscripciones en Planificación.

### Cambiado

- `FINANCE_APP_NAV` incluye Comercios (fuera del tab bar) y Suscripciones (dentro, entre Planificación y Productos).

## [0.26.3] - 2026-10-14

### Cambiado

- Las claves de la query que precarga el flujo guiado viven en una constante, y el tipo del movimiento se resuelve en un helper con guard clause. Sin cambios de comportamiento.

## [0.26.2] - 2026-10-14

### Corregido

- El flujo guiado que abre "Registrar rápido" cuando falta algo llega precargado con el monto, la categoría, la fecha y el comercio que ya se conocían.

### Cambiado

- El armado y la lectura de los datos precargados viven en un helper con spec. Sin cambios de comportamiento.

## [0.26.1] - 2026-10-14

### Corregido

- El chat conserva las respuestas del agente que son solo un bloque (una tarjeta sin texto) al recargar la sesión.

### Cambiado

- El spec de `mergeSessionMessages` cubre los mensajes con bloques sin texto, el mensaje interno de tools y la preferencia por los bloques guardados. Sin cambios de comportamiento.

## [0.26.0] - 2026-10-14

### Agregado

- El chat muestra bloques nativos de Finanzas: un movimiento, una lista corta, el progreso de un presupuesto, el resumen de un préstamo y gráficos de gasto (barras, dona y línea). Cada tarjeta abre el detalle con `Link`; los tipos de bloque desconocidos se ignoran sin romper el chat.
- Barra "Registrar rápido" en Movimientos y en el Resumen. Interpreta una frase ("café 250 popular"), muestra una vista previa editable (tipo, monto, categoría, cuenta o tarjeta, fecha y comercio) y solo guarda al confirmar; si falta algo, abre el formulario guiado con lo que ya se sabe.
- Tarjeta de resumen semanal en el Resumen con gasto de la semana frente al promedio, top de categorías, presupuestos en riesgo, próximas cuotas, vencimientos de tarjeta y correos por revisar.
- Ajuste del día de envío del resumen semanal y de su aviso en la configuración de Finanzas (`notifications.weeklySummary` encendido por defecto).

## [0.25.1] - 2026-10-14

### Corregido

- Cerrar la hoja de cuota de préstamo o de corte de tarjeta ya no borra el contexto del chat: el botón del agente vuelve a abrir con la entidad de la pantalla de abajo.

### Cambiado

- El registro de contextos del chat guarda una entrada por consumidor montado y muestra la más nueva. Sin cambios de comportamiento aparte del arreglo anterior.

## [0.25.0] - 2026-10-14

### Agregado

- El agente sabe desde qué pantalla o entidad se abrió. Los detalles de Finanzas registran su entidad (`useRegisterChatContext`), el botón de la cabecera abre el chat con el contexto en la URL y el chat muestra un chip "Contexto: …" que se puede quitar. Cubre movimiento y transferencia, cuenta, tarjeta, institución, préstamo, cuota, cobro, meta de ahorro, presupuesto y corte de tarjeta.

## [0.24.3] - 2026-10-14

### Cambiado

- El spec del hook de listas infinitas tipa las filas de cada página. Sin cambios de comportamiento.

## [0.24.2] - 2026-10-14

### Cambiado

- El spec del hook de listas infinitas cubre el cursor que gana sobre los params, el recorrido de varias páginas y la página vacía. Sin cambios de comportamiento.

## [0.24.1] - 2026-10-14

### Cambiado

- El armado de la ruta paginada usa un objeto de opciones. Sin cambios de comportamiento.

## [0.24.0] - 2026-10-14

### Agregado

- Las listas que crecen cargan solas al hacer scroll, con un botón "Cargar más" de respaldo: cuotas de préstamo, cobros de un cobro, aportes de una meta, correos pendientes y procesados, movimientos de un presupuesto, cortes de tarjeta, eliminados de la papelera, presupuestos e historial de instrumento. Comparten el hook `useInfiniteFinanceList` y el componente `InfiniteListSentinel`.

### Cambiado

- El plan de amortización usa la proyección completa de `GET /finance/loans/:id/schedule` en vez de la lista paginada de cuotas.
- La papelera deja de mostrar un contador de eliminados: con cursor no hay total.

## [0.23.1] - 2026-10-14

### Corregido

- Al conectar Gmail, el resultado de "Sincronizar ahora" se muestra también después de guardar y pasar al resumen.
- Apagar la sincronización automática en el paso de onboarding ya no la vuelve a encender al guardar.

## [0.23.0] - 2026-10-14

### Agregado

- Al conectar Gmail, el resultado del OAuth ofrece un paso para activar la sincronización automática: horario (cada 15 min, cada hora, cada 6 h u horas fijas), modo de importación y "Sincronizar ahora". Si la sincronización automática ya estaba encendida, muestra el resumen con "Cambiar".

## [0.22.1] - 2026-10-14

### Corregido

- Al aplicar un estado de cuenta se refrescan los saldos, movimientos y cortes afectados.
- Una clave de PDF incorrecta muestra un aviso en vez de dejar el diálogo sin respuesta.

## [0.22.0] - 2026-10-14

### Agregado

- "Importar estado de cuenta" en el detalle de la tarjeta y de la cuenta bancaria: se sube el PDF (con clave si la tiene) y se abre la conciliación.
- Pantalla `/finance/statement-imports/[importId]`: cabecera del corte (periodo, saldos, mínimo y fecha límite), grupos "Coinciden", "Faltan en la app" y "Sobran en la app", diferencia de saldo con ajuste opcional y CTA "Aplicar".

## [0.21.2] - 2026-10-13

### Corregido

- Una reversa parcial junto a una reversa total del mismo movimiento ya no marca la fila completa como "Reversa parcial".

## [0.21.1] - 2026-10-13

### Corregido

- Agrupar una reversa con su original ya no pierde filas: un movimiento enlazado a sí mismo y un original con varias reversas conservan todas sus filas.
- Las patas desplegadas de una reversa muestran la fecha completa (día y hora), no solo la hora.

## [0.21.0] - 2026-10-13

### Agregado

- La lista de Movimientos muestra una sola fila por reversa, en la fecha del movimiento original y con la insignia "Revertido". Al tocarla se despliegan las dos patas (original y reversa) con su fecha y origen.
- Una reversa cuyo movimiento original aún no está cargado se muestra sola, con la insignia "Revertido" y el enlace "Ver original".

### Cambiado

- Una reversa parcial (monto distinto al original) no se agrupa: deja dos filas con la insignia "Reversa parcial".

## [0.20.1] - 2026-10-13

### Cambiado

- Todas las elecciones de categoría usan el mismo selector: movimientos, presupuestos y la categoría padre del catálogo. El modo de varias categorías recibe y devuelve la lista de ids, y alternar o limpiar vive en la hoja, no en cada formulario.
- El selector de varias categorías permite quitar una con la X, muestra una fila "Añadir categoría" cuando ya hay elegidas y se ve deshabilitado si no hay categorías.
- La categoría padre se elige con el mismo selector, con búsqueda y sin poder elegir la propia categoría.

### Corregido

- El formulario de tarjeta vuelve a agrupar red y color en la sección de detalles opcionales.
- El módulo Keep Awake ya no aparece en Ajustes > Módulos: no tiene configuración propia.

## [0.20.0] - 2026-10-13 - Reinicio de versionado beta

### Cambiado

- Nuevo esquema de versiones: el proyecto está en **beta** y usa `0.MINOR.PATCH` hasta `1.0.0`. Política completa en [docs/versionado.md](./docs/versionado.md).
- Las versiones `1.x` anteriores equivalen al historial `0.x` y sus tags se borraron. `0.20.0` continúa el orden de lo publicado hasta `1.19.x`.
- Marca "beta" en el README y una insignia "Beta" junto al nombre en la barra lateral.

> **Nota:** las entradas de abajo se publicaron como versiones `1.x` antes del reinicio de numeración. Se conservan como registro histórico; sus tags ya no existen.

## [1.19.0] - 2026-10-13

### Agregado

- Selector de varias categorías en el presupuesto: las elegidas se muestran como tarjetas y se abre la hoja de categorías en modo múltiple, con una marca en cada selección.
- Botón "Crear presupuesto" en la lista de presupuestos.
- El resumen del mes en el inicio muestra el mes y el año en una insignia, con el color del módulo de Finanzas.

### Cambiado

- Las pestañas de Planificación tienen color propio y nuevo orden: Ahorros, Presupuestos, Cobros y Préstamos.
- La lista de movimientos separa cada semana en su propia sección, con un encabezado más limpio y el buscador ajustado.
- Los detalles opcionales de préstamos, cobros y metas de ahorro se agrupan en una sección de resumen.
- El botón principal del login muestra una flecha que se reemplaza por el indicador de carga, y el campo de correo ya no trae texto de ejemplo.

## [1.18.1] - 2026-10-13

### Corregido

- Los sheets con acciones ya no avisan de una `key` faltante en el pie: cada acción lleva su propia clave.

## [1.18.0] - 2026-10-13

### Agregado

- Configuración de Finanzas en `/settings/finance`: ingreso fijo (monto, frecuencia, días de pago y cuenta), cuenta por defecto para gastos y transferencias, entrada de monto (teclado o calculadora), día de inicio del mes financiero, días de aviso antes del vencimiento de la tarjeta y modo de correo (directo o pendiente).

### Cambiado

- Los formularios de gasto y transferencia proponen la cuenta por defecto configurada.

## [1.17.0] - 2026-10-13

### Agregado

- Flujo guiado al crear un movimiento (categoría, monto y cuenta) y una transferencia (origen, destino y monto); el monto abre con el modo teclado o calculadora guardado en `module_config.finance.amountEntry`.
- Plan de amortización del préstamo en el detalle, con capital, interés y saldo restante por cuota.
- Registro manual del corte de tarjeta desde la pestaña de estados de cuenta (mínimo, balance y vencimiento con `PATCH`).
- Vínculo de un movimiento a una cuota, un cobro o una meta desde el detalle, con quitar vínculo y su reversa.

### Cambiado

- La etiqueta del estado `REVERSED` pasa a "Revertido" y el detalle enlaza al movimiento original cuando existe.

## [1.16.0] - 2026-10-12

### Agregado

- Formulario de presupuesto multicategoría: chips de varias categorías, "incluir subcategorías", rollover y recurrencia.
- El detalle del presupuesto lee `GET /budgets/:id/transactions` en vez de filtrar por una sola categoría.
- La comisión de una transferencia se muestra y suma en los totales del mes.
- "Desde otra cuenta" al apartar en una meta crea la transferencia y la enlaza con `fromTransferGroupId`.
- Hoja de detalle del corte y selector de moneda al pagar la tarjeta.
- Detalle de cuota del préstamo y campos de seguro y tipo de tasa en el formulario.
- Badge "¿Duplicado?" en la fila y filtro de posibles duplicados.
- Al crear una transferencia hacia la cuenta de una meta, el aviso ofrece contarla como aporte.

### Cambiado

- La lista de cortes lee la página de `GET /cards/:id/statements` (`items`).

## [1.15.0] - 2026-10-12

### Agregado

- Badge "¿Duplicado?" en el detalle del movimiento, con "Unir" y "No es duplicado".

## [1.14.0] - 2026-10-12

### Cambiado

- El presupuesto se envía con `categoryIds` (el formulario actual manda una categoría) y acepta `includeChildren` y `rollover`.

## [1.13.0] - 2026-10-12

### Agregado

- Si el cobro supera lo pendiente, la hoja muestra las 3 opciones (ingreso extra, saldo a favor o a otro cobro) y las envía como `excessHandling`.
- Acción "Castigar deuda" en el detalle del cobro y el estado `WRITTEN_OFF`.
- Se mapean los códigos `RECEIVABLE_EXCESS_UNRESOLVED` y `RECEIVABLE_NOT_FOUND`.

## [1.12.0] - 2026-10-12

### Agregado

- La cuenta muestra "Libre" y "Apartado" en su detalle.
- La meta pide cuenta y modo al crearla; los apartados usan `/allocations`.
- Se mapean los códigos `GOAL_ACCOUNT_REQUIRED`, `EARMARK_EXCEEDS_BALANCE` y `GOAL_NOT_FOUND`.

## [1.11.0] - 2026-10-12

### Agregado

- La lista de cuotas muestra capital e interés de cada una y su estado (`Pendiente`, `Parcial`, `Pagada`, `Vencida`).
- "Abonar a capital" en el detalle del préstamo, con monto, modo (reducir plazo o cuota), vista previa del interés restante y aviso de penalidad.
- Se mapean los códigos `PAYMENT_EXCEEDS_INSTALLMENT`, `LOAN_HAS_OVERDUE` y `LOAN_NOT_FOUND`.

## [1.10.0] - 2026-10-12

### Agregado

- "Pagar tarjeta" en el detalle de una tarjeta de crédito, con origen, monto y atajos de pago mínimo y balance al corte.
- La lista de cortes muestra el mínimo, lo pagado y los estados nuevos (`En curso`, `Cerrado`, `Mínimo pagado`, `Vencida`).
- Se mapean los códigos `CARD_NOT_FOUND`, `CARD_NOT_CREDIT` y `CARD_CURRENCY_MISSING`.

## [1.9.0] - 2026-10-12

### Cambiado

- Restaurar muestra los códigos nuevos (`ALREADY_RESTORED`, `RESTORE_CONFLICT`, `PARTIAL_OPERATION`) con su mensaje en español.
- "Eliminados recientes" avisa cuando un registro tiene muchos datos y restaurarlo puede tardar.

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
