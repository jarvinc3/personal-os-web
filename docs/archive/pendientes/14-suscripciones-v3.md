# 14 — Suscripciones v3 (vista según mockup v3)

> Pedido del usuario tras el 10 (15 oct 2026): lo construido en el 10 no coincide con el diseño acordado. Esta spec rehace la vista de Suscripciones según los [mockups v3](../mockups/suscripciones-v3/README.md). Las decisiones de abajo ya están acordadas con el usuario; no reabrirlas sin preguntar.

## Estado verificado

Verificado contra `develop` (web v0.32.1, back v0.29.1) el 15 oct 2026.

Back (`packages/finance/src/subscriptions/`):

| Dato / endpoint                                                                                                       | Estado                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `GET /finance/subscriptions` (lista con `paymentMethod`, `category`, `monthlyEquivalent`, `daysUntil`)                | ✅ existe                                                                                                    |
| `GET /finance/subscriptions/summary` (`monthlyCost`, `annualCost`, `activeCount`, `pendingDetectedCount`, `upcoming`) | ✅ existe; `upcoming` usa la constante fija `UPCOMING_WINDOW_DAYS = 7`                                       |
| `GET /finance/subscriptions/upcoming` (`days` o `from&to`)                                                            | ✅ existe; sirve para el calendario                                                                          |
| `GET /finance/subscriptions/breakdown`                                                                                | ✅ existe; la v3 ya no lo usa en la vista                                                                    |
| `GET /finance/subscriptions/alerts` + `POST alerts/dismiss`                                                           | ✅ existe; tipos `PRICE_INCREASE`, `TRIAL_ENDING`, `ANNUAL_RENEWAL`, `MISSED_CHARGE`; descarte de uno en uno |
| `GET/POST /finance/subscriptions/:id/payments`                                                                        | ✅ existe; de aquí se deriva el historial de precio                                                          |
| `GET/PATCH /:id`, `pause`, `resume`, `cancel`, `logo`                                                                 | ✅ existe                                                                                                    |
| Ajuste global `subscriptions.reminderDaysBefore` (`packages/users/src/domain/defaults/user-settings-defaults.ts`)     | ✅ existe, **default 3** (hay que pasarlo a 5)                                                               |
| `reminderDaysBefore` por suscripción (columna en `fin_subscriptions`, se copia del global al crear)                   | ✅ existe; con la v3 deja de usarse en la UI                                                                 |
| Alerta «monto distinto al esperado» (cobró menos o distinto, no solo subida)                                          | ❌ no existe: solo `PRICE_INCREASE`                                                                          |
| Marcar todas las alertas como vistas en una llamada                                                                   | ❌ no existe                                                                                                 |
| Historial de precio como serie de cambios                                                                             | ❌ no existe como endpoint; se deriva de `payments`                                                          |

Web (`src/modules/finance/subscriptions/`): `subscriptions-screen.tsx` con las 7 secciones del 10 (hero en `SummarySection`, anillo de distribución, franja de próximos, alertas inline, cards con barra de progreso, detectados, pie de canceladas); `subscription-detail-screen.tsx` sin tabs; `components/subscription-card.tsx`; lógica en `lib/subscription-view.ts` y `lib/subscription-display.ts`. Hooks en `shared/hooks/use-subscriptions.ts` (`useSubscriptions`, `useSubscriptionSummary`, `useSubscriptionsUpcoming`, `useSubscriptionAlerts`, `useDismissSubscriptionAlert`, `useSubscription`, `useSubscriptionPayments`, mutaciones).

## Brechas (actual → objetivo)

| Actual (10)                                          | Objetivo (14)                                                                                 |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Hero dentro de `SummarySection` con tendencia        | Hero suelto como Planificación/Productos; mensual grande + «RD$X al año · N activas»          |
| Barra de acciones Nueva / Por confirmar / Calendario | Exactamente 4 atajos con icono y badge: Próximos, Alertas, Detectados, Calendario             |
| Anillo de distribución con segmentado                | Se elimina de la vista                                                                        |
| Franja de próximos 30 días y alertas inline          | Nada se expande inline: Próximos, Alertas y Detectados abren sheets; Calendario abre una ruta |
| Filtros estado/moneda/búsqueda inline                | Bottom sheet de filtros con filas, pickers reales, segmentados y «Ordenar por»; chips mínimos |
| Card con barra de progreso interna                   | Card estilo v2 con anillo SVG alrededor del logo; sin barra interna                           |
| «en N días» siempre                                  | Dentro de la ventana: Hoy / Mañana / en N días + borde ámbar; fuera: fecha corta («17 oct»)   |
| Ventana fija de 7 días (back)                        | Ventana = ajuste global `reminderDaysBefore` (default 5)                                      |
| Detalle sin tabs                                     | Tabs Resumen / Pagos / Precio como en el detalle de tarjeta                                   |

