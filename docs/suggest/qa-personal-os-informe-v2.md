# QA de Personal OS: área privada (informe renovado)

- **App:** <https://personal-os-web-one.vercel.app>
- **Fecha:** 7 de octubre de 2026 (la revisión anterior fue el 5 de octubre)
- **Alcance:** todas las vistas detrás del login, en escritorio y en móvil.
  - **Escritorio:** el viewport quedó fijo en 1024×594 porque no se pudo llevar a 1280.
  - **Móvil:** DevTools en modo Responsive 390×844.
- **Modo:** solo lectura sobre la cuenta real. Solo se enviaron vacíos los formularios de transferencia y presupuesto, para ver la validación; los dos se rechazaron y se cancelaron.
- **Capturas:** `/workspace/qa-personal-os/private-v2/`

## Resumen

| | Cantidad |
| --- | --- |
| Hallazgos anteriores arreglados | 5 |
| Hallazgos anteriores que cambiaron (parcialmente resueltos) | 3 |
| Hallazgos anteriores que siguen | 16 |
| Bugs nuevos | 9 |

Ninguna página tardó más de 3 s en cargar. La más lenta fue Resumen, con 2.2 s.

## Lo que se arregló desde el 5 de octubre

1. **Totales de octubre consistentes.**
   - Inicio, Movimientos, Resumen y Estadísticas muestran ahora el mismo gasto, DOP $7,780.49.
2. **Estadísticas en "Semana"** ya muestra los gastos (DOP $3,749.33) con sus barras.
3. **Crear presupuesto vacío** ahora avisa con "Tope obligatorio".
4. **Etiqueta "Custom" en Categorías:** ya no aparece; se reemplazó por un ícono de persona.
5. **Móvil, las etiquetas del eje en Estadísticas** ya no se encimen en "Año".

## Cambios parciales

1. **El botón "Transf." ahora abre su propia página.**
   - Antes llevaba a Movimientos. Ahora abre `/finance/transfers/new`, con Origen, Destino, Importe, fecha, el toggle "Completado" y "Detalles opcionales".
   - Al enviarlo vacío muestra "Monto obligatorio".
   - "Gasto" e "Ingreso" van a `/finance/transactions/new?type=…` con un selector de categoría.
   - Capturas: `desktop-12-transfer-new.png`, `desktop-12b-transfer-empty-validation.png`, `mobile-18-transfers-new.png`
2. **Móvil, el botón "+" en Cuentas** ya no tapa el carrusel, pero todavía toca la esquina de la tarjeta de atrás.
   - Captura: `mobile-bug-fab-cuentas.png`
3. **Accesibilidad:** en escritorio ya no salió la advertencia de aria-hidden al cerrar diálogos, pero en móvil sí aparece al abrir el drawer.

## Hallazgos anteriores que siguen

### Severidad alta

1. **Errores de sincronización de Gmail** (`/finance/accounts/sync`)
   - **Qué pasa:** "Gmail tokens could not be decrypted. Reconnect the mailbox." sigue apareciendo muchas veces en Popular y Qik, alternado con syncs OK. El último sync de BHD salió OK.
   - **Por qué importa:** puede ser un problema real con la clave de cifrado de los tokens, que hace fallar a ratos la importación de movimientos. Además, el mensaje está en inglés.
   - **Captura:** `desktop-bug-sync-decrypt-error.png`

### Severidad media

1. **Notificaciones en inglés y duplicadas** (`/notifications`)
   - **Qué pasa:** siguen las ~50 entradas "Transaction recorded / A transaction of 600 was recorded." del 5 de octubre. Las nuevas (2500, 209.9) también están en inglés y sin moneda. La campana no tiene badge.
   - **Esperado:** algo como "Movimiento registrado · DOP $2,500.00", sin duplicados.
   - **Capturas:** `desktop-03-notifications.png`, `mobile-bug-notificaciones-ingles.png`
