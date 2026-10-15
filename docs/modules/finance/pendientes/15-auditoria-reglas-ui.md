# 15 · Auditoría de reglas de UI y convenciones (REV-WEB-025)

> Corrección de los 60 hallazgos de [reference/auditoria-reglas-ui-convenciones.md](../../reference/auditoria-reglas-ui-convenciones.md). Antes de tocar código se re-verifica cada hallazgo contra `develop`, porque Suscripciones v3 y los pendientes 12 y 13 movieron varios archivos. Los dudosos quedan listados, sin tocar.

## Estado verificado

- Auditoría `REV-WEB-025` con estado `open`, base `v0.31.1`.
- `develop` está en `v0.35.1`. Desde la auditoría: 14 (Suscripciones v3), 12 (Tarjetas prácticas) y 13 (Decimales exactos) reescribieron pantallas y líneas.
- Los números de línea de la auditoría ya no sirven: muchos archivos cambiaron de tamaño y varios componentes se movieron a archivos nuevos.

## Paso 1: re-verificación de H-01 a H-60

Contra `develop` (web `v0.35.1`). Estados: **vigente** (sigue el incumplimiento), **resuelto** (ya no existe), **nueva ubicación** (sigue, con otro archivo o línea) y **por decidir** (dudoso, no se toca).