## Decisiones acordadas

1. **Hero suelto** (no `SummarySection`), con el patrón de `dashboard/components/home-hero.tsx` (Planificación) y el hero de Productos. Número grande = gasto mensual equivalente en moneda base. Línea pequeña: total anual y número de activas.
2. **Exactamente 4 atajos** con icono y badge:
   - **Próximos**: badge tipo _dot_ si hay cobros dentro de la ventana; abre un sheet.
   - **Alertas** (subida de precio, monto cobrado distinto al esperado, cobro no registrado): badge con conteo; abre un sheet.
   - **Detectados del correo**: badge con conteo (`pendingDetectedCount`); abre un sheet.
   - **Calendario**: abre una vista/ruta nueva (`/finance/subscriptions/calendar`).
     Nada se expande inline en la vista.
3. **Filtros en bottom sheet**:
   - Filas con etiqueta, valor actual y chevron.
   - **Método de pago** abre el picker real `shared/components/pickers/destination-picker-sheet.tsx` (institución → cuenta/tarjeta).
   - **Categoría** abre el picker real `category-picker-sheet.tsx` en modo `multiple` (la prop ya existe; verificar que soporta este uso y ajustarla si hace falta, sin romper los usos actuales).
   - **Estado** (Activas / Pausadas / Canceladas / Todas) y **Frecuencia** (Todas / Mensual / Anual / Otra) con `FinanceSegmentedControl`.
   - Fila **Ordenar por** (próximo cobro, monto, nombre).
   - Badge con el número de filtros activos sobre el icono de filtros.
   - Chips mínimos de filtros activos debajo del encabezado, descartables.
4. **Cards** con el estilo v2. El progreso del ciclo es un **anillo SVG alrededor del logo**; se elimina la barra interna.
   - Dentro de la ventana de aviso: etiqueta «Hoy», «Mañana» o «en N días», **borde ámbar grueso**, y la suscripción aparece en Próximos.
   - Fuera de la ventana: fecha corta («17 oct»), sin borde, no aparece en Próximos.
   - Marca pequeña de advertencia cuando el último cobro fue distinto al monto esperado.
5. **Ajuste «Aviso de próximos cobros»**: solo global, default **5**, opciones 3 / 5 / 7 / 10 / Personalizado (1–30). Se reutiliza `subscriptions.reminderDaysBefore` (repo **back**: cambiar el default de 3 a 5; repo **web**: UI en la sección Suscripciones de `/settings/finance`). El override por suscripción deja de mostrarse en el formulario. El campo de días de aviso por suscripción se oculta en el formulario de crear/editar; la columna se queda en la base de datos sin uso.
6. **Detalle** con tabs como el detalle de tarjeta (`cards/card-detail-screen.tsx`): **Resumen**, **Pagos**, **Precio** (gráfico del monto en el tiempo + lista de cambios). La franja del hero del detalle muestra el ciclo actual (inicio–fin) y la fecha de alta.
7. **Sheet de Alertas** con acciones **Marcar vistas** (todas) y **Revisar** (por alerta, abre el detalle en la tab que corresponda: Precio o Pagos).

## Back

- `user-settings-defaults.ts`: `subscriptions.reminderDaysBefore` → **5**. Validación 1–30 en el DTO de settings.
- `subscriptions.service.ts`: reemplazar `UPCOMING_WINDOW_DAYS = 7` por el ajuste global del usuario en `summary.upcoming`; exponer `reminderWindowDays` en el summary para que la web no lo adivine.
- Recordatorios (`subscription-reminders.service.ts`) usan el ajuste global; la columna por suscripción queda sin uso en UI (no se borra en este pendiente).
- Alertas: nuevo tipo `AMOUNT_MISMATCH` (último pago ≠ monto esperado, por arriba o por abajo, sin ser `PRICE_INCREASE` confirmado) en `domain/subscription-alerts.ts`. `MISSED_CHARGE` se muestra como «Cobro no registrado», porque no se puede detectar un rechazo, solo que el cobro esperado no llegó.
- `POST /finance/subscriptions/alerts/dismiss-all` (o aceptar un arreglo en `dismiss`) para «Marcar vistas».
- En la lista, agregar `lastChargeMismatch: boolean` (o `lastPaymentAmount`) para la marca de advertencia de la card.
- Precio: **sin endpoint nuevo**; la web deriva la serie desde `GET /:id/payments`. Si la revisión lo ve costoso, agregar `GET /:id/price-history`.
- Dinero en `Decimal`; sin migraciones salvo que la revisión lo exija.