2. **Los atajos de Resumen no abren nada** (`/finance/overview`)
   - **Qué pasa:** "Agregar", los gastos frecuentes como "Supermercado" y las transacciones recientes solo llevan a Movimientos.
   - **Esperado:** un formulario prellenado o el detalle de la transacción.
3. **La tira de meses de Movimientos llega al futuro** (`/finance/transactions`)
   - **Qué pasa:**
     - Va de OCT 25 a OCT 27, o sea 12 meses en el futuro.
     - Se muestran semanas vacías.
     - Hay rangos como "sab 1 - sab 1" y "dom 30 - dom 30".
     - Los días van sin tilde ("mie", "sab").
   - **Captura:** `desktop-06-finance-transactions.png`
4. **Texto técnico en los formularios de Planificación** (`/finance/planning`)
   - **Qué pasa:**
     - Meta: "El estado Completada lo marca el API…", y el placeholder "50000" parece un valor ya escrito.
     - Préstamo: "12% se envía como 0.12…".
     - Cobro: "Pagado sin cobrado deja que el API complete…", "Si supera el monto, el API responde 400…" y el placeholder "Vacío si Pagado (el API completa)".
   - **Capturas:** `desktop-09-planning-ahorros.png`, `desktop-09c-planning-cobros.png`
5. **La dona de Cuentas tiene un segmento sin etiqueta y no tiene leyenda** (`/finance/accounts`)
   - **Qué pasa:**
     - El segmento de Efectivo no tiene porcentaje.
     - El texto accesible sigue diciendo "SALDO-DOP".
     - El signo negativo va en lugares distintos: "-DOP $378.31K" frente a "DOP -$149,016.44".
   - **Captura:** `desktop-10-accounts.png`
6. **Móvil, el botón "+" tapa montos en Movimientos**
   - **Qué pasa:** tapa "DOP $3,500.0…" en el borde derecho.
   - **Captura:** `mobile-bug-fab-movimientos.png`

### Severidad baja

1. **Fechas en inglés** en Préstamos, Cobros y Presupuestos ("Vence Oct 10, 2026", "Vence Dec 1, 2026", "Oct 1, 2026 – Oct 31, 2026").
   - Capturas: `desktop-bug-planning-english-dates.png`, `mobile-bug-fecha-ingles.png`
2. **Fechas crudas en las gráficas de Estadísticas** ("2026-10-02") y sin escala en el eje Y.
   - Capturas: `desktop-bug-stats-raw-dates.png`, `mobile-bug-estadisticas-semana-grafico.png`
3. **Estadísticas tiene pocos filtros y gráficas incompletas:**
    - Solo hay Semana/Mes/Año, sin selector de mes.
    - "Transferencias" es la barra de gasto más grande en "Año".
    - Las barras no muestran montos.
4. **Inicio:**
    - El saludo aparece dos veces.
    - Se ve "Usuario / US" justo al cargar.
    - La etiqueta de porcentaje (ahora "-66.5%") no explica qué mide.
    - Captura: `desktop-01-home.png`
5. **Errores de texto:** "1 cuentas · 1 tarjetas · 1 préstamos" y "Graficos de resumenes financieros".
6. **El ícono de Estadísticas en el header es inconsistente:** sale en Movimientos, Planificación y Cuentas, pero no en Inicio, Ajustes, Keep Awake, Estadísticas ni Resumen.
7. **Accesibilidad:** "Toggle Sidebar" y "Notifications alt+T" están en inglés, y hay dos `<main>` anidados.
8. **Móvil, botones solo con ícono:**
    - Las pestañas de Planificación son solo íconos (~28 px de alto).
    - Los 3 botones rápidos de Inicio no tienen texto.
    - Los íconos del header de Keep Awake (~32 px) no tienen texto.
    - Capturas: `mobile-bug-planificacion-tabs-iconos.png`, `mobile-bug-home-botones-sin-texto.png`, `mobile-bug-keepawake-iconos.png`
9. **Móvil, barra de scroll visible** en "Gastos frecuentes" de Resumen.
    - Captura: `mobile-bug-gastos-frecuentes-scrollbar.png`

## Bugs nuevos