| H    | Regla                                  | Estado                   | Detalle actual                                                                                                                                                                                       |
| ---- | -------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-01 | `Card` en producto                     | vigente                  | `ai/components/chat-action-card.tsx:14-17,99-133` sigue usando `Card`.                                                                                                                               |
| H-02 | `Card` en producto                     | resuelto                 | `reconciliation/components/bank-charges-card.tsx` ya no existe; la fila vive en `products-list.tsx:307` como `SummaryItem` y la vista usa `SummarySection`.                                          |
| H-03 | bloque con título sin `SummarySection` | resuelto                 | `subscriptions-screen.tsx` pasó de ~900 a 156 líneas; los cinco bloques se dividieron en componentes. El encabezado nuevo (`subscriptions-list.tsx:92`) es una lista de cards, no un grupo de filas. |
| H-04 | bloque con título sin `SummarySection` | vigente, nueva ubicación | `transaction-detail-screen.tsx:305,336,367`; ahora hay un tercer bloque ("Revertido").                                                                                                               |
| H-05 | bloque con título sin `SummarySection` | vigente                  | `merchants/merchant-detail-screen.tsx:169` (cabecera con borde a mano; era 169).                                                                                                                     |
| H-06 | grupo de filas con borde a mano        | vigente, nueva línea     | `merchants/merchants-screen.tsx:106` (era 90).                                                                                                                                                       |
| H-07 | grupo de filas con borde a mano        | vigente                  | `recycle-bin/components/recycle-bin-view.tsx:239,254`.                                                                                                                                               |
| H-08 | grupo de filas con borde a mano        | vigente                  | `budgets/budget-detail-screen.tsx:341`.                                                                                                                                                              |
| H-09 | monto sin `tabular-nums`               | vigente                  | `merchant-detail-screen.tsx:178` dentro de `<p className="text-sm font-semibold">`.                                                                                                                  |
| H-10 | monto sin `tabular-nums`               | resuelto                 | `subscription-card.tsx` se rehízo en v3; el monto va en un `<p>` con `tabular-nums`.                                                                                                                 |
| H-11 | número no money con `toFixed`          | vigente                  | `shared/lib/finance-home-month.ts:39,45` sigue con `toFixed(1)` y `%` a mano.                                                                                                                        |
| H-12 | campo sin icono                        | vigente                  | `cards/components/card-statement-sheet.tsx:241,246,251`.                                                                                                                                             |
| H-13 | campo sin icono                        | resuelto                 | `statement-import-button.tsx:125` es `type="password"` y `FormTextField` pone `KeyRound` por defecto.                                                                                                |
| H-14 | campo sin icono                        | vigente, nueva ubicación | `subscriptions/components/subscription-sheet.tsx:214,257,324,336`.                                                                                                                                   |
| H-15 | campo sin icono                        | vigente                  | `quick-entry/components/quick-entry-bar.tsx:51` (`Input`).                                                                                                                                           |
| H-16 | campo sin icono                        | vigente                  | `quick-entry/components/quick-entry-preview-sheet.tsx:180,186`.                                                                                                                                      |
| H-17 | campo sin icono                        | vigente                  | `reconciliation/components/reconciliation-sheet.tsx:272` (`SelectTrigger`).                                                                                                                          |
| H-18 | campo sin icono                        | vigente                  | `ai/chat-screen.tsx:481` (`SelectTrigger`).                                                                                                                                                          |
| H-19 | botón sin icono                        | vigente                  | `auth/components/auth-form-footer.tsx:66`.                                                                                                                                                           |
| H-20 | botón sin icono                        | vigente                  | `card-statement-sheet.tsx:203,257,265`.                                                                                                                                                              |
| H-21 | botón sin icono                        | vigente                  | `cards/components/card-payment-sheet.tsx:167,177`.                                                                                                                                                   |
| H-22 | botón sin icono                        | vigente                  | `institutions/components/institution-form-screen.tsx:341`.                                                                                                                                           |
| H-23 | botón sin icono                        | vigente                  | `loans/components/installment-detail-sheet.tsx:59`.                                                                                                                                                  |
| H-24 | botón sin icono                        | vigente                  | `loans/components/loan-prepayment-sheet.tsx:163,171`.                                                                                                                                                |
| H-25 | botón sin icono                        | vigente                  | `quick-entry-preview-sheet.tsx:203`.                                                                                                                                                                 |
| H-26 | botón sin icono                        | vigente                  | `receivables/components/receivable-payment-sheet.tsx:216,228,252`.                                                                                                                                   |
| H-27 | botón sin icono                        | vigente                  | `savings-goals/components/savings-goal-contribution-sheet.tsx:255,272`.                                                                                                                              |
| H-28 | botón sin icono                        | vigente                  | `shared/components/forms/form-blocks.tsx:224` (acción de `FinanceSuggestionRow`).                                                                                                                    |
| H-29 | botón sin icono                        | vigente                  | `statement-import-button.tsx:102,111`.                                                                                                                                                               |
| H-30 | botón sin icono                        | vigente                  | `statements/statement-import-screen.tsx:407,414`.                                                                                                                                                    |
| H-31 | botón sin icono                        | resuelto                 | `subscription-detail-screen.tsx:369` "Registrar pago" ahora lleva `BanknoteArrowDownIcon`.                                                                                                           |
| H-32 | botón sin icono                        | resuelto                 | "Ver bandeja completa" ya no existe; v3 usa `DetectedSheet`.                                                                                                                                         |
| H-33 | botón sin icono                        | vigente                  | `sync/components/oauth-gmail-result-sheet.tsx:335`.                                                                                                                                                  |
| H-34 | botón sin icono                        | vigente                  | `transaction-detail-screen.tsx:313,322,341,353,377`.                                                                                                                                                 |
| H-35 | botón sin icono (filtro)               | vigente                  | `transactions/components/instrument-movements.tsx:322`.                                                                                                                                              |
| H-36 | botón sin icono (chips)                | vigente                  | `notifications/notifications-screen.tsx:345`.                                                                                                                                                        |
| H-37 | placeholder                            | vigente                  | `quick-entry-preview-sheet.tsx:183,189` repiten el `aria-label`.                                                                                                                                     |
| H-38 | placeholder                            | vigente                  | `ai/components/chat-input.tsx:57` "Mensaje" sustituye a la etiqueta.                                                                                                                                 |
| H-39 | vacío como párrafo                     | vigente                  | `merchant-detail-screen.tsx:209`.                                                                                                                                                                    |
| H-40 | vacío como párrafo                     | vigente                  | `shared/components/pickers/destination-picker-sheet.tsx:141,162`.                                                                                                                                    |
| H-41 | vacío como párrafo                     | vigente                  | `loans/components/amortization-sheet.tsx:75`.                                                                                                                                                        |
| H-42 | error sin reintento                    | vigente                  | `reconciliation/components/reconciliation-month-status.tsx:63`.                                                                                                                                      |
| H-43 | error sin reintento                    | resuelto                 | `transaction-search.tsx:181` usa `FinanceErrorState` con `onRetry`.                                                                                                                                  |
| H-44 | error sin reintento                    | por decidir              | `integrity-settings-section.tsx:70`; hay "Verificar ahora" al lado.                                                                                                                                  |
| H-45 | spinner centrado                       | vigente                  | `ai/components/chat-session-sheet.tsx:95`.                                                                                                                                                           |
| H-46 | spinner centrado                       | vigente                  | `settings/components/sheets/wipe-balance-institution-sheet.tsx:86`.                                                                                                                                  |
| H-47 | spinner centrado                       | por decidir              | `finance-currencies-view.tsx:207`; refresco en línea.                                                                                                                                                |
| H-48 | scroll infinito                        | vigente                  | `chat-session-sheet.tsx:44,106`; `useAiSessions` es `useInfiniteQuery` pero no hay centinela ni `fetchNextPage`.                                                                                     |
| H-49 | pending al navegar                     | vigente                  | `layout/app-sidebar.tsx:98,123,183`.                                                                                                                                                                 |
| H-50 | pending al navegar                     | vigente                  | `layout/app-header.tsx:191,199,207`.                                                                                                                                                                 |
| H-51 | pending al navegar                     | vigente                  | `settings/settings-screen.tsx:371`.                                                                                                                                                                  |
| H-52 | pending al navegar                     | vigente                  | `planning/components/planning-list.tsx:406`.                                                                                                                                                         |
| H-53 | confirmar cambio importante            | vigente                  | `transaction-detail-screen.tsx:123` "Unir" corre directo; el archivo no importa `AlertDialog`.                                                                                                       |
| H-54 | confirmar cambio importante            | vigente                  | `transaction-detail-screen.tsx:214` "Quitar vínculo" corre directo.                                                                                                                                  |
| H-55 | `<label>` crudo                        | por decidir              | `statement-import-screen.tsx:310` (casilla).                                                                                                                                                         |
| H-56 | `<label>` crudo                        | por decidir              | `wipe-balance-institution-sheet.tsx:145` (tarjeta seleccionable).                                                                                                                                    |
| H-57 | `<label>` crudo                        | por decidir              | `settings/components/profile-ui.tsx:46` (switch).                                                                                                                                                    |
| H-58 | `<label>` crudo                        | por decidir              | `landing/contact-screen.tsx:147,164,185,208`.                                                                                                                                                        |
| H-59 | `form-shell-page` deuda aceptada       | por decidir              | `settings/components/module-settings/*-module-settings-form.tsx`.                                                                                                                                    |
| H-60 | marca de entidad                       | por decidir              | `recycle-bin-view.tsx:60,61,80,81`; el payload no trae `logoUrl`.                                                                                                                                    |

