# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y [SemVer](https://semver.org/lang/es/). Reglas y ejemplo en [docs/reference/changelog-guide.md](./docs/reference/changelog-guide.md).

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
