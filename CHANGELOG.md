# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y [SemVer](https://semver.org/lang/es/). Reglas y ejemplo en [docs/reference/changelog-guide.md](./docs/reference/changelog-guide.md).

## Unreleased — 0.100.0

### Seguridad

- Next.js y `eslint-config-next` se actualizan a 16.4.6 para salir de la versión afectada por el aviso de seguridad publicado (#430).

### Agregado

- El botón de la derecha del header de una hoja de Finanzas es adaptable: si la hoja explica conceptos, muestra «?» y abre sus definiciones del glosario con «Preguntar al agente», que abre el overlay con el contexto de la hoja; si no, mantiene el icono del agente. El mapa de hoja a términos es central, `SHEET_GLOSSARY_TERMS`, y el README del Centro de ayuda ya describe el glosario actual sin el #229 pendiente (#409).

- Las **sugerencias del agente por vista** aparecen en una fila horizontal encima del tab bar, con scroll y fundido en el borde, y dentro del overlay encima del composer. La X de la barra oculta la fila solo durante la sesión en esa vista; cada badge del overlay lleva su propia X y pide confirmación para descartarlo de forma persistente. Tocar un badge abre el overlay con el prompt de la sugerencia. La fila se oculta mientras hay un sheet abierto y no aparece si no hay sugerencias (#408; consume el recurso de back #358).

- El **agente** abre en un overlay global desde cualquier vista: pulsación larga en el `+` del tab bar o del FAB (con anillo de progreso), clic derecho, `Ctrl/Cmd+K` o el botón a la derecha del header de cualquier sheet. Vive en la URL (`?sheet=agent-chat`), cubre la pantalla con desenfoque, reemplaza el tab bar por el campo de texto, se cierra con X, Esc, Atrás o un tirón hacia abajo y devuelve el foco al control que lo abrió. El header muestra el contexto de la vista, el historial abre por ruta y el chat nuevo usa el contexto actual o lo quita. Los mensajes se ven por partes con `stream: true` y un `clientMessageId` por turno; si falla, «Reintentar» reenvía el mismo turno sin duplicar el mensaje. El composer envía texto; voz y adjuntos quedan fuera hasta que exista su contrato (#407; consume el streaming y el reintento de back #421).

- Ajustes estrena **Uso** (`/settings/usage`): consumo y costo de la clasificación de correos con gráficas por día y por hora, restante de la carga inicial, del tope diario de tokens y del costo global, y desglose por banco y tipo de clasificación. El rango es hoy, 7 o 30 días; la vista avisa al 80 % del costo global y muestra la pausa con el reinicio UTC al 100 %. No muestra contenido de correos ni recalcula el costo (#426; consume el contrato de back #408 y #415).
- Intelligence › Gmail pide el período de importación al conectar (hoy, último mes o últimos 3 meses) y un filtro de remitente opcional; ambos viajan a `POST /intelligence/email/connect`, el estado de la conexión muestra el corte y el filtro guardados, y al reconectar se conservan salvo que se elija otro período o se borre el filtro (#421; contrato de back #382).
- El pago de tarjeta registrado a mano pide confirmación cuando el back responde 409 `CARD_PAYMENT_POSSIBLE_DUPLICATE`: el diálogo muestra el monto, la fecha, la cuenta de origen y la tarjeta del pago importado que se le parece, y solo guarda al confirmar con `duplicateAcknowledged: true`. Cancelar no registra nada y, sin coincidencia, el flujo no cambia (#423; contrato de back #389).

- Productos estrena **Imports del correo** (`/finance/imports/review`): la cola de correos que quedaron en revisión con su motivo y los datos del movimiento detectado —monto, fecha, comercio, referencia y el producto por sus últimos 4—, separada de las propuestas de productos. La fila de Productos cuenta los pendientes y se esconde cuando el entorno no tiene el endpoint; la pantalla tiene estados de carga, vacío y error reintentable (#424; contrato de back #383).

- Productos › **Detectados en correos** aprueba con un paso a paso de formularios nativos: la institución se salta si el back marca una compatible y, si no, se crea con el formulario de siempre; el producto se crea con el alta nativa de cuenta o tarjeta, prellenada desde el correo (una cuenta basta con los últimos 4 dígitos) y con su vista previa. Cuando el back marca un producto existente, la propuesta ofrece **Vincular a producto existente** con `approve { productId }`, sin crear otra. Si el approve falla, se reintenta solo con ese id. Se retira el formulario propio y el `PATCH` desde la web, las cuentas se listan antes que las tarjetas, se avisa qué falta en cada débito, los errores de carga usan el mensaje de Finanzas y la pantalla explica el origen de los correos (#413; back #374).
- Productos estrena **Detectados en correos** (`/finance/products/email-proposals`): las cuentas y tarjetas que el back detecta en los correos guardados quedan como propuestas con su evidencia, se editan antes de aprobar y se aprueban o descartan una por una; aprobar crea o reutiliza el producto y descartar no crea nada. «Buscar en correos» resume cuántos correos revisó y qué encontró, el filtro por estado vive en la URL y la fila de Productos cuenta las pendientes. Una cuenta se aprueba solo con los últimos 4 dígitos y una tarjeta de débito exige su cuenta (#410; contrato de back #368).
- Inteligencia muestra el avance de clasificación de correos, la próxima corrida tras un fallo de clasificación y un aviso de sincronización estancada que permite reintentar sin pedir reconectar Gmail (#391; contrato de back #299).
- El detalle de un movimiento muestra la señal de correo que lo originó y enlaza al correo de origen; los movimientos sin señal explican que no tienen trazabilidad de correo (#214).
- El detalle de un correo de Inteligencia suma la sección **Señal detectada** con el tipo, el estado, la confianza y una fila por ruta del payload, y la evidencia que la sostuvo —remitente, asunto, fecha del correo y la regla del clasificador con su proveedor y modelo—; el vacío explica si el correo no tiene señal, si la clasificación sigue pendiente o si falló, y la vista no crea ni modifica movimientos en Finanzas (#383; consume el contrato de back #210).
- Cada correo de muestra de un grupo de revisión abre su detalle desde la propia vista de grupos, sin cambiar de pestaña; si el contrato no trae el id de una muestra, su asunto queda sin enlace. Consume `sampleMessageIds` del back (#359, jarvinc3/personal-os-back#279).
- Inteligencia › Revisión estrena la vista de **grupos**: cada grupo reúne los correos de un remitente y una plantilla con su total, sus pendientes, sus pendientes HOLDOUT y hasta tres asuntos de muestra, ordenados por pendientes y con scroll infinito. Etiquetar un grupo abre una hoja por ruta con relevancia, tipo y dominios; «Confirmar» registra el acierto y «Corregir» guarda las etiquetas elegidas, y un diálogo avisa cuántos correos se verificarán y cuántos HOLDOUT quedan fuera del lote. Tras aplicar, la hoja muestra verificados y excluidos, los grupos y los conteos de la cola se actualizan, y un grupo con solo HOLDOUT no permite lote. Rechazar sigue siendo uno a uno (#320).
- La cola ADMIN de Conocimiento permite promover una fila global en revisión: queda activa como promovida por un administrador, el rebuild la conserva y una reversión posterior la vuelve a bloquear (#246).
- Inteligencia › Revisión estrena búsqueda y filtros: pestañas **Pendientes** y **Revisados** con filtro por estado, asunto, remitente, rango de días, partición y orden por fecha; en Revisados cada correo muestra su última verificación con etiquetas o motivo y fecha. Los filtros se combinan, se conservan al paginar y en la URL, y el estado vacío los enumera con un botón para limpiarlos (#321; consume el contrato de back #219).
- Inteligencia › Revisión agrupa todos los filtros en una hoja por URL, ofrece chips para quitarlos y muestra tipo y confianza en cada correo; los grupos se ordenan por impacto (#400; consume back #313).
- La cola de revisión permite verificar hasta 20 correos juntos con confirmación y ajustar el umbral de confianza y la aceptación de remitentes verificados desde Ajustes (#401; consume back #314).
- Inteligencia estrena **Conocimiento** (`/intelligence/knowledge`): lista el conocimiento personal y el GLOBAL estable con su clave, etiqueta y estado, sin remitentes ni datos de transacción en GLOBAL; exporta solo el conocimiento personal en JSON y borra todos los datos de IA con una confirmación que detalla correos, análisis, consentimiento y conexión de Gmail. La cola `/intelligence/admin/knowledge` (rol ADMIN) agrupa el conocimiento global por estado y permite revertir promociones, que quedan bloqueadas (#327).
- Inteligencia › Revisión estrena modo foco (`?sheet=intelligence-focus`): un correo a la vez con su vista previa junto al formulario, atajos de teclado con ayuda visible —C Confirmar, E Corregir, R Rechazar, J y K siguiente y anterior, Esc para salir—, salto automático al siguiente pendiente al verificar, el mismo filtro de partición de la cola y un estado de cola terminada al final; salir del foco deja la lista en el mismo punto (#322).
- En el modo foco, Rechazar sin motivo lleva el foco al campo del motivo y no rechaza, y Corregir exige al menos una etiqueta cambiada, igual que en la cola (#322).
- El botón «Crear en productos» ofrece «Institución», «Comercio» y «Categoría»: «Comercio» abre por ruta el sheet de alta (`merchant-create-sheet`) con nombre obligatorio, categoría opcional, logo de marca y nombres alternativos, avisa «Comercio creado» al guardar y enlaza al comercio existente cuando el nombre ya está tomado; el atajo «Efectivo» desaparece (#262).
- Neo-Skeuo entra al selector de estilo visual: papel y tinta en claro y oscuro, cuatro superficies (base, elevada, hundida y presionada), tres niveles de sombra y radios de 0, 4, 8 y 12 px. Se elige en Ajustes → Apariencia, se recuerda como cualquier estilo y no toca componentes: las utilidades `shadow-*` y `rounded-*` leen los tokens del estilo. Con cualquier color primario el texto sigue legible (#235).
- El detalle de un comercio muestra su categoría, sus nombres alternativos y, cuando la app eligió la categoría, la insignia «Sugerida» con «Confirmar»; el sheet de editar permite editar los nombres alternativos, buscar la marca del logo, quitar el logo y parte del tipo de la categoría actual (#263).
- Los comercios avisan de posibles duplicados: el detalle muestra «Posible duplicado de …» con el motivo, «Unir» y «No es duplicado» (con Deshacer), el sheet de unir lista primero «Sugeridos», la lista marca las filas con candidatos y un nombre repetido enlaza al comercio que ya lo tiene (#264).
- «Pagar cuota» en el detalle del préstamo y en el sheet de la cuota pendiente más antigua: `LoanPaymentSheet` propone la cuenta «Se paga desde», el total de la cuota con su desglose y, si el monto lo supera, deja elegir entre abonar el excedente a capital o corregir el monto; un pago parcial deja la cuota como parcial (#295).
- Las galerías de referencia son permanentes en Ajustes → Apariencia: `/settings/appearance/cards` con las cards de cada entidad y sus variantes, y `/settings/appearance/components` con los componentes compartidos por propósito, su ruta de importación y sus estados; los sheets de ejemplo se abren por la URL para que Atrás los cierre (#307, #314, #316).
- Ambas galerías se abren solo desde Apariencia; Inicio deja de mostrar la sección «Desarrollo» y desaparece el índice `/dev` (#314, #316).
- AI-3: `/intelligence` muestra particiones de `EMAIL_V1`, cola paginada para confirmar, corregir o rechazar mensajes, marca HOLDOUT como verdad de referencia y expone historial de runs y procedencia (#206).
- AI-2: `/intelligence` conecta Gmail con acceso de solo lectura, muestra estado y correo importado por cuenta y permite sincronizar; Privacidad permite revocar la contribución al conocimiento global y ADMIN gestiona roles (#205).
- El menú lateral del móvil se abre con un deslizamiento a la derecha que empieza en los 32 px del borde izquierdo, además del botón del encabezado y Ctrl/Cmd + B; un gesto vertical, uno que empieza fuera del borde o dentro de pestañas, pila de instituciones, selector de meses y ruedas de fecha no lo abre, y el clic que sigue a la apertura se descarta. Los textos del panel y del botón pasan a español, y con movimiento reducido el panel cambia sin animación (#265).
- Los Ajustes de cada app y Privacidad vacían por ramas: la lista muestra el nombre, el conteo y lo que arrastra cada rama, agrupada por tema en Finanzas y por app en Privacidad; una rama con datos se marca con su casilla, las que arrastra se bloquean con su conteo y un 409 refresca la lista antes de confirmar. Los ajustes de Finanzas solo ofrecen sus ramas y las apps sin datos no muestran la zona de peligro (#270).

### Cambiado

- #493: el flujo de trabajo versiona `scripts/project3.ps1` y la regla «Project 3 siempre al día»; los issues nuevos entran al tablero al crearse y `check` exige `Cancelado` para los cerrados como `not planned`, con el id de esa opción resuelto por nombre.
- El setup de pruebas de #450 resuelve pantallas con `next/*` y relativos sin extensión, stubea los `.css`, mapea la cobertura con source maps y exige el reintento en el estado de error de Uso (Refs #450; hallazgos de PI-REV).
- Las pruebas de la web pueden renderizar componentes `.tsx` con `react-dom/server` y el loader de TSX; la vista Uso cubre sus estados de carga, vacío y error con pruebas que afirman los textos y el botón de reintento (#450).
- Uso: las series por día y por hora suman una tabla accesible; el reinicio y su etiqueta usan la hora del servidor, la vista se refresca al cruzar la medianoche UTC y reintenta con un tope si el servidor sigue en el día anterior; el icono del estado vacío queda decorativo (Refs #426; hallazgos de PI-REV).
- #445: el contrato OpenAPI se regenera desde el back de `develop` (181 rutas y 291 schemas, con el estado `DISCARDED`) y el estado del correo usa el valor generado en `signals.ts` y en `MESSAGE_STATUS_LABELS`; el estado vacío de la señal deja de comparar la cadena suelta. Sin cambio visible (back #408, #414 y #415).
- #393: la tarjeta de Gmail muestra un solo estado con una acción principal según el caso —«Reconectar» si el acceso venció, «Sincronizar» al día— y el resto de acciones pasa a «Más acciones», con vaciar siempre como destructiva. La clasificación muestra su avance y el importado no se lee como cero mientras tanto; el canal en vivo solo aparece con la conexión sana.
- #396: el detalle del correo abre con un resumen —clasificación automática y revisión de una persona— y deja las versiones Canónica, Saneada y Cruda bajo «Detalles técnicos», cada una explicada. Observaciones, verificaciones y análisis muestran tipo, alcance, veredicto, rol, modo y estado en español (`analysis-labels.ts`). Sin cambio de contrato.
- #394: al abrir el detalle del correo el foco inicial va al asunto en el título del panel, que queda enfocable con `tabIndex={-1}`, y al cerrar vuelve a la fila que lo abrió. La trampa de foco y Escape siguen siendo del `Drawer` de base-ui. Sin cambio visual.
- #395: cambiar un rol pide confirmación, enumera lo que la cuenta podrá hacer y lo que dejará de poder —solo Administrador suma la revisión del conocimiento global; Colaborador no agrega permisos sobre Usuario— y el diálogo espera a que la petición termine. El borrado de datos de IA dice cuántos elementos de conocimiento personal se borran, los visibles y los que están en revisión. Promover y revertir ya explicaban su consecuencia, y cada acción confirmada avisa el resultado.
- #397: la lista de correos muestra cuántos están cargados y cuántos en revisión, y suma búsqueda por asunto o remitente y filtro por estado sobre los correos ya cargados, con aviso y limpieza de filtros. Revisión abre con una guía, Conocimiento explica quién revisa lo pendiente y `/intelligence/roles` redirige a la ruta real de roles.
- #362: aclara que el chat, `/chat` y su renderer pertenecen al runtime retirado; conserva la guía como referencia histórica y delimita la sintaxis Markdown como código.
- Consentimiento y administración de roles llaman a `/api/intelligence/*`; la copia OpenAPI se sincroniza con el back tras unificar el módulo como `intelligence`, y las notas históricas apuntan a la ruta actual del paquete (jarvinc3/personal-os-back#307, #398).
- Los tipos de Inteligencia se leen desde el contrato OpenAPI del back: cada tipo del módulo pasa a un alias de `components["schemas"]` y solo quedan locales los campos que el contrato todavía no describe (`relevance`, `notes` y `templateFingerprint`). Un cambio del back ahora rompe el typecheck en lugar de la pantalla, sin cambios visibles en las pantallas (#384).
- El contrato OpenAPI versionado pasa a la copia de `develop` del back: 161 rutas y 244 schemas, con 203 de las 209 respuestas 2xx descritas. La señal del correo ya se lee con tipos generados; el resto de los tipos a mano de Inteligencia se migra en #384 (#383).
- La documentación de AI y de Inicio describe la web sin chat: el chat queda marcado como histórico hasta AI-9, `/chat` desaparece de las rutas y de la tabla de módulos, y el inicio deja de anunciar un atajo que no existe (#362).
- Los tipos de request y de respuesta del cliente se generan desde el contrato OpenAPI del back: `pnpm api:contract` refresca la copia versionada, `pnpm api:generate` escribe `src/config/api-contract/api-schema.ts` y `pnpm typecheck` falla si el contrato no está disponible. Conocimiento y los montos del balance patrimonial ya salen del contrato; las respuestas que el back todavía no describe siguen a mano (personal-os-back#263) (#155).
- La tabla «entidad → card → variantes» ya refleja el patrimonio con las cards compactas de cada producto y aclara que la web no tiene chat desde AI-0: el bloque del chat queda como referencia de la galería hasta su rediseño (AI-9) (#271).
- La galería de componentes usa una lista de categorías con icono, descripción y conteo de fichas, con buscador por nombre de componente, y cada categoría abre su vista por ruta (`/settings/appearance/components/<categoría>`) con botón atrás; el deslizador horizontal desaparece (#341).
- La galería de componentes suma fichas de `DetailHeader`, `CurrencyFlag` y `PendingSurface`, y `docs/architecture/ui-components.md` deja de contradecirse: el monto en pantalla es `Money` (dentro de un texto suelto, `formatFinanceMoney`), el deshacer es `showUndoToast` y el control segmentado es `SegmentedControl`; los canónicos que no se pueden montar aislados quedan explicados (#309).
- La cola de revisión de Inteligencia deja ver el primer correo al abrir la vista en móvil: Gmail y las insignias de cobertura pasan a una sección plegada que resume la cuenta y el estado de la sincronización en una línea, y el asunto se lee completo en dos líneas sin que la etiqueta de partición lo tape (#323).
- Revisar abre el formulario en un panel por ruta (`?sheet=intelligence-review`), con la vista previa del correo al lado desde `md` y arriba en móvil, en lugar de expandirse dentro de la fila; la lista no cambia de posición (#323).
- La fila sale de la cola en cuanto se envía la verificación, sin esperar al servidor, y los conteos bajan con ella; si el envío falla, la fila vuelve y un aviso lo explica (#323).
- Cada correo muestra un ID corto (`#3f9a1c7e`) en la cola y en el detalle, para distinguir dos con el mismo asunto, remitente y minuto (#323).
- `BottomSheet` acepta `size="wide"`: desde `md` el drawer derecho se ensancha para mostrar dos columnas y en móvil baja como cualquier hoja; el ejemplo vive en la galería de Apariencia (#323).
- #319: Revisar usa selectores de tipo y chips de dominios, valida el bloque de transacción y muestra las etiquetas en español en el detalle del correo.
- Cerrar una hoja se pinta una sola vez: el mismo «Cancelar» con su icono en todas, «Cerrar» en las de solo lectura y la acción propia («Limpiar», «Listo», «Ahora no») donde la hoja la necesita; las hojas dejan de copiar el botón (#298).
- Toda confirmación usa el mismo diálogo: mismo título, descripción y botones, el tono destructivo siempre igual, Esc y Cancelar cierran sin ejecutar y el clic fuera no cierra; el vaciado con contraseña sigue pidiéndola dentro del mismo diálogo (#299).
- Los montos se leen igual en toda la App: el negativo lleva `−` y el color de negativo, el positivo con signo `+` y el de éxito, el cero queda neutro, y Inicio y Movimientos comparten el mismo mosaico de ingresos y gastos (#300).
- Las fechas y las horas siguen el idioma del perfil en cualquier pantalla: un solo módulo de formato, sin `es` fijo ni fechas escritas a mano (#301).
- Los detalles de cuenta, institución y progreso comparten el mismo encabezado (media, título, insignia y subtítulo), y los títulos de sección de conciliaciones, suscripciones, patrimonio, corte de tarjeta, enlace público y estado de cuenta importado usan la tipografía de sección (#302).
- Las píldoras, los anillos de progreso y los círculos de icono son componentes únicos: la píldora del tipo de tarjeta es la misma en la card completa y en la fila, el contador de no leídas es un badge y los anillos de una meta y de una suscripción comparten el mismo anillo (#303).
- Los controles de pestañas y segmentados son uno solo: los filtros de notificaciones usan el control segmentado y el avatar de «Editar cuenta» se elige en la misma rejilla de opciones, en cuatro columnas; el carrusel de meses queda como control propio (#304).
- Los estados vacíos, de carga y de error son compartidos: un picker sin resultados muestra el vacío compacto, las cards en carga usan el mismo esqueleto y Notificaciones y Ajustes › Privacidad ofrecen «Reintentar» cuando falla la carga (#305).
- Los avisos y los toasts van por el mismo camino: ningún módulo habla con el toast por su cuenta, el aviso de advertencia usa la variante de advertencia y un mismo fallo dice el mismo texto en cualquier pantalla (#306).

- La pila de instituciones de Productos y su vista desplegada son ahora un solo contenedor: **Desplegar** y **Apilar** mueven cada card entre las dos disposiciones sin desmontarla y la card al frente es la que queda centrada; las flechas y los indicadores viven debajo de las cards, se pintan una vez y no se reinician al alternar. En la vista desplegada las flechas, los indicadores y el arrastre de la card centrada cambian de institución, de una en una, y con movimiento reducido el cambio es inmediato (#249).
- «Novedades» lista todas las versiones con cambios visibles que no has visto, de la más nueva a la más antigua y con su número como encabezado, en lugar de solo la última: las versiones que solo dicen «Sin cambios visibles» no aparecen, si todas son así no se abre nada, y con más de diez se muestran las diez más recientes y cuántas quedan fuera. La hoja se abre por ruta (`?sheet=release-notes-sheet`), espera si otra hoja ocupa la URL y marca la versión actual al cerrarla, con Atrás o con «Entendido» (#260).
- Los menús de opciones de meta, cobro y presupuesto, el menú de un aporte, el retiro de una meta y el detalle de un cobro compartido se abren por ruta, con el registro en `sheetId` (#254).
- «Descuadres», «Sin conciliar» y el glosario abren por ruta; el término va en `sheetId`, así Atrás y recargar devuelven la misma explicación (#252).
- El extracto de tarjeta, la amortización y el detalle de cuota, los filtros de movimientos, «Vincular movimiento» y «PDF con clave» se abren por ruta, con el registro elegido en `sheetId` cuando lo hay; el PDF con clave se cierra solo al recargar porque el archivo no sobrevive (#253).
- El comercio permite unir desde una hoja por ruta y la vista previa de captura rápida también: las dos se cierran solas al recargar si su contenido no está en la URL (#255).
- Las hojas de preferencias de notificaciones y de Keep Awake (ayuda, alerta, historial y recordatorio) se abren por ruta; el horario silencioso es un selector anidado de las preferencias y el aviso de recordatorio escribe su clave al dispararse (#258).
- Los ajustes de Finanzas abren cada hoja por ruta (`?sheet=finance-settings-<ajuste>-sheet`), y Cambiar y Agregar moneda también (`change-base-currency-sheet` y `add-currency-sheet`); el vaciado comparte la clave `wipe-data-sheet` en Privacidad y en Finanzas, su institución de saldo es un selector anidado (`?picker=wipe-balance-institution-sheet`) y las confirmaciones siguen sin ruta (#256).
- La bandeja de recurrentes se abre como selector anidado del sheet de detección (`?picker=archive`), el orden y los filtros de suscripciones ya viajan en la URL, y se elimina el sheet `recurring-sheet.tsx`, que no se usaba (#257).
- Los selectores abiertos desde un sheet (moneda, color, categoría, país, cuenta, institución y calculadora) llevan su propia clave en la URL (`?sheet=…&picker=…`): Atrás cierra solo el selector, el formulario conserva lo escrito y recargar reabre el sheet y su selector (#251).
- La calculadora de importes (`?picker=calculator-<monto>`, con una clave por monto visible) y el selector de país de una institución (`?picker=country`) se abren por ruta en cualquier formulario, y el historial de Keep Awake se abre por ruta también con un navegador que no admite mantener la pantalla despierta (`?sheet=keep-awake-history-sheet`). Ninguna hoja de Finanzas queda con estado local y la regla de hoja por ruta menciona las claves de Ajustes (`SETTINGS_SHEET_KEYS`) (#250).
- Productos usa un solo nombre por cifra, con su ayuda del glosario: «Patrimonio neto» en el hero, «Patrimonio» en la institución, «Saldo» en la cuenta, «Disponible» y «Deuda» en la tarjeta y «Deuda» en el préstamo; «Sin conciliar» tiene su propia entrada y lista solo productos con saldo pendiente, sin repetir institución ni moneda (#293).
- Cada patrón de UI remite a un solo componente canónico: nueva tabla «patrón → componente» en `ui-components.md`, regla `ui-single-source.mdc` y enlaces desde `AGENTS.md` a las galerías de Apariencia (#308).
- Toda hoja se abre por ruta: la regla vive en `.cursor/rules/sheet-url-route.mdc`, enlazada desde `AGENTS.md`, `ui-components.md` y las reglas de sheets compartidos y de formulario en hoja; los diálogos de confirmación siguen cerrando con Esc y no con clic fuera (#261).
- Intelligence refleja el avance persistente de Gmail en vivo, explica por qué se detuvo, permite reconectar y vaciar el corpus con confirmación antes de reiniciar desde 2026-01-01 (#205, #318).
- La espera por límite de Gmail muestra una cuenta regresiva al siguiente reintento y el estado de conexión de las actualizaciones WebSocket (#318).
- La cola de revisión filtra Todos, Entrenamiento, Validación y Holdout; cada badge cuenta solo mensajes pendientes (#206, #317).
- Intelligence organiza correo, revisión y análisis en pestañas; resume corpus y particiones en badges, muestra el rango histórico desde el 1 de enero de 2026 y lista los correos en orden ascendente por fecha (#206).
- La cola de revisión también ordena los correos por fecha recibida ascendente (#206).
- `src/shared/components` se reorganiza por responsabilidad: `ui/` queda solo con shadcn y los componentes propios pasan a `shell/` (con `shell/header/`), `forms/`, `sheets/`, `fab/`, `feedback/`, `data-display/` y `settings/`; `ReleaseNotesSheet` pasa a `src/modules/settings` (#315).
- Se reescribe el README con banner, funciones por app, stack, arquitectura, scripts y enlaces a los repos hermanos; se añade licencia MIT y archivos de comunidad (CONTRIBUTING, SECURITY y plantilla de PR) (#313).
- El cliente deja de repetir los identificadores y las dependencias del vaciado: se retira `wipe-layers.ts` y la lista usa `GET /users/me/data/branches` con los conteos y lo que arrastra cada rama; las etiquetas, descripciones e iconos viven en un solo mapa de textos por identificador (#270).

### Corregido

- #513: en móvil, Productos apila el anillo y su leyenda para que los nombres y montos se lean completos, y las tarjetas por moneda pasan a una columna con el monto sin partir la moneda de la cifra.
- #519: el hero de una tarjeta de crédito sobregirada muestra la deuda con su etiqueta, no el disponible negativo; una tarjeta con límite disponible sigue mostrando «Disponible» y una de débito, «Saldo».
- #520: la pestaña Correos de Inteligencia muestra el total de correos en revisión que devuelve la cola, no solo los de la página cargada; mientras el total no está disponible, el texto no lo presenta como cero.
- #511: los totales de Ingresos y Egresos del mes en el detalle de una cuenta incluyen los movimientos de sus tarjetas de débito, igual que la lista de la pantalla, y el hero aclara que no cuentan las transferencias.
- #510: las filas de «Movimientos del ciclo» de un estado de cuenta muestran el monto cuando el API no trae el importe del ledger pero sí el original, y si no hay ninguno muestran una raya sin el signo suelto.
- #498: las listas de Notificaciones, Papelera, la cola de revisión y los grupos de revisión conservan las filas cargadas cuando falla la siguiente tanda o un refresco en segundo plano; el fallo se avisa al pie con reintento (`InfiniteListErrorFooter`) y solo sin filas se cambia la lista por el estado de error completo.
- #509: la cabecera de una hoja reserva el ancho de sus acciones y de la ayuda del glosario, así el título y el subtítulo ya no quedan debajo de los botones en móvil ni en el panel lateral. El subtítulo usa el espacio libre y parte en varias líneas cuando hace falta.
- #507: el historial de conversaciones del agente solo se abre cuando se pide; el chat ya no queda cubierto por una hoja vacía al abrirlo desde una institución, un movimiento o Suscripciones.
- #471: los cuatro tabs de Planificación caben completos en 390 px con el icono encima del texto, y en Análisis cada fila deja el icono y el título primero con «Comparar» como acción al final, ya con icono.
- #469: el botón flotante de Finanzas reserva su carril derecho en escritorio y deja de tapar el badge de variación de Instituciones y los contadores al final de las filas en Productos, Movimientos, Planificación y Suscripciones.
- #467: Uso agrupa el desglose **por remitente** en vez de presentar dominios como bancos, describe la pantalla sin hablar del back, pinta el reinicio con el formato de fecha de la app y muestra «< US$0.0001» cuando el costo existe pero queda por debajo de la precisión visible.
- #466: los programados de Movimientos muestran el badge «Programado» dentro de la fila, el texto secundario pasa a otra línea en vez de cortarse y las tarjetas de Ingresos y Gastos del resumen del mes dejan de tocar los bordes en móvil.
- #464: la cara de la tarjeta de crédito en el detalle muestra el disponible (`availableCredit`) bajo «Disponible», no la deuda. Un sobregiro sale negativo, igual que en la barra de utilización y en Productos, y la tarjeta de débito sigue mostrando «Saldo». El hero, la barra y las filas leen el mismo valor (`cardDisplayAmount`).
- #465: el detalle de un movimiento ya no muestra «Cuenta: Sin cuenta» cuando el movimiento es de tarjeta ni «Tarjeta: Sin tarjeta» cuando es de cuenta; pinta solo el producto que toca, o su nombre si no está en el catálogo cargado. El id de la señal de correo pasa debajo de la etiqueta y se parte en varias líneas, así que «Señal de correo» se lee completa en 390 px. La carga inicial sigue esperando el bootstrap de sesión (`GET /users/me`) y después el detalle (`GET /finance/transactions/:id`); no se encontró una petición lenta propia del detalle.
- #449: la guía del contrato (`docs/infrastructure/api-contract.md`) explica de dónde sale la copia versionada y cuándo es seguro sincronizarla: `pnpm api:contract` solo después de que el back regenere su `swagger-spec.json`, y con los tipos del cliente actualizados en el mismo cambio. La copia actual (181 rutas y 291 schemas) se generó desde el código del back en #445; el back publica 183 rutas y 296 schemas desde personal-os-back#419.
- El detalle de un correo descartado explica que el remitente no es un banco del piloto y que el texto no alcanzó para clasificarlo, con su icono y su título propios, en vez de mostrarlo como «Sin señal» (#402; contrato de back #408).
- #437: el filtro de remitente de conectar Gmail valida el mismo patrón de dominio y el mismo máximo de 120 caracteres que la API antes de habilitar «Conectar», y el campo explica qué corregir. Antes, un texto que no era un dominio o que pasaba de 120 caracteres se enviaba y volvía como error 400.
- #431: el CI corre en el runner self-hosted con `pull_request`; los PRs usan el workflow del merge y el push a `develop` o `master` el de la rama.
- #289: retira de la tabla la referencia a la card de sincronización de Finanzas que ya no existe y señala el estado integrado actual de Gmail en Intelligence.
- Al cerrar desde un movimiento importado la hoja del correo de origen, se vuelve al detalle del movimiento y se conserva el estado de navegación (#389).
- Cerrar el detalle de un correo de Inteligencia reescribe la URL en vez de retroceder: Atrás ya no sale de Inteligencia ni reabre el panel, y la vista se queda en Revisión con el panel cerrado (#376).
- El detalle de un correo muestra las representaciones «Canónica» y «Saneada» completas, sin el recorte de 320 px con scroll interno que las dejaba a medias; el panel es el único que se desplaza (#376).
- Cuando el API marca que la conexión de Gmail necesita reconectar, Inteligencia lo dice en el subtítulo de la cuenta y en la última sincronización («Reconecta Gmail», «Detenida: reconecta Gmail») y el aviso del último fallo titula «Reconecta Gmail»; no se agrega un aviso aparte (#375).
- El vaciado de datos valida la contraseña con un botón «Verificar» que habilita «Vaciar datos» al terminar; ya no depende de que el campo pierda el foco (#365).
- Cuando la contraseña del vaciado o de eliminar la cuenta no coincide, el aviso se muestra en español con el mapeo de errores de Auth de la app, sin mensajes en inglés del proveedor (#365).
- El vaciado muestra un toast de éxito con las ramas y las filas afectadas, y lo publica antes de refrescar la caché para que el cierre de la hoja no lo oculte (#368).
- El FAQ de Ayuda y el subtítulo de Vaciar datos de Finanzas dejan de anunciar una rama «Correo»: AI-0 retiró los correos importados y las conexiones de Gmail de las ramas, el cliente ya no guarda sus etiquetas y el correo importado se vacía desde Inteligencia (#269).
- La lista de correos de Inteligencia deja de pedir todas las páginas cargadas al recibir un evento de sincronización o al volver a la ventana: conserva lo cargado, ofrece «Hay correos nuevos» para recargar desde la primera página, limita a una la petición de página siguiente en vuelo y, ante un 429, mantiene la lista visible, espera `Retry-After` o un retroceso acotado y se recupera sin recargar (#351).

- La vista previa de Revisión y Modo foco decodifica las entidades HTML y descarta los caracteres invisibles del cuerpo saneado; un correo que empieza con `&#847;` o `&shy;` ya no muestra solo el primer número visible (#337).
- La cola ADMIN de Conocimiento solo pide `/knowledge/admin/queue` cuando el rol es ADMIN; un usuario normal ve el aviso de permisos sin generar un 403 en la consola (#347).
- Inteligencia comparte un solo canal en vivo con las notificaciones de la app, renueva el token de Supabase y se reconecta si el servidor cierra la conexión; el progreso de Gmail sigue llegando aunque las notificaciones dentro de la app estén apagadas (#350).
- Inteligencia separa el historial inicial del estado de la última sincronización: muestra la causa, el código y la hora del intento fallido, solo ofrece reconectar ante un rechazo de autorización, avisa si la configuración OAuth está incompleta y etiqueta el canal en vivo como canal de actualizaciones; mientras hay un error visible, la vista se refresca cada 30 s aunque el canal esté desconectado (#349).
- El aviso al revocar la contribución al conocimiento global confirma que la evidencia ya no contribuye; al activarla, que contribuirá en el próximo rebuild (#239).
- El formulario de `/login` se pinta desde el HTML y queda deshabilitado —con «Preparando…» en el botón— hasta que React hidrata: antes el primer pintado era solo un spinner y un clic en ese hueco no hacía nada ni mostraba error. Login y registro son formularios reales, así Enter envía desde la contraseña y el aviso del navegador «Password field is not contained in a form» desaparece (#345).
- El detalle de una verificación CORRECTED muestra la Relevancia corregida junto al tipo semántico y los dominios (#323).
- La sección «Cruda» del detalle del correo empieza plegada y se despliega al pulsarla (#323).
- Movimientos abre el selector de mes en el mes actual aunque la pantalla monte después de cargar el perfil: el primer centrado del chip es inmediato y ya no se queda al principio de la tira (#325).
- Los atajos del hero de Suscripciones vuelven a la tarjeta clara con borde y dejan de recortar su etiqueta: se leen completos en claro y oscuro, en reposo y con hover (#326).
- Suscripciones vuelve a cargar: el atajo Calendario pinta su indicador de espera dentro del enlace, así el botón deja de romper la vista (#324).
- Los selectores de Revisar muestran el nombre en español después de elegir relevancia, tipo de correo, tipo de transacción o dirección (#319).
- Los selectores de categoría del presupuesto y de categoría y destino de la vista previa de Captura rápida se abren por ruta (`?picker=`): Atrás cierra solo el selector y el formulario conserva lo escrito (#250).
- Productos deja de usar el margen negativo que ocultaba el balance bajo la cabecera y presenta Atajos como una subsección compacta (#262, #297).
- Cerrar con Atrás la hoja de modo, estilo o color primario descarta el borrador y devuelve la apariencia guardada, igual que «Cancelar» (#160).
- Los botones de atrás, de opciones y la insignia de las cabeceras de color se leen sobre el fondo, y la decoración de las cards de cuenta ya no se sale como semicírculo gris (#245).
- «Registrar aporte» muestra el saldo libre de la cuenta de origen, avisa antes de registrar si el monto lo supera y bloquea el envío; el origen por defecto es la cuenta de la meta solo si tiene saldo libre, y el detalle explica «Apartado» con su entrada del glosario (#294).
- «Abonar a capital» propone la cuenta «Se paga desde» del préstamo, explica qué hace cada modo y la vista previa muestra la cuota nueva, el plazo y la fecha final; cuando el abono no quita una cuota entera, avisa de que el plazo no cambia y baja la última cuota (#296).
- Planificación y Productos pulen textos: los conteos usan singular y plural («1 cuenta»), la lista de cuotas parte en dos líneas sin cortarse, la card del préstamo etiqueta la tasa («24 % anual») y su anillo dice «pagado», las pestañas de Planificación muestran su nombre y el enlace al Centro de ayuda del glosario cumple contraste (#297).
- El hero de Productos recupera el anillo y su leyenda, con un selector de moneda: grafica por defecto la base, o la primera con saldo si la base no tiene, y recalcula centro y leyenda con los montos nativos de esa moneda, sin convertir; las tarjetas «Por moneda» pasan debajo como complemento (#248).
- El resumen de Productos muestra una línea «Por cobrar» por moneda con los cobros pendientes que ya suman al total, con su entrada del glosario, para que el total cuadre con las instituciones; los dudosos no se suman (#291).
- La fila de una tarjeta de crédito en Productos muestra utilización, deuda y límite junto al disponible, y conserva «Balance incompleto» cuando falta el límite; el cálculo de deuda pasa a `shared/lib/card-balances.ts` para que la fila y el detalle de la tarjeta usen la misma regla (#292).

### Eliminado

- Se retiran `SelectionGrid`, el módulo de formato de fechas sin uso, el mosaico duplicado de Inicio y Movimientos y el diálogo de confirmación propio de los movimientos, reemplazados por sus componentes compartidos (#300, #301, #304, #306).

- Se retiran la conversación de IA, sus sesiones y preferencias dedicadas, y la sincronización de Gmail del cliente (#193).
- Se quitan las consultas, prefetch, formularios, galería y vínculos de navegación que dependían de esas rutas.
- Se retiran los ajustes, opciones de vaciado y textos de ayuda de Gmail y de historial de chat que el backend ya no ofrece.

## [0.61.0] - 2026-10-24

### Agregado

- La suscripción se muestra compacta en los pagos próximos, las alertas y el «Restante del mes» del calendario, y el detalle abre con su card completa (#279).
- La categoría se muestra como chip con su emoji, su color y su importe donde se menciona: Inicio, el resumen y las cards de suscripción y comercio (#280).
- El estado de cuenta de una tarjeta y los extras de una importación usan la fila canónica del movimiento, con signo y color (#284).
- Los recurrentes detectados y su archivo, las bandejas de correo, las fuentes, los correos pendientes y el historial de sincronización se muestran con cards y su estado (#286).
- Patrimonio muestra la card compacta de cada cuenta, tarjeta, préstamo y cobro, con la deuda de la línea y las marcas de descuadre y conciliación (#285).
- Las vistas previas de los formularios de institución, tarjeta y cuenta son las cards reales con los valores del borrador (#288).

### Cambiado

- La tabla «entidad → card → variantes» y la regla de una sola fuente de verdad viven en `docs/architecture/ui-components.md` y se enlazan desde `AGENTS.md` (#289).
- La galería `/dev/cards` ya no anuncia borradores que son cards reales y documenta el chip, la compacta de suscripción, las cards de correo y sincronización y el patrimonio.

## [0.60.1] - 2026-10-23

### Cambiado

- Interno: los modelos de card de meta y presupuesto ya no repiten en comentarios lo que su nombre y su tipo dicen. Sin cambio de comportamiento.

## [0.60.0] - 2026-10-23

### Agregado

- La galería `/dev/cards` es permanente, sin el aviso de provisional, con índice `/dev` y la marca «Borrador» en lo que aún no tiene card definitiva (#272).
- Institución y efectivo se eligen como card compacta, con conteos, saldos por moneda, selección y estados deshabilitados (#274).
- La cuenta se muestra con su card compacta cuando es un dato de otra entidad y en «Cuenta o tarjeta» (#275).
- La tarjeta se muestra compacta en «Cuenta o tarjeta», en los vencimientos de Inicio y en el método de pago de una suscripción (#276).
- El préstamo se muestra compacto en la vinculación de un movimiento y en la cuota próxima de Inicio (#277).
- Meta, cobro y presupuesto se muestran compactos en la vinculación de movimientos y en los presupuestos en riesgo de Inicio (#278).
- Card de comercio con el tinte de su categoría, sus tres niveles y la insignia «¿Duplicado?» (#281).
- El detalle de un movimiento muestra la categoría como chip y las cards compactas de cuenta, tarjeta y comercio; la transferencia muestra origen y destino (#283).

### Cambiado

- Todos los listados de movimientos usan la misma fila; el chat ya no tiene una propia (#282).
- Meta, cobro y presupuesto se pintan con su componente y las cards comparten la superficie decorativa, sin cambios visuales (#273).

## [0.59.0] - 2026-10-23

### Agregado

- Galería provisional de cards en `/dev/cards` con todas las entidades del rediseño, sus variantes reales y datos de ejemplo; se abre desde un atajo en Inicio y se retira en #290 (#272).
- Las cards de institución, cuenta, tarjeta, préstamo, meta, cobro, presupuesto, suscripción, categoría y movimiento aceptan las variantes compacta e inline; sin la prop se ven como antes (#272).

## [0.58.9] - 2026-10-23

### Corregido

- Registro e inicio de sesión piden 6 caracteres como mínimo, la misma política que Supabase, en vez de 10; el aviso del formulario y el mensaje de error lo dicen igual (#247).

## [0.58.8] - 2026-10-22

### Cambiado

- Interno: la insignia de una suscripción se decide en un solo lugar (`subscriptionStatusBadge`), compartida por la tarjeta y el detalle, y el botón de editar depende solo del setter de la hoja (#245). Sin cambio de comportamiento.

## [0.58.7] - 2026-10-22

### Corregido

- Las fechas de Finanzas usan la abreviatura española de la app (`18 sep 2026`) en vez de la del ICU (`sept`) o el ISO; el detalle de un cobro, una meta o una suscripción ya no muestra `2026-11-20` (#245).
- El detalle de un movimiento muestra el comercio tal como se escribió, aunque exista un nombre canónico (#245).
- Las etiquetas de las celdas de elección y del menú de acciones caben completas en 390 px: «Arrastra sobrante y déficit», «Semestral», «Transferir», «Préstamo» y «Actualizar» dejan de recortarse (#245).
- La dona del calendario de suscripciones muestra el total completo en vez de truncarlo (#245).
- La insignia de estado de las cabeceras de color se lee sobre el fondo (#245).
- Editar una suscripción abre con el selector de fecha cerrado (#245).
- El formulario de alta de un movimiento mantiene `?type` en la URL acorde con el tipo elegido (#245).

## [0.58.6] - 2026-10-22

### Corregido

- La hora de un movimiento se muestra en la zona horaria del perfil en la lista, el detalle y el formulario, con la misma hora y el mismo día local cerca de la medianoche (#240).
- La cabecera de Planificación resume siempre la pestaña activa y la pestaña activa se lee con el contraste del tema, sin blanco forzado sobre el indicador claro (#241).
- Una suscripción activa con la fecha de cobro pasada se marca «Vencida» en la lista y en el detalle, y la hoja de próximos cobros aclara qué revisar cuando no hay cobros futuros (#242).
- Pausar una suscripción pide confirmación con el mismo diálogo que cancelar; reanudar sigue siendo inmediato (#243).
- El detalle de un presupuesto pinta su cabecera con los datos que la lista ya trajo y consulta el detalle y sus movimientos en paralelo (#244).

### Cambiado

- Las hojas de crear y editar suscripción y la de registrar un pago se abren por la URL, no solo con estado local, igual que el resto de hojas de Finanzas (#243).

## [0.58.5] - 2026-10-22

### Cambiado

- Interno: Productos y Patrimonio comparten el aviso de «sin desglose por moneda» y el texto de la tarjeta de un cobro se arma antes del JSX; se retira un helper sin uso (#238). Sin cambio de comportamiento.

## [0.58.4] - 2026-10-22

### Corregido

- Productos, Patrimonio y la pestaña Cobros de Planificación ya no caen en la pantalla de error cuando la respuesta del API viene incompleta: si falta el desglose por moneda, la vista muestra el balance disponible y un aviso; un cobro con un monto ilegible se marca como no disponible y no suma a los totales, sin tumbar los demás (#238).
- La cifra de gastado de un presupuesto coincide con la lista de sus movimientos porque ahora el servidor la suma al leer, no la toma de un contador guardado (back#172, web#239).

### Cambiado

- Next.js sube a 16.4.2 y `eslint-config-next` a la misma versión; la auditoría de producción deja de reportar avisos críticos y altos de Next.js (#236).

## [0.58.3] - 2026-10-22

### Corregido

- Los errores de inicio de sesión y registro se muestran en español según el código de Supabase; las credenciales inválidas no revelan si falló el correo o la contraseña, y un código sin traducir deja el mensaje de respaldo de la operación (#247).
- Registro e inicio de sesión exigen la misma política que Supabase —10 caracteres con mayúscula, minúscula y número— antes de enviar el formulario, en vez de 8 caracteres sin minúscula (#247).

## [0.58.2] - 2026-10-22

### Agregado

- Interno: `.infisical.json` y `pnpm env:pull` traen las variables locales del proyecto `personal-os`; `docs/operations/runbook.md` documenta que Infisical es la fuente de verdad y que Vercel se llena por sync.

### Eliminado

- Interno: se retira `docs/resumen-issues-2026-10-18.md`, desactualizado.

## [0.58.1] - 2026-10-21

### Corregido

- Guardar una preferencia de Apariencia usa la mutación del perfil: si falla la red, la hoja sigue abierta con el aviso y el borrador se puede reintentar o descartar (#160).

## [0.58.0] - 2026-10-21 - Apariencia

### Agregado

- Apariencia separa modo, estilo visual y color primario. El estilo se elige en un selector con vista previa y el registro permite agregar estilos sin tocar componentes (#160).
- El color primario se elige de una paleta curada o con el selector de color; el texto sobre él se ajusta para mantener contraste (#160).
- La apariencia se guarda en el perfil con versión y se aplica antes del primer pintado en el mismo dispositivo (#160).

### Corregido

- Cancelar en la hoja de modo cierra la hoja y revierte el cambio, sin salir de Apariencia (#160).

## [0.57.0] - 2026-10-21 - Préstamos y metas

### Agregado

- El asistente de préstamo acepta un nombre o alias opcional y la cuenta donde entró el capital; la lista y el detalle prefieren el alias y muestran la cuenta de desembolso (#181, #182).
- El detalle de una meta de ahorro muestra su cuenta asociada y el monto apartado, y ofrece **Retirar** con cuenta de destino; el historial distingue aportes y retiros (#188, #189).
- El detalle de la institución **Efectivo** tiene menú propio, pestañas **Cuentas** y **Préstamos** (solo lectura, préstamos sin banco) y el saldo por moneda vive en el header (#213).

### Cambiado

- El alta de un préstamo avisa cuando el capital no entró a ninguna cuenta.
- Un retiro mayor a lo apartado se bloquea con el máximo visible.
- Aportes, retiros y desembolsos refrescan las cuentas y el patrimonio.

## [0.56.1] - 2026-10-21

### Corregido

- El detalle de institución muestra el saldo por moneda cuando hay más de una y, con una sola moneda distinta de la base, lo muestra en esa moneda. El hero, la tarjeta y el detalle usan las mismas líneas nativas.

## [0.56.0] - 2026-10-21 - Operación diaria

### Agregado

- Al registrar un gasto, si su categoría tiene presupuesto vigente y el gasto supera lo disponible, la app muestra el exceso y pide confirmación antes de guardar (#198).
- Movimientos agrega una sección **Programados** con la próxima cuota de cada préstamo y los próximos cobros de las suscripciones, sin alterar los totales del mes (#210).
- Productos y Suscripciones agrupan los totales por moneda cuando hay más de una, en vez de mostrar una cifra única convertida (#178, #183).

### Cambiado

- Las tarjetas de institución muestran una línea de balance por moneda; el hero de Productos y el resumen de Suscripciones hacen lo mismo (#178, #183).
- Los importes de cada moneda se muestran en su propia moneda, sin conversión, y los cobros dudosos siguen fuera del patrimonio.

## [0.55.0] - 2026-10-21 - Patrimonio

### Agregado

- Vista de patrimonio en `/finance/wealth`, con el total, **Disponible** y **Por cobrar**, y el desglose por moneda de cuentas, efectivo, cobros, tarjetas y préstamos (#218, #173).
- El patrimonio incluye los cobros vigentes y muestra los cobros vencidos hace más de 90 días en un bloque **Dudosos** que no suma; la decisión queda en el ADR-005 (#207).
- Indicadores **Descuadres** y **Sin conciliar** con sus hojas, la diferencia por producto y las acciones Recalcular y Revisar movimientos (#215).
- Los «?» de descuadre, conciliación, patrimonio y dudosos abren la entrada del glosario del Centro de ayuda (#229, #219).
- Las tarjetas de institución y de efectivo muestran un punto rojo si hay descuadre y uno ámbar si falta conciliar (#215).

### Cambiado

- El detalle de cuenta y de tarjeta usa el mismo aviso compacto de irregularidades; se eliminan las cards rojas y los badges sin acción (#215).
- El detalle de institución muestra los indicadores de sus productos (#215).

## [0.54.2] - 2026-10-21

### Corregido

- Un gasto que deja una cuenta de efectivo en negativo se bloquea con el saldo disponible; en una cuenta bancaria, la app muestra el saldo que quedaría y pide confirmación antes de guardar (#193).

## [0.54.1] - 2026-10-21

### Cambiado

- Interno: el Centro de ayuda comparte el estilo de sus enlaces y normaliza una sola vez el término de la URL. Sin cambio de comportamiento.

## [0.54.0] - 2026-10-21

### Agregado

- Centro de ayuda en `/help` con glosario buscable, guías paso a paso y preguntas frecuentes, con entrada desde Ajustes → Ayuda (#227).
- Glosario de los conceptos que aparecen en pantalla, con sinónimos, términos relacionados y enlace directo por término en `/help/glossary?term=…` (#228).
- Guías de instalación en Android, iPhone y escritorio, y primeros pasos (#230).
- Guías de Finanzas y Ajustes: conectar el correo, conciliar, importar un estado de cuenta, presupuestos, metas de ahorro, préstamos, cobros, tarjetas, suscripciones y notificaciones (#231).
- Preguntas frecuentes agrupadas por cuenta, finanzas, correo, notificaciones y privacidad; las respuestas enlazan al glosario y a las guías (#232).

### Cambiado

- La sección «Módulos» de Ajustes pasa a llamarse «Apps», como el resto de la interfaz.
- La búsqueda sin mayúsculas ni acentos vive en `src/shared/lib/search-text.ts` y la comparten Finanzas y el Centro de ayuda.

## [0.53.0] - 2026-10-21

### Agregado

- Preferencias regionales con el primer día de la semana en el perfil: los calendarios lo usan y Finanzas y Agenda dejan de tener su propio ajuste (#223).
- Zona de peligro en Ajustes de Finanzas para vaciar solo los datos de ese módulo, con confirmación (#226).

### Cambiado

- Las fechas, las tasas, los porcentajes y los montos siguen el idioma y la región del perfil; la entrada de montos acepta coma o punto (#223).
- Ajustes de Finanzas pasa a una lista corta con accesos a Categorías, Monedas y Conciliación y una hoja por sección; el Guardar sigue siendo único (#225).
- Privacidad y datos vacía todos los datos desde una hoja con confirmación, sin selector de capas por módulo (#224).

## [0.52.1] - 2026-10-21

### Corregido

- La hoja de Idioma muestra el idioma guardado al abrirse, aunque el perfil termine de cargar después; antes podía quedar seleccionado otro idioma (#222).

## [0.52.0] - 2026-10-21

### Cambiado

- Ajustes se organiza como una lista de secciones: Perfil y cuenta, Preferencias regionales, Apariencia, Asistente IA, Notificaciones, Privacidad y datos, y Módulos. Cada sección abre su propia vista y se vuelve con la flecha (#222).
- La zona horaria, el idioma y la moneda por defecto quedan en Preferencias regionales; el tema en Apariencia; los canales, el horario silencioso y el push en Notificaciones (#222).

## [0.51.1] - 2026-10-21

### Corregido

- La gráfica de Productos separa activos y deudas: cada grupo suma 100 % por su cuenta, las deudas ocupan la mitad izquierda y el total conserva el signo del patrimonio neto. Con todo en cero muestra un estado vacío (#214).

## [0.51.0] - 2026-10-21

### Agregado

- La lista de Apps dice «Pendiente de guardar» mientras el interruptor del panel está encendido sin guardar. Al guardar pasa a Activo y, si se descarta, vuelve a su estado real (#166).

### Cambiado

- El botón Guardar del panel de una app se destaca y la fila de activación avisa que falta guardar (#166).
- Salir de los ajustes de una app con una activación sin guardar pide confirmación antes de descartarla (#166).

## [0.50.1] - 2026-10-21

### Corregido

- Los totales de Cobros ya no cuentan un cobro con el monto ilegible como cero: la pantalla falla de forma explícita y nombra el cobro, en vez de mostrar una cifra inventada (#191).

## [0.50.0] - 2026-10-21

### Agregado

- Cobros muestra arriba de la lista el total pendiente y el cobrado de cada moneda; se recalculan al crear o registrar un cobro y una moneda sin cobros no aparece (#191).

### Corregido

- Guardar el perfil cierra la hoja de inmediato y el nombre o el avatar se ven al instante: el PATCH sigue en segundo plano y, si falla, vuelve el valor anterior con un aviso (#168).

## [0.49.6] - 2026-10-21

### Corregido

- «Marcar como pendiente» y «Reversar» piden confirmación antes de tocar el saldo: el aviso nombra el monto y la cuenta o tarjeta afectada, y al cancelar no cambia nada (#195).

## [0.49.5] - 2026-10-21

### Cambiado

- El detalle de una suscripción se parte en encabezado, pestañas de resumen, pagos y precio, y acciones de estado; cada pestaña pide sus propios pagos (#154).
- La lista de Planificación delega cada pestaña en su componente y el botón de crear en uno propio; la leyenda de lo que falta pasa a una lib con pruebas (#154).
- Notificaciones separa filtros, lista agrupada, estado vacío, menú y hoja de configuración en archivos propios (#154).
- El formulario de institución separa el catálogo del primer paso, el paso de productos, la tarjeta de vista previa y las secciones del formulario; la selección por grupos del borrado de datos pasa a una lib con pruebas (#154).

Sin cambio de comportamiento visible.

## [0.49.4] - 2026-10-21

### Cambiado

- La fecha con su interruptor de estado se escribe una sola vez y la usan el formulario de movimiento y el de transferencia; antes cada uno tenía su copia (#154).
- Las secciones de importe de transferencia y de saldos de tarjeta, y el menú de la institución, reciben sus datos y acciones agrupados en vez de una lista larga de parámetros sueltos (#154).

Sin cambio de comportamiento visible.

## [0.49.3] - 2026-10-21

### Corregido

- Novedades lista la entrada de esta entrega con el sobrante de un cobro y el aviso de sobrepago; 0.49.2 se publicó sin esa entrada (#190, #154).

## [0.49.2] - 2026-10-21

### Corregido

- Un separador de miles en el monto de un cobro deja de leerse como decimal: pagar 3,003 sobre 3,000 avisa que sobran DOP 3.00 en vez de una cifra absurda (#190).
- El aviso de sobrepago muestra el sobrante en la moneda del cobro y deja elegir a qué otro cobro abierto va la diferencia; antes la opción «A otro cobro» no tenía destinatario y no se podía completar (#190).
- El aviso ya no ofrece «A otro cobro» cuando no hay otro cobro abierto en esa moneda (#190).

### Cambiado

- Los formularios de movimiento, transferencia y tarjeta, el detalle de institución y el detalle de movimiento se parten en piezas de una sola responsabilidad. Rutas, formularios y mensajes no cambian (#154).

## [0.49.1] - 2026-10-21

### Corregido

- Al pasar una cuenta a tipo Efectivo, el formulario deja la institución en Efectivo en vez de descartar en silencio el banco elegido un momento antes (#172).
- El formulario de Gasto abre sin el selector de categorías desplegado, así que el campo Comercio queda visible; el selector aparece al tocar la categoría (#177).
- Al confirmar el monto, el formulario sigue llevando al destino aunque la categoría se haya dejado para después (#177).

## [0.49.0] - 2026-10-21

### Agregado

- La zona horaria del perfil se edita en Ajustes → Cuenta → Zona horaria, con buscador sobre todas las zonas del navegador (#162).
- La primera vez que se abre la app, la zona se toma del navegador y queda guardada en el perfil; una zona elegida a mano nunca se sobrescribe (#162).

### Corregido

- Los movimientos se envían como instantes reales y se muestran en la zona del usuario, así que el ajuste de saldo que crea la conciliación deja de aparecer con otra hora (#211).
- El historial de un instrumento y las transferencias muestran la hora en la zona del usuario, no la de UTC (#211).

### Cambiado

- El mes de Movimientos se corta por la zona del usuario en vez de por UTC, así que un movimiento de las 21:00 ya no cae en el mes siguiente (#211).

## [0.48.0] - 2026-10-21

### Agregado

- La sección de instituciones de Productos se despliega en un carrusel horizontal con todas las cards y vuelve a la pila con animación de empaquetar y desempaquetar. La elección se guarda en el navegador y el carrusel arranca en la card que estaba al frente (#209).

### Cambiado

- La pila de instituciones se mueve con un deslizamiento horizontal: a la izquierda avanza, a la derecha retrocede, en bucle y con un rebote al cruzar un extremo; el scroll vertical de la página no la mueve. En escritorio responden las flechas izquierda y derecha, y Enter abre la card frontal (#209).
- La sección de instituciones deja de ocultarse tras un encabezado colapsable: las cards quedan siempre a la vista y el encabezado solo lleva el título, la tendencia y el botón Desplegar o Apilar (#209).

### Corregido

- Las cards del carrusel de instituciones ya no se superponen y el toque abre la institución que se ve; el hueco entre cards no abre nada (#209).
- El primer toque después de deslizar la pila abre la institución en vez de perderse (#209).

## [0.47.10] - 2026-10-21

### Corregido

- El historial de una transferencia entre monedas muestra el monto recibido en la moneda de destino, con su signo y la tasa usada; el origen sigue mostrando lo que salió (#171).
- El monto de un movimiento o de una transferencia se marca en el campo cuando lleva más de dos decimales o pasa del tope permitido, en vez de fallar con un mensaje genérico (#194).
- Una cuenta de efectivo se guarda en Efectivo aunque el formulario venga de una institución de banco, sin el error genérico de antes (#172).

## [0.47.9] - 2026-10-20

### Cambiado

- Interno: el selector de categorías solo comunica el nombre escrito; el presupuesto crea, elige y cierra. La creación deja de devolver un valor y separa la escritura de la lectura (#199).

## [0.47.8] - 2026-10-20

### Cambiado

- Interno: el encabezado y los chips del banner de conciliación comparten una sola definición, y el alta de la categoría del presupuesto sale de la vista con un nombre propio. Sin cambio de comportamiento.

### Corregido

- El banner de productos sin conciliar desaparece cuando ya no queda ninguno, en vez de quedarse con el mensaje de todo conciliado (#205).

## [0.47.7] - 2026-10-20

### Cambiado

- Interno: el asistente de préstamo se reparte en el cálculo del plan (con pruebas), los componentes de cada paso y un contenedor que solo orquesta (#154).

### Corregido

- El banner de productos sin conciliar muestra la cantidad que lista, resume los que no caben como «+N más» y lleva a conciliar el producto al tocarlo o al tocar un chip (#205).
- El formulario de presupuesto ya no llega con una categoría elegida y el selector permite crear la categoría que se escribe (#199).

## [0.47.6] - 2026-10-20

### Cambiado

- Interno: el enlace al formulario de movimiento recibe un objeto (`type`, `destination`, `returnTo`), el selector del reparto de conciliación reutiliza sus opciones y el detalle de cuenta nombra el instrumento antes de pintar la fila. Sin cambio visible.

## [0.47.5] - 2026-10-20

### Corregido

- Al guardar un gasto o un ingreso, la app vuelve a Movimientos con el movimiento nuevo. Si el formulario se abrió desde una cuenta o una tarjeta, vuelve a ese detalle con el movimiento en su historial (#202).
- Una meta de ahorro muestra el avance real por encima del objetivo y el excedente, en vez de quedarse en 100%; el formulario de aporte avisa cuánto quedaría por encima de la meta (#187).

## [0.47.4] - 2026-10-20

### Agregado

- Skill `archify` en `.agents/skills/archify/` (registrada en `skills-lock.json`) para generar diagramas de arquitectura.
- Convenciones de issues en `docs/issue-conventions.md` y plantillas `.github/ISSUE_TEMPLATE/`.
- Convenciones de issues: regla contra issues espejo entre repositorios y secciones «Notas técnicas» y «Definición de terminado» en `docs/issue-conventions.md` y en las plantillas `feature.yml` y `bug.yml`.

### Cambiado

- `AGENTS.md` y `docs/README.md` enlazan las convenciones de issues y la nueva documentación. Sin cambios visibles en la app.
- Interno: el detalle de cuenta y de tarjeta reutiliza la fila de Movimientos en vez de su propio render, y el signo de una transferencia sale del instrumento que la muestra.

### Corregido

- El formulario de una suscripción muestra «Cuenta o tarjeta» como campo visible, avisa al guardar cuando queda vacío y el detalle de la suscripción lo indica con la acción de asignarlo (#203).
- El detalle de una cuenta y de una tarjeta usa el mismo tratamiento que Movimientos: los revertidos aparecen en gris con su badge y las transferencias con signo y color según el lado de la cuenta (#206).
- El reparto de una conciliación muestra las etiquetas traducidas (Impuesto DGII, Otro) y el monto completo en su campo, sin truncar decimales ni el signo (#208).

## [0.47.3] - 2026-10-20

### Cambiado

- Interno: el inicio del mes financiero sale a su propia sección en `settings/components/`, en vez de viajar dentro de los valores por defecto de captura. Sin cambio visible (#154).

## [0.47.2] - 2026-10-20

### Cambiado

- Interno: el formulario de configuración de Finanzas se reparte en secciones por tema en `settings/components/`; el formulario queda como contenedor del estado y del envío. Sin cambio visible (#154).

### Corregido

- La sección de aplicaciones del sidebar muestra solo las apps activas del usuario, en el orden del registro, y se actualiza al activarlas o apagarlas. Keep Awake sigue fijo (#165).
- La descripción del panel de Apariencia y las opciones de vista por defecto de Proyectos se leen en español: Tablero, Lista y Cronograma (#167).
- El detalle de la tarjeta muestra la utilización real por encima del 100% y avisa del sobregiro cuando el disponible queda en negativo (#175).
- El interés total del resumen del préstamo es la suma de las cuotas mostradas, y la última cuota aparece con su monto ajustado por el redondeo (#180).
- El diálogo para eliminar un movimiento lo nombra por su descripción e indica el monto antes de confirmar (#196).

## [0.47.1] - 2026-10-20

### Cambiado

- Interno: los tipos de Finanzas se agrupan por dominio en `shared/types/entities/` con un barrel, y el detalle de movimiento separa su bloque de transferencia y el aviso de reversión en componentes propios. Sin cambio visible (#154).

## [0.47.0] - 2026-10-20

### Agregado

- El detalle de una transferencia ofrece Confirmar, Marcar como pendiente y Reversar. Marcar como pendiente devuelve los saldos y habilita la edición; Reversar deshace lo aplicado y deja el registro como revertido (#192).
- Registrar el pago de una suscripción crea el gasto en su cuenta o tarjeta, lo vincula al historial del pago y avanza el próximo cobro. Sin método de pago no se registra (#197).

### Corregido

- El pago de una tarjeta aparece en Movimientos y en el historial de la cuenta y de la tarjeta; el saldo se puede reconstruir desde el historial (jarvinc3/personal-os-back#176).

## [0.46.0] - 2026-10-20

### Agregado

- El formulario de una transferencia entre monedas muestra la tasa del día, permite escribir otra tasa o el monto que realmente recibiste y enseña cuánto entrará en la cuenta destino antes de guardar. El monto recibido manda sobre la tasa (#169).
- El detalle de la transferencia muestra monto enviado, monto recibido y tasa. Si no indicaste ninguna, avisa que la tasa es la del día (#169).

## [0.45.9] - 2026-10-20

### Corregido

- Al crear una tarjeta de crédito, la app envía la deuda del formulario como crédito disponible: con «Saldo al corte» 0 la tarjeta nace sin deuda y con el límite completo disponible. Un saldo vacío cuenta como 0 (#174).
- La tarjeta de Finanzas en el inicio usa el mes completo, igual que Movimientos, así que incluye los movimientos registrados hoy y deja de mostrar 0.00 (#170).
- El mensaje de WhatsApp de cobros se escribe desde quien presta: saluda por el primer nombre, indica cuántos cobros son y el pendiente de cada moneda, y cierra con el enlace (#161).

## [0.45.8] - 2026-10-20

### Corregido

- El detalle de un préstamo abre aunque una cuota llegue sin un capital legible. El plan de amortización muestra la fila, deja el saldo restante en blanco y avisa dentro de la hoja, en vez de tumbar la pantalla completa (#179).

## [0.45.7] - 2026-10-20

### Corregido

- El detalle de una cuenta muestra los totales de ingresos y egresos del mes en la moneda de la cuenta. Un gasto de US$10 en una cuenta en dólares ya no aparece como USD 614.51: la cifra salía del equivalente en la moneda base (#204).

## [0.45.6] - 2026-10-20

### Corregido

- El detalle de un cobro mantiene visible la acción para registrar un pago después del primero, con la nota de novedades que exige la suite. Sustituye la 0.45.5, que no pasó el CI por no incluir esa nota (#184).

## [0.45.5] - 2026-10-20

### Corregido

- El detalle de un cobro mantiene visible la acción para registrar un pago mientras el cobro no esté cancelado ni castigado. Antes solo aparecía en el estado vacío y desaparecía con el primer pago (#184).

## [0.45.4] - 2026-10-19

### Cambiado

- Interno: la regla de hidratar una sesión guardada sale del hook de bootstrap a `shouldHydrateStoredSession()`, con pruebas. Sin cambio de comportamiento (#162).

## [0.45.3] - 2026-10-19

### Corregido

- El formulario de login aparece de inmediato: ya no espera a `bootstrapped` ni a `GET /users/me`. Un login o registro exitoso marca la app como lista aunque el bootstrap siga pendiente (#162).
- En `/login` no se hidrata una sesión guardada que el proxy ya descartó; una sesión vieja ya no bloquea el formulario ni puede revocar el login nuevo.

## [0.45.2] - 2026-10-19

### Corregido

- Los switches de preferencias de Ajustes y Notificaciones aplican el cambio al instante con actualización optimista; cada parche se calcula sobre la última caché y las mutaciones se envían en serie. Un clic rápido en varios switches ya no pisa el anterior (#163).
- Si el guardado falla, el perfil vuelve a su estado anterior y sale el toast de error.
- Cada pantalla envía solo la hoja que cambia, no el objeto completo de preferencias.

### Cambiado

- Interno: se quitó el `GET /users/me` extra después de cada `PATCH`; la respuesta ya trae el perfil completo.

## [0.45.1] - 2026-10-19

### Corregido

- Ajustes → Finanzas con la app desactivada ya no pide cuentas ni integridad: sin 403 en consola y sin «No se pudo guardar». La sección de integridad muestra el aviso para activar Finanzas, y al activarla funciona como antes (jarvinc3/personal-os-web#164).
- Un 403 por app desactivada se traduce a «Finanzas está desactivado. Actívalo para usar esta función.» en vez de «No se pudo guardar».

## [0.45.0] - 2026-10-18

### Agregado

- Planificación estrena cabecera con pestañas (Ahorros, Presupuestos, Cobros y Préstamos): muestra el total de la pestaña activa, una cifra por moneda sin convertir, y cambia al tocarla. Los enlaces de cobros compartidos abren en la pestaña Cobros.
- El formulario de una meta de ahorro muestra la cuenta vinculada y permite cambiarla.
- El detalle de una meta ofrece «Agregar aporte» en el menú y como botón sobre la lista.

### Cambiado

- Registrar un aporte desde otra cuenta ya no arma la web dos pasos: la API valida el saldo libre y crea la transferencia, y la app muestra el aviso si no alcanza.
- La fecha objetivo de una meta se puede quitar con «Sin fecha» y el cambio se guarda.
- Suscripciones usa el botón de acciones expandible del resto de la app; la campana de notificaciones, el espaciado de Movimientos y el borde de los banners quedan uniformes.

### Corregido

- Borrar un aporte deshace la transferencia que creó.
- Una transferencia entre cuentas propias avisa una sola vez.

## [0.44.0] - 2026-10-17

### Cambiado

- Cuentas: la API ya no devuelve el número completo, así que las listas y el resumen usan `accountNumberLast4`. Al editar, el campo aparece vacío con el aviso «Deja vacío para conservar •••• NNNN»; escribir un número nuevo lo reemplaza y dejarlo vacío conserva el guardado (jarvinc3/personal-os-back#139).

## [0.43.2] - 2026-10-17

### Cambiado

- Finanzas toma la configuración de módulos por ruta directa: el barrel de Ajustes sale de su grafo y desaparece el ciclo entre ambos.
- La lista de rutas `(app)` que exigen sesión vive en un solo arreglo en `proxy-routes.ts`.

## [0.43.1] - 2026-10-17

### Agregado

- Pantallas «en camino» para Agenda, Proyectos y Salud: `/agenda`, `/projects` y `/health` avisan que la app todavía no está construida y enlazan a su configuración.

### Cambiado

- La configuración de cada app (formularios, validaciones, monedas y horario de sincronización) vive en su módulo; Ajustes queda como marco general.
- Los `index.ts` de los módulos exportan solo hooks, tipos, componentes chicos y constantes; las pantallas se importan por ruta directa desde `app/`.
- `proxy.ts` valida la sesión con `getClaims()` en lugar de `getUser()`: sin viaje de red por navegación.

## [0.43.0] - 2026-10-17

### Agregado

- Compartir cobros por link público: la pestaña Cobros entra en modo selección con long-press o con la acción «Seleccionar», se eligen los cobros de una misma persona y el sheet «Compartir cobros» genera el enlace con «Copiar», «WhatsApp» y «Revocar link». El pendiente se muestra por moneda y nunca se convierte.
- Ruta pública `/c/[token]`: sin cuenta ni sesión, el deudor ve el total pendiente, una barra de progreso por moneda, la lista de cobros y el detalle de cada uno con su resumen, su nota y su historial de pagos. El link revocado, vencido o inexistente da el mismo aviso.
- La pantalla pública y su API quedan fuera de los buscadores (`noindex`).

### Cambiado

- El campo `description` del cobro se llama **Concepto** y es obligatorio (1 a 120 caracteres) al crear y editar.

## [0.42.4] - 2026-10-16

### Cambiado

- `pnpm test:coverage` mide todo `src` con c8 (`--all`), no solo los archivos que cargan las pruebas: 18 % de líneas y statements, 72 % de ramas y 46 % de funciones. El script fija esos umbrales y el paso de tests del CI corre la suite con cobertura.

## [0.42.3] - 2026-10-16

### Cambiado

- Zod 3.25.76 → 4.6.7, alineado con el back. `@hookform/resolvers` sube de 3.10.0 a 5.9.1: el `zodResolver` de la v3 lee `ZodError.errors`, que Zod 4 quitó, y devolvía el error en vez de los mensajes por campo.
- ESLint 9.39.5 → 10.12.0. `eslint.config.mjs` fija `settings.react.version` desde `package.json` porque `eslint-plugin-react` detectaba la versión de React con `context.getFilename()`, eliminado en ESLint 10.
- Otras subidas: `@base-ui/react` 1.9.0, `@supabase/supabase-js` 2.118.0, `@tanstack/react-query` 5.104.3, `react`/`react-dom` 19.3.1, `react-hook-form` 7.90.0, `postcss` 8.5.30 y `prettier` 3.9.10.

## [0.42.2] - 2026-10-16

### Cambiado

- `package.json`: la `description` queda breve y precisa; las dependencias que estaban en `latest` se fijan a la versión instalada del lockfile con `^` (`@hugeicons/core-free-icons`, `@hugeicons/react`, `class-variance-authority`, `next-themes`, `radix-ui`, `shadcn` y `tw-animate-css`).
- pnpm alineado con el back (`packageManager: pnpm@12.11.2`) y CI sin la versión fija 9.
- `pnpm audit --prod --audit-level=high` corre en CI con `continue-on-error`, sin bloquear el pipeline.

### Corregido

- `public/assets/favicon.svg` baja de 2.28 MB a 59 KB: el PNG embebido de 1254 px se reemplaza por uno de 256 px con la misma apariencia.

## [0.42.1] - 2026-10-16

### Cambiado

- La lectura de la última versión vista de Novedades (`useLastSeenReleaseVersion`) y su marcado (`useMarkReleaseNotesSeen`) viven en hooks separados; `ReleaseNotes` los compone. Sin cambio de comportamiento.

## [0.42.0] - 2026-10-16

### Agregado

- La hoja «Novedades» guarda la última versión vista en el perfil del usuario: la lee de `GET /users/me` y la marca con `PATCH /users/me/release-notes-seen`. Así no vuelve a aparecer al entrar desde otro dispositivo.
- `localStorage` (`releaseNotesSeenVersion`) queda como caché para no mostrar la hoja mientras responde el perfil. En la primera visita (`lastSeenReleaseVersion: null`) la versión actual se marca en silencio, sin hoja.

### Cambiado

- `ReleaseNotesSheet` pasa a ser presentacional: recibe la versión vista y el marcado desde `useReleaseNotesSeen` (`src/modules/settings`), que refleja el cambio en la caché del perfil al cerrar la hoja.

## [0.41.0] - 2026-10-16

### Agregado

- Reintentos sin duplicar: el cliente HTTP manda `Idempotency-Key` en POST, PATCH y DELETE, reutiliza la misma clave en los reintentos de esa petición y genera una clave nueva en cada llamada. Los GET se reintentan igual que antes.
- Un 409 del servidor (clave en curso o usada con otro body) se muestra como conflicto y no se reintenta.
- Pruebas del cliente HTTP y de la lógica de los hooks de autenticación (`src/config`, `src/modules/auth`).

### Cambiado

- El cliente HTTP se arma con dependencias inyectables (`createApiClient`) para poder probarlo sin sesión real; los `apiGet`, `apiPost`, `apiPatch`, `apiDelete` y `apiPostForm` exportados no cambian.
- `pnpm test` incluye los specs de `src/config`.
- `ApiError`, `AuthServiceError` y `BackendProfileUnavailableError` dejan de usar parameter properties de TypeScript, que `node --test --experimental-strip-types` no soporta.

## [0.40.0] - 2026-10-16

### Agregado

- Hoja «Novedades» en el shell autenticado: al salir una versión nueva, la primera vez que se abre la app muestra qué cambió en lenguaje de usuario. Sale una sola vez por versión y en la primera visita la versión actual queda marcada como vista sin mostrar la hoja. No aparece en rutas públicas como el login.
- `src/shared/constants/release-notes.ts` guarda las notas de usuario dentro del build: la versión y los cambios se comparan con la última versión vista en `localStorage`, sin endpoint ni sondeo.

## [0.39.4] - 2026-10-16

### Cambiado

- `/` ya no envía a la landing cuando no hay sesión: sin sesión va a `/login` y con sesión a `/home`. Las rutas públicas retiradas (`/landing`, `/privacy`, `/terms`, `/faq`, `/contact` y `/delete-account`) siguen respondiendo con redirección permanente a la landing nueva.
- Las reglas de redirección del proxy viven en `src/shared/lib/proxy-routes.ts`, con pruebas propias, y `proxy.ts` solo las aplica. Las redirecciones conservan las cookies de sesión que refresca el proxy.

## [0.39.3] - 2026-10-16

### Cambiado

- La landing deja de servirse desde este repo: `/landing`, `/privacy`, `/terms`, `/faq`, `/contact` y `/delete-account` responden con redirección permanente (308) a la landing nueva (`personal-os-landing`, Astro). `NEXT_PUBLIC_LANDING_URL` cambia el origen; sin valor usa `https://personal-os-landing-six.vercel.app`.
- `/` sigue llevando a `/home` con sesión y ahora envía a la landing publicada sin ella. Los enlaces a la landing de la bienvenida, de Ajustes y de la página 404 apuntan a la landing nueva.
- La metadata de la app vive en `src/shared/constants/app-metadata.ts` y ya no declara canonical ni alternates hacia la landing vieja.

### Eliminado

- `app/(landing)/`, `src/modules/landing/` y `docs/modules/landing/`: el marketing, las páginas legales, la FAQ, el contacto, la lista de espera y el borrado de cuenta se sirven desde la landing.
- `public/assets/splash.png`, sin uso.

## [0.39.2] - 2026-10-16

### Cambiado

- La documentación deja de llevar `status.md`, `review-register.md` y `roadmap.md`: el estado, el roadmap y los hallazgos viven en GitHub Issues (label `roadmap`) y los documentos cerrados pasan a `docs/archive/`.
- `README.md`, `AGENTS.md`, `CONTEXT.md` y `docs/README.md` describen stack, scripts, entorno (Sentry), flujo de issues con `Closes #N`, error boundaries y CI.
- `docs/modules/home/**` se funde en un solo README.

### Eliminado

- `docs/qa-personal-os-mobile-screens.md`, `docs/spec-alineacion-dominio/estado-implementacion.md` y los diseños de Suscripciones superados por el pendiente 14.

### Corregido

- `capabilities/sync.md` habla de `bankSenderEmails` (arreglo), no de `bankSenderEmail`.

## [0.39.1] - 2026-10-16

### Corregido

- «Reintentar» en la cola de pendientes anuncia el movimiento que reintenta, porque el texto del botón se repite en cada fila.

## [0.39.0] - 2026-10-16

### Agregado

- La cola «Movimientos por asignar» ofrece «Reintentar» en cada mensaje pendiente: llama a `POST /finance/email-sync/pending/:id/retry`, muestra el estado de carga y avisa si el movimiento quedó asignado o si sigue pendiente.

### Cambiado

- El sync de correo queda documentado como funciona: el OAuth autoriza solo el buzón, la institución se vincula después, el callback vuelve siempre a `/finance/sync` y el efectivo vive en la institución de sistema «Efectivo». `emailSync.enabled` es el interruptor que el back exige para conectar, sincronizar y vincular; `emailSync.automatic` solo gobierna el sync programado.
- El selector de cuenta de una tarjeta usa `institutionAccountOptions`, el helper puro que filtra las cuentas activas de la institución elegida.

## [0.38.3] - 2026-10-15

### Cambiado

- Las configs de Sentry del cliente, el servidor y el edge comparten `sentryBaseOptions`; sin DSN no se inicializa ninguna.
- El cierre del pendiente 18 documenta la subida de source maps del back y los ajustes de la revisión.

## [0.38.2] - 2026-10-15

### Corregido

- El cierre del pendiente 18 documenta el ajuste de los e2e del back al contrato paginado y al español.

## [0.38.1] - 2026-10-15

### Corregido

- `BANK_CHARGES` reemplaza el nombre viejo de la constante del endpoint de cargos bancarios, acorde con la ruta nueva.
- Se documenta la observabilidad con Sentry en [docs/infrastructure/observability.md](./docs/infrastructure/observability.md).

## [0.38.0] - 2026-10-15

### Agregado

- Observabilidad con Sentry (`@sentry/nextjs`): `instrumentation.ts`, `instrumentation-client.ts` y las configs de servidor y edge; `app/error.tsx` y `app/global-error.tsx` en español reportan con `captureException` y ofrecen «Reintentar». Sin `NEXT_PUBLIC_SENTRY_DSN` no se inicializa y no hay Session Replay, y el mismo scrubber borra body, cookies, cabeceras de auth y tokens antes de enviar.

### Cambiado

- El CI corre `lint`, `format:check`, `tsc`, tests y `next build` con variables públicas dummy.
- Las listas de cuentas, tarjetas, instituciones, préstamos, metas de ahorro y cobros se leen como lookups (`limit=100` y se toma `items`) porque el back las paginó por cursor.
- La desactivación del token push usa `DELETE /notifications/push-tokens/:token`.
- `GET /finance/analytics/bank-charges` pasa a `GET /finance/bank-charges`.
- `next.config` sube source maps solo si existe `SENTRY_AUTH_TOKEN`; sin token el build no falla y conserva el agregado para la extensión de dev.
- `.env.example` documenta las variables de Sentry.

## [0.37.1] - 2026-10-15

### Corregido

- El hero de Inicio (Gasto, Ingreso y Transferencia), la fila de una notificación, la card de cada App en Ajustes y el botón del agente muestran pending al abrir otra vista; antes el toque quedaba mudo.

## [0.37.0] - 2026-10-15

### Agregado

- Si el último sync de un banco falla, Sincronización muestra una alerta con el error del back, además del historial de «Últimos syncs».

### Cambiado

- Saneamiento del registro de revisión (pendiente 17): todos los `<Link>` que abren otra vista muestran el pending con `LinkPendingOverlay`; las cards y filas conservan `href`.
- `NEXT_PUBLIC_APP_URL` queda documentada en `.env.example`.
- Los hallazgos de documentación vieja de React Native, Expo y Metro se cierran; los que aún no tienen código pasan a GitHub Issues (label `roadmap`).

## [0.36.6] - 2026-10-15

### Cambiado

- La papelera de Finanzas pinta con `BrandLogo` también los registros eliminados de institución y cuenta, con el `logoUrl` que resuelve el back.

## [0.36.5] - 2026-10-15

### Cambiado

- De cara al usuario, cada área de Personal OS se llama **App**; el código sigue diciendo módulo. Ajustes, landing, ayudas, avisos y notificaciones usan el término nuevo, con el glosario [docs/glosario.md](./docs/glosario.md) y la regla `.cursor/rules/app-terminology.mdc`.
- Los formularios de ajustes de Finanzas, Agenda, Salud y Proyectos guardan con la barra fija al pie (`FormScreen`) y el botón conserva el texto mientras envía.
- La papelera de Finanzas muestra la marca de la institución y de sus cuentas con `BrandLogo`.

## [0.36.4] - 2026-10-15

### Corregido

- El nombre «Efectivo <moneda>» solo se sugiere al crear una cuenta de efectivo de una moneda que aún no tiene cuenta; para un fondo en una moneda existente el nombre queda libre.

## [0.36.3] - 2026-10-15

### Cambiado

- Limpieza interna sin cambios de comportamiento: formato de Prettier e imports en pantallas y documentos.
- En desarrollo, seleccionar un elemento en el navegador envía su ubicación en el código fuente al chat de pi.

## [0.36.2] - 2026-10-15

### Cambiado

- La fila del pendiente 16 registra la revisión del back v0.33.2: el comando que asegura Efectivo ya no devuelve el id y la lectura queda en la consulta.

## [0.36.1] - 2026-10-15

### Cambiado

- La fila del pendiente 16 registra la revisión del back (v0.33.1): el índice único de la institución Efectivo vive solo en SQL para no depender de la vista previa `partialIndexes`.

## [0.36.0] - 2026-10-15

### Agregado

- Productos: Efectivo se muestra como una institución de sistema con icono de efectivo y el total convertido a la moneda de preferencia. El anillo usa ese total y marca «Balance incompleto» cuando falta una tasa.
- Detalle de Efectivo: desglose por moneda y cuenta, secciones ocultas de tarjetas, préstamos, edición, borrado y sincronización por correo, y un «Agregar cuenta» discreto con el tipo fijo en efectivo.
- Los selectores de institución de tarjetas y préstamos ya no ofrecen Efectivo. Al elegir una moneda sin cuenta de efectivo se sugiere «Efectivo <moneda>».

## [0.35.4] - 2026-10-22

### Cambiado

- El estado de error del resumen de conciliación se arma una sola vez: el bloque no se repite entre la primera carga fallida y el reintento posterior.

## [0.35.3] - 2026-10-22

### Corregido

- Conciliación: el estado del mes muestra el error con reintento cuando la primera carga falla, en vez de quedarse en blanco.
- El pie de las listas con scroll infinito lleva icono y un indicador de carga mientras llega la tanda.
- El vacío del historial de conversaciones usa `Empty`, no un párrafo suelto.

### Cambiado

- El tamaño de tanda del historial de conversaciones usa la constante `AI_SESSIONS_PAGE_SIZE`.
- El botón "Crear préstamo" del FAB de Planificación y las filas "Landing page" y "Vaciar datos" de Ajustes se bloquean mientras la vista de destino carga.
- Spec de `expenseTrend` con un cambio que redondea a cero.

## [0.35.2] - 2026-10-22

### Corregido

- Auditoría de reglas de UI (`REV-WEB-025`): bloques con título y grupos de filas con `SummarySection`/`SettingsSection` en vez de `Card` o un `div` con borde a mano; icono líder en los campos y botones que faltaban; `Empty` en los vacíos y estado de error con reintento donde había un párrafo suelto; `Skeleton` donde la forma ya se conoce; pending al navegar con `Link`/`usePendingNavigation`; placeholders que repetían la etiqueta.
- El detalle de movimiento pide confirmación (`AlertDialog`) antes de unir duplicados o quitar un vínculo de planificación.
- El historial de conversaciones carga la siguiente tanda al llegar al final.
- El porcentaje de tendencia de gastos se formatea con `Intl.NumberFormat` en vez de `toFixed` con el símbolo a mano.

## [0.35.1] - 2026-10-22

### Corregido

- Productos: el anillo de Efectivo queda sin medir ("Balance incompleto") cuando las cuentas de efectivo no comparten la moneda base, en vez de sumar monedas distintas (ADR-002).

## [0.35.0] - 2026-10-22 - Decimales exactos

### Agregado

- Dependencia `decimal.js-light` y utilidad `shared/lib/decimal.ts` (`toDecimal`, `sumDecimals`, `roundDecimal` con `ROUND_HALF_EVEN`, `decimalPercent`, `decimalAmount`).

### Cambiado

- Los totales y gráficos de dashboards, Suscripciones y el anillo suman los montos con esa utilidad, en vez de aritmética de `Number`, para no perder centavos con monedas fraccionarias.

## [0.34.1] - 2026-10-22

### Cambiado

- La nota del próximo corte con la cuenta regresiva se arma en `nextCycleNote`; el detalle de tarjeta solo la pinta.
- Spec de `nextCycleNote` (corte más cuenta regresiva, y casos parciales).

## [0.34.0] - 2026-10-22 - Tarjetas prácticas

### Agregado

- Detalle de tarjeta: barra de uso y crédito disponible del back (`availableCredit`), más el próximo corte y una cuenta regresiva a la fecha límite de pago (`card-credit.ts`).
- Productos: el crédito disponible de la tarjeta usa el valor del back, que ya descuenta los movimientos pendientes.

### Cambiado

- La proyección del ciclo de la tarjeta sale del back (`nextStatementDate`/`nextPaymentDueDate`) en vez de calcularse en la web; se retira `card-statement-cycle.ts`.
- Specs: días de corte y pago (1-31) en el formulario y cuenta regresiva del detalle.

## [0.33.3] - 2026-10-21

### Cambiado

- En el detalle de suscripción, el cambio de tab se resuelve en una función con nombre (`selectDetailTab`) que arma la URL, en vez de dentro del JSX.

## [0.33.2] - 2026-10-21

### Corregido

- El detalle de suscripción respeta el tab que pide el enlace (`?tab=`): «Revisar» en el sheet de Alertas entra en Precio o en Pagos, no en Resumen. El tab elegido vive en la URL y sobrevive a recargar.
- Las cards de suscripciones pausadas o canceladas ya no llevan el borde ámbar ni la etiqueta de la ventana de aviso: solo muestran su fecha, porque no cobran.
- El calendario muestra un error reintentable si falla el resumen del gasto mensual, en vez del centro del anillo en cero.

### Cambiado

- Se quita el descarte individual de alertas de la web (hook y endpoint de cliente) y el agrupador de cobros por día, sin uso desde la v3.
- El sheet de Alertas describe también los avisos de renovación.
- Specs: tab del detalle desde la URL, card de una suscripción que no cobra, y ciclos trimestral y semestral.

## [0.33.1] - 2026-10-21

### Cambiado

- La lista de suscripciones vive en su propio bloque (`components/subscriptions-list.tsx`) y el sheet de filtros carga sus propios datos: el cuerpo de la pantalla queda como orquestacion y el conteo de «Ver N resultados» sale de la misma consulta cacheada.
- El titulo del mes del calendario falla con un error explicito si el mes no existe, en vez de mostrar solo el año.

## [0.33.0] - 2026-10-21 - Suscripciones v3

### Agregado

- Vista de Suscripciones rehecha según los mockups v3: hero suelto con el gasto mensual y 4 atajos (Próximos, Alertas, Detectados y Calendario) con punto o conteo.
- Sheets de Próximos cobros, Alertas y Detectados del correo; Próximos, Alertas y Detectados ya no se expanden dentro de la vista.
- Filtros en bottom sheet con el picker real de cuenta o tarjeta y el de categoría múltiple, segmentados de estado y frecuencia, y «Ordenar por» (próximo cobro, monto, nombre). El icono de filtros muestra cuántos hay activos y cada filtro deja un chip descartable.
- Ruta `/finance/subscriptions/calendar`: rejilla del mes con los cobros de cada día, resto del mes por delante y distribución del gasto por categoría como resumen.
- Detalle con tabs Resumen / Pagos / Precio, como el detalle de tarjeta: el tab Precio trae el gráfico del monto en el tiempo y la lista de cambios, y la franja del hero muestra el ciclo actual y la fecha de alta.
- Cards con el anillo de progreso del ciclo alrededor del logo, borde ámbar y etiqueta «Hoy» / «Mañana» / «en N días» dentro de la ventana de aviso, fecha corta fuera de ella, y marca cuando el último cobro no cuadró con el monto esperado.
- Ajuste «Aviso de próximos cobros» en `/settings/finance` → Suscripciones: 3, 5, 7, 10 días o personalizado (1–30), 5 por defecto.
- Botón flotante para crear una suscripción.

### Cambiado

- El hero deja de vivir dentro de `SummarySection`; salen de la vista principal el anillo de distribución, la franja de próximos y las alertas en línea.
- El estado de los filtros vive en la URL, así que sobrevive a recargar y el botón Atrás lo respeta.
- Los días de aviso por suscripción salen del formulario de alta y edición: manda el ajuste global.

### Corregido

- El conteo de filtros activos y los chips no se pierden al abrir un sheet: los parámetros de la hoja sobreviven al cambio de filtros.

## [0.32.1] - 2026-10-15

### Agregado

- Correccion de fechas y descripciones en el CHANGELOG.md

## [0.32.0] - 2026-10-15 - Movimientos

### Agregado

- Vista «Cargos bancarios» en `/finance/bank-charges`: total del año, barras por mes y desglose por tipo y por banco. Se abre desde un atajo en Productos.

### Cambiado

- Comercios sale del menú lateral y se abre como vista secundaria desde el atajo de Productos.
- Productos deja de mostrar el atajo a Suscripciones.
- En Movimientos, cada movimiento es una tarjeta con el fondo de su categoría. Las patas de una misma transferencia siguen juntas.
- Al entrar al timeline de movimientos, la lista baja al día de hoy.
- El encabezado del día pasa a «Miércoles 14 Oct.».
- El icono de estado queda junto al monto. «¿Duplicado?» y «Revertido» van debajo, a color pleno, y una reversa también muestra su icono.
- La búsqueda de movimientos usa esas mismas tarjetas, ocupa media pantalla, se une al campo con una línea y se cierra al tocar el fondo desenfocado.
- Ajustes centra el nombre y el correo, y muestra la marca Beta junto a la versión. La insignia Beta de la barra lateral usa el mismo estilo.

### Corregido

- Al desplazar los resultados de búsqueda, el timeline de atrás ya no se mueve.

## [0.31.2] - 2026-10-14

### Agregado

- Informe de auditoría de reglas de UI y convenciones en `docs/reference/auditoria-reglas-ui-convenciones.md`: 60 hallazgos con archivo y línea, y su registro `REV-WEB-025`.

## [0.31.1] - 2026-10-14

### Corregido

- El diálogo de confirmación de «Recalcular» se cierra cuando el check deja de listar la desviación; antes quedaba abierto tras corregir el saldo.

### Cambiado

- Specs de integridad que cubren el cierre del diálogo tras el recálculo, además de la selección de desviaciones y el armado del body.

## [0.31.0] - 2026-10-14 - Integridad de saldos

### Agregado

- Banner de «Saldo descuadrado» en el detalle de cuenta y de tarjeta de crédito, con saldo guardado, esperado, diferencia y botón «Recalcular» con confirmación.
- Lista de desviaciones abiertas en Productos, con el mismo recálculo, y sección «Integridad de saldos» con «Verificar ahora» en `/settings/finance`.
- Hooks `useFinanceIntegrity` y `useRecalculateBalance`; ajuste de notificación «Saldos descuadrados».
- Specs de la lógica del banner, del badge y del flujo de recálculo.

## [0.30.2] - 2026-10-14

### Corregido

- El filtro de moneda del anillo de suscripciones se aplica a la lista de tarjetas, y los segmentos «Sin categoría» y «Sin método» filtran esas suscripciones.
- El calendario de próximos cobros reutiliza el agrupado por día compartido.
- Planificación deja de mostrar el atajo a Suscripciones, que ya está en el tab bar.

## [0.30.1] - 2026-10-14

### Cambiado

- Las claves internas de agrupación del anillo de suscripciones usan constantes con nombre. Sin cambio de comportamiento.

## [0.30.0] - 2026-10-14

### Agregado

- Vista Suscripciones rediseñada: hero con costo mensual, equivalente anual, activas y tendencia contra el mes anterior; anillo por categoría, tarjeta-cuenta o moneda que filtra las tarjetas; próximos cobros a 30 días y calendario mensual; alertas descartables; tarjetas con barra del ciclo; bandeja de detectados; y pie de canceladas con el ahorro anual.
- Hooks `useSubscriptionsBreakdown`, `useSubscriptionsUpcoming`, `useSubscriptionAlerts` y descarte de alertas.
- Selector de categoría en el formulario de suscripción.

### Cambiado

- La pestaña Recurrentes desaparece: confirmar un detectado crea la suscripción y actualiza el contador, y confirmados y descartados pasan a una bandeja aparte.

## [0.29.1] - 2026-10-14

### Corregido

- La tarjeta «Cargos bancarios» incluye el desglose por banco, además del gráfico mensual y el desglose por tipo.
- Las tarjetas de débito dejan de ofrecer «Conciliar» y «Conciliaciones»: su saldo se cierra desde la cuenta enlazada.

### Cambiado

- Specs del rango anual de cargos y de la magnitud de un monto.

## [0.29.0] - 2026-10-14 - Conciliación

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