Resumen: 44 vigentes, 7 resueltos, 9 por decidir.

Detectados al re-verificar (mismo patrón de `ui-row-group`, fuera de H-01..H-60): `reconciliation/components/reconciliations-section.tsx:100` y `cards/components/card-statements-section.tsx:122`. Se anotan aquí para una auditoría futura; no entran en este pendiente.

## Paso 2: corrección por grupo de regla

Orden acordado. Cada grupo cierra sus hallazgos vigentes y deja los dudosos intactos.

1. **`confirm-important-changes` (H-53, H-54).** `transaction-detail-screen.tsx`: `AlertDialog` para "Unir" y "Quitar vínculo", con título en pregunta, consecuencia, `Cancelar` y acción en el verbo; botones deshabilitados mientras la mutación corre.
2. **`list-infinite-scroll` (H-48).** `chat-session-sheet.tsx`: `InfiniteListSentinel` sobre `sessionsQuery.hasNextPage` / `isFetchingNextPage` y `fetchNextPage`.
3. **`ui-shared-components` y `ui-row-group` (H-01, H-04, H-05, H-06, H-07, H-08).** `Card` → `SummarySection`; bloques con título y grupos de filas con el chrome compartido.
4. **`form-field-icons` e `icons-required` (H-12, H-14 a H-30, H-33 a H-36).** Icono líder en cada campo y botón.
5. **`ui-section-states` (H-39 a H-42, H-45, H-46).** `Empty` para vacíos, `FinanceErrorState` para errores, `Skeleton`/`FinanceListSkeleton` para cargas con forma conocida.
6. **`navigation-pending` (H-49 a H-52).** `Link` + `LinkPendingOverlay` o `usePendingNavigation` según el control.
7. **`input-placeholders` (H-37, H-38).** Quitar el placeholder que repite la etiqueta.
8. **`finance-money-display` y `CODING_GUIDELINES` (H-09, H-11).** `tabular-nums` en el monto y `Intl` para el porcentaje.

## Criterios de aceptación

- [x] Los 44 hallazgos vigentes dejan de incumplir su regla.
- [x] H-44, H-47, H-55 a H-58, H-59 y H-60 quedan listados como por decidir, sin tocar.
- [x] `pnpm lint`, `pnpm typecheck` y `pnpm test` pasan.
- [x] La auditoría y `review-register.md` reflejan el resultado.

## Tests

- Lógica pura: `finance-home-month.spec.ts` cubre el porcentaje con `Intl` (positivo, negativo, cero, decimal).
- El resto son cambios de chrome y no tienen lógica pura que probar.