## Web

- Reescribir `subscriptions-screen.tsx`: hero + 4 atajos + chips + lista de cards. Quitar anillo de distribución, franja y alertas inline.
- Sheets nuevos: `upcoming-sheet.tsx`, `alerts-sheet.tsx`, `detected-sheet.tsx` (reutiliza las acciones de confirmar/descartar del 07/08), `subscription-filters-sheet.tsx`.
- Ruta nueva de calendario reutilizando `calendar-weeks.ts`, `MonthPicker` y `useSubscriptionsUpcoming({ from, to })`. La vista de Calendario incluye como resumen la distribución del gasto por categoría, que sale de la vista principal; usa el endpoint breakdown existente.
- `subscription-card.tsx`: anillo SVG (`subscription-progress-ring.tsx`), etiqueta y borde ámbar, marca de advertencia.
- Lógica pura en `lib/`: `cycleProgress(start, next, today)` y `billingLabel(nextDate, today, windowDays)` → `{ text, inWindow }`.
- `subscription-detail-screen.tsx` con `Tabs` (mismo patrón que `CARD_DETAIL_TABS`).
- Ajuste en `/settings/finance` → Suscripciones: «Aviso de próximos cobros».
- Estado de filtros en la URL (search params) para que sobreviva a recargar.

### Reutilizar vs crear

| Reutilizar                                   | Crear                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| `home-hero.tsx` / hero de Productos (patrón) | `SubscriptionsHero`                                                    |
| `destination-picker-sheet.tsx`               | `subscription-filters-sheet.tsx`                                       |
| `category-picker-sheet.tsx` (`multiple`)     | `upcoming-sheet.tsx`, `alerts-sheet.tsx`, `detected-sheet.tsx`         |
| `FinanceSegmentedControl`                    | `subscription-progress-ring.tsx`                                       |
| `BrandLogo`                                  | ruta de calendario                                                     |
| `Tabs` + patrón de `card-detail-screen.tsx`  | tabs `Resumen`, `Pagos`, `Precio` del detalle                          |
| `calendar-weeks.ts`, `MonthPicker`           | gráfico de precio (reutilizar el chart de líneas existente si hay uno) |
| hooks de `use-subscriptions.ts`              | `useDismissAllSubscriptionAlerts`                                      |

## Mockups de referencia

- Principal: [index.png](../mockups/suscripciones-v3/index.png), [index-full.png](../mockups/suscripciones-v3/index-full.png)
- Estados de card: [estados-card.png](../mockups/suscripciones-v3/estados-card.png)
- Sheets: [proximos.png](../mockups/suscripciones-v3/proximos.png), [alertas.png](../mockups/suscripciones-v3/alertas.png), [detectados.png](../mockups/suscripciones-v3/detectados.png)
- Calendario: [calendario.png](../mockups/suscripciones-v3/calendario.png)
- Filtros y pickers: [filtros.png](../mockups/suscripciones-v3/filtros.png), [picker-metodo.png](../mockups/suscripciones-v3/picker-metodo.png), [picker-metodo-tarjetas.png](../mockups/suscripciones-v3/picker-metodo-tarjetas.png), [picker-categoria.png](../mockups/suscripciones-v3/picker-categoria.png)
- Ajustes: [ajustes.png](../mockups/suscripciones-v3/ajustes.png), [ajustes-aviso.png](../mockups/suscripciones-v3/ajustes-aviso.png)
- Detalle: [detalle-resumen.png](../mockups/suscripciones-v3/detalle-resumen.png), [detalle-pagos.png](../mockups/suscripciones-v3/detalle-pagos.png), [detalle-precio.png](../mockups/suscripciones-v3/detalle-precio.png)

Los mockups son referencia visual; los componentes reales del repo mandan sobre el pixel exacto.

## Criterios de aceptación