### Severidad media

1. **El backend responde 429 (límite de solicitudes) navegando normal**
   - **Qué pasa:** `/api/finance/transactions` devolvió 429 en las consultas de pendientes y del rango de octubre. Además, el `refresh_token` de Supabase devolvió 400.
   - **Por qué importa:** el 429 puede hacer que falten datos en pantalla, y el 400 del refresh podría explicar por qué la sesión expira, como pasó entre el 5 y el 7 de octubre.
   - **Evidencia:** está en la consola, no hay captura.
2. **Estadísticas en "Año": las 20 etiquetas de categoría del eje X se encimen en escritorio**
   - **Esperado:** etiquetas rotadas o truncadas, o una gráfica horizontal.
   - **Captura:** `desktop-bug-stats-year-labels-overlap.png`
3. **Móvil, el botón "+" tapa la flecha de "Salud" en Categorías**
   - **Esperado:** espacio al final de la lista.
   - **Captura:** `mobile-bug-fab-categorias.png`

### Severidad baja

1. **El patrimonio neto tiene formatos distintos:** "DOP -$378,311.80" en Resumen y Planificación, frente a "-DOP $378.31K" en Cuentas.
2. **La gráfica temporal de Estadísticas no incluye hoy:** termina el 6 de octubre aunque hay un gasto de Gimnasio de DOP $2,500 del 7 de octubre.
3. **Presupuesto Alimentación muestra "Gastado DOP $0.00"** aunque hay gastos de restaurante y café en octubre. Puede que estén en otras categorías; conviene revisarlo.
4. **El sidebar marca "Cuentas"** cuando estás en Categorías y en Correos.
5. **Estadísticas al cambiar de período:** las tarjetas muestran un momento "—" y "Todavía no hay gastos" antes de cargar, en vez de un estado de carga.
6. **Móvil, en Estadísticas "Mes" la última etiqueta del eje X se corta.** Está sin confirmar porque la captura pudo tomarse a mitad de la animación.
   - Captura: `mobile-bug-estadisticas-mes-eje-cortado.png`

## Lo que funciona bien

- El login y la navegación entre todas las vistas, incluido el botón de atrás y adelante.
- Los formularios de Gasto, Ingreso, Transferencia, Meta, Préstamo, Cobro y Presupuesto abren con etiquetas en español y validan los campos obligatorios.
- En móvil:
  - No hay scroll horizontal.
  - La barra de abajo de Finanzas resalta la sección correcta.
  - El drawer abre y cierra bien.
  - El sheet de categorías de Gasto y la página de transferencia caben en la pantalla.
- Ajustes, Chat y Correos se ven bien en las dos vistas.

## Tiempos de carga (escritorio, hasta red inactiva)

| Página | Tiempo |
| --- | --- |
| Inicio | 1.5 s |
| Chat | 1.1 s |
| Notificaciones | 1.1 s |
| Ajustes | 1.2 s |
| Keep Awake | 1.1 s |
| Movimientos | 1.5–1.8 s |
| Resumen | 2.2 s |
| Estadísticas | 1.3 s |
| Planificación | 1.4 s |
| Cuentas | 1.6 s |
| Correos | 1.5 s |
| Categorías | < 1 s |

## No probado

- **Escritorio a 1280 de ancho:** el viewport quedó fijo en 1024.
- **Capturas de página completa:** el contenido hace scroll dentro de un contenedor interno, así que solo se ve la parte visible.
- **Acciones que cambian datos o la configuración, por la regla de solo lectura:**
  - guardar cualquier cosa
  - escribir en el Chat o usar sus chips
  - los toggles de Ajustes, el tema oscuro y "Borrar cuenta"
  - "Activar" en Keep Awake
  - reconectar Gmail
  - marcar notificaciones como leídas
- **Meta, Préstamo y Cobro vacíos:** no se enviaron, porque sus valores por defecto podían crear un registro.
- **En móvil:** el submenú de Finanzas del drawer, el flujo de Ingreso y el scroll largo de Notificaciones.