## Implementación

PENDIENTE 15 COMPLETADO — web v0.35.2 (2026-10-22).

### `confirm-important-changes` (H-53, H-54)

- `transaction-detail-screen.tsx`: `AlertDialog` para "Unir" y "Quitar vínculo", con título en pregunta, consecuencia, `Cancelar` y el verbo; acción deshabilitada mientras la mutación corre.

### `list-infinite-scroll` (H-48)

- `chat-session-sheet.tsx`: `InfiniteListSentinel` sobre `useAiSessions` (`fetchNextPage`, `hasNextPage`, `isFetchingNextPage`).

### Bloques y grupos de filas (H-01, H-04 a H-08)

- `chat-action-card.tsx`: `Card` → `SummarySection`.
- `transaction-detail-screen.tsx`: los bloques "¿Duplicado?", "Planificación" y "Revertido" pasan a `SummarySection`.
- `merchant-detail-screen.tsx`: la cabecera pasa a `SummarySection` (el monto queda en `right` con `tabular-nums`).
- `merchants-screen.tsx` y `budget-detail-screen.tsx`: grupos de `SummaryItem` en `SummarySection`.
- `recycle-bin-view.tsx`: archivados y eliminados en `SettingsSection`.

### Iconos (H-12, H-14 a H-30, H-33 a H-36)

- Icono líder en cada campo: `card-statement-sheet` (mínimo, balance, vence), `subscription-sheet` (nombre, ciclos, enlace, notas), `quick-entry-bar`, `quick-entry-preview-sheet` (comercio, descripción), `reconciliation-sheet` y `chat-screen` (`SelectTrigger`).
- Icono en cada botón: autenticación, tarjeta de estado de cuenta y pago, autora de institución, cuotas y prepago de préstamo, cobro, meta de ahorro, sugerencia de formulario, importación de estado de cuenta, Gmail, detalle de movimiento, filtros de movimientos y notificaciones (modal de módulo por `getModule`).

### Estados de sección (H-39 a H-42, H-45, H-46)

- `Empty` en los vacíos de comercio, picker de destino, amortización.
- `FinanceErrorState` con reintento en `reconciliation-month-status`.
- `Skeleton` en la carga de sesiones de IA y del selector de institución a vaciar.

### Navegación (H-49 a H-52)

- `app-sidebar` y `app-header`: `Link` + `LinkPendingOverlay`.
- `settings-screen`: `usePendingNavigation` con `Spinner` en las filas "Landing page" y "Vaciar datos".
- `planning-list`: `usePendingNavigation` en el botón "Crear préstamo".

### Placeholders y montos (H-09, H-11, H-37, H-38)

- Placeholder que repetía la etiqueta eliminado en `quick-entry-preview-sheet` y `chat-input` (con `aria-label`).
- `finance-home-month.ts`: el porcentaje se formatea con `Intl.NumberFormat` (`style: "percent"`, `signDisplay: "exceptZero"`) en vez de `toFixed` con `%` a mano.

### Revisión (2026-10-22)

- **H-42 no se cumplía en el caso principal.** `reconciliation-month-status.tsx` devolvía `null` cuando la consulta fallaba en la primera carga, antes de llegar al `FinanceErrorState`; el error solo aparecía si ya había datos de un intento anterior. Ahora el error con reintento se pinta antes del corte por falta de datos.
- **`icons-required`.** El botón de `InfiniteListSentinel` (pie de las cuatro listas con scroll infinito) no llevaba icono; lleva `ChevronDownIcon` y un `Spinner` mientras llega la tanda.
- **`list-infinite-scroll`.** El tamaño de tanda de `useAiSessions` era el número suelto `"30"`; pasa a la constante `AI_SESSIONS_PAGE_SIZE`.
- **`ui-section-states`.** El vacío del historial de conversaciones era un párrafo `text-muted-foreground`; pasa a `Empty`.
- **`navigation-pending`.** El botón "Crear préstamo" del FAB de Planificación y las filas "Landing page" y "Vaciar datos" de Ajustes bloquean la repetición mientras la vista de destino carga.
- Tests añadidos: `expenseTrend` con un cambio que redondea a cero (`100.04` sobre `100` → `0%`, plano).
- El estado de error del resumen de conciliación se arma en un único `errorState`, en vez de repetir el bloque entre la primera carga fallida y el reintento posterior.

## Versión esperada

PATCH (correcciones visuales y de convenciones, sin cambio de comportamiento): web v0.35.2. Revisión como PATCH: web v0.35.3–v0.35.4.