- [ ] El hero es suelto (sin `SummarySection`) y muestra gasto mensual equivalente, total anual y número de activas.
- [ ] Hay exactamente 4 atajos; Próximos muestra dot, Alertas y Detectados muestran conteo; ninguno expande contenido inline.
- [ ] Próximos, Alertas y Detectados abren sheets; Calendario abre su ruta y muestra los cobros del mes. Calendario incluye el resumen de distribución por categoría.
- [ ] Próximos solo lista suscripciones dentro de la ventana de aviso.
- [ ] El sheet de filtros usa los pickers reales de método de pago y categoría (multi), segmentados para Estado y Frecuencia, y Ordenar por; el icono muestra el número de filtros activos y hay chips descartables.
- [ ] Las cards muestran el anillo de progreso alrededor del logo y ya no tienen barra interna.
- [ ] Dentro de la ventana: «Hoy» / «Mañana» / «en N días» y borde ámbar; fuera: fecha corta sin borde.
- [ ] La marca de advertencia aparece cuando el último cobro difiere del monto esperado.
- [ ] El ajuste «Aviso de próximos cobros» es global, default 5, con 3/5/7/10/Personalizado, y cambia la ventana en cards, Próximos y recordatorios.
- [ ] El detalle tiene tabs Resumen / Pagos / Precio; Precio muestra gráfico y lista; el hero muestra ciclo actual y fecha de alta.
- [ ] El sheet de Alertas tiene «Marcar vistas» (todas) y «Revisar» (abre el detalle).
- [ ] Estados de carga, vacío y error reintentable en vista, sheets, calendario y detalle.
- [ ] Sin regresiones en crear/editar, pausar, cancelar, registrar pago, logo ni en los otros usos de los pickers.

## Tests

- **Unit (web)**: `billingLabel` (hoy, mañana, N días, límite exacto de la ventana, fuera de ventana → fecha corta, fecha pasada, cambio de mes/año, ventana personalizada); `cycleProgress` (inicio 0, fin 1, mitad, clamp fuera de rango, ciclos semanal/mensual/anual, ciclo de 0 días); conteo de filtros activos; derivación del historial de precio desde pagos.
- **Componentes (web)**: `SubscriptionCard` (anillo, borde ámbar dentro/fuera, marca de advertencia); `SubscriptionsHero` + atajos con badges; sheet de filtros (abre pickers, segmentados, badge); sheet de Alertas (Marcar vistas, Revisar); detalle con tabs; `category-picker-sheet` en modo multiple.
- **Back**: default 5 del ajuste; `summary.upcoming` respeta el ajuste; alerta `AMOUNT_MISMATCH`; dismiss-all; `lastChargeMismatch` en la lista.

## Fuera de alcance

- App móvil.
- Anillo de distribución en la vista principal: se mueve a Calendario como resumen; el endpoint breakdown se queda.
- Aviso por suscripción (solo global).
- Notificaciones push/email nuevas.
- Pendientes 12 y 13: se implementan después de este.
- Ajustes visuales posteriores que el usuario anunció: se harán sobre esta versión.

## Decisiones resueltas

Aprobadas por el usuario el 15 oct 2026; no quedan preguntas abiertas.

1. **Orden y versiones**: el 14 va antes del 12 y el 13. Versiones previstas: web v0.33.0 y back v0.30.0; el 12 y el 13 se corren después. Confirmar con el último tag de cada repo al implementar.
2. **«Pago fallido»** se llama **«Cobro no registrado»** y corresponde a `MISSED_CHARGE`.
3. **Monto distinto**: se aprueba el nuevo tipo de alerta `AMOUNT_MISMATCH` en el back.
4. **Aviso por suscripción**: se oculta el campo en el formulario y solo se usa el ajuste global. La columna `reminderDaysBefore` de `fin_subscriptions` se conserva.
5. **Distribución por categoría**: sale de la vista principal y pasa a la vista Calendario como resumen.
6. **Filtros**: Frecuencia = Todas, Mensual, Anual, Otra. Ordenar por = próximo cobro, monto, nombre.

## Versionado

Según [docs/versionado.md](../../versionado.md): MINOR en cada repo con cambios de funcionalidad (web y back), PATCH en la revisión. Al día de hoy serían **web v0.33.0** y **back v0.30.0**, antes del 12 y el 13; confirmar con el último tag al implementar. Actualizar el índice de pendientes con las versiones reales.

Revisión (21 oct 2026): web v0.33.2–v0.33.3 / back v0.30.2. El detalle abre el tab pedido por el enlace, las cards de suscripciones que no cobran no se resaltan, el calendario reintenta si falla el resumen y las alertas de cuenta atrás usan la ventana global.
