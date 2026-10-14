# Auditoría de reglas de UI y convenciones

Revisión de `personal-os-web` contra sus reglas vigentes. Fecha: 2026-10-14. Rama: `develop`, base `v0.31.1`.

Estado: `CONTRADICE_CODIGO`. Cada hallazgo es un sitio donde el código no cumple una regla del repo. Registro: [review-register.md](../review-register.md) `REV-WEB-025`.

## Reglas revisadas

- Los 24 archivos de [`.cursor/rules/`](../../.cursor/rules), incluidos los tres sin commitear (`finance-brand-logo.mdc`, `finance-money-display.mdc`, `ui-row-group.mdc`).
- [CODING_GUIDELINES.md](../../CODING_GUIDELINES.md).
- [AGENTS.md](../../AGENTS.md).
- [docs/architecture/ui-components.md](../architecture/ui-components.md) y [module-conventions.md](../architecture/module-conventions.md).
- [eslint.config.mjs](../../eslint.config.mjs).

Las reglas sin commitear son más estrictas que la versión guardada: prohíben `Card` en pantallas de producto, exigen icono "en cualquier vista" y piden hoja de selección para todo catálogo largo. Esta auditoría usa esa versión.

## Método

`pnpm lint` pasa limpio, así que nada de lo detectable por ESLint está roto. El resto salió de búsquedas dirigidas sobre `src/` y `app/` y de leer los archivos candidatos. Los números de línea son del árbol de trabajo el 2026-10-14.

## Resumen

| Regla                                                               | Hallazgos |
| ------------------------------------------------------------------- | --------- |
| `ui-shared-components.mdc` — `Card` en producto                     | 2         |
| `ui-shared-components.mdc` — bloque con título sin `SummarySection` | 3         |
| `ui-row-group.mdc` — grupo de filas con borde a mano                | 3         |
| `finance-money-display.mdc` — monto sin `tabular-nums`              | 2         |
| `CODING_GUIDELINES.md` — número no money con `toFixed`              | 1         |
| `form-field-icons.mdc` / `icons-required.mdc` — campo sin icono     | 7         |
| `icons-required.mdc` — botón sin icono                              | 18        |
| `input-placeholders.mdc`                                            | 2         |
| `ui-section-states.mdc` — vacío, error y spinner                    | 9         |
| `list-infinite-scroll.mdc`                                          | 1         |
| `navigation-pending.mdc`                                            | 4         |
| `confirm-important-changes.mdc`                                     | 2         |
| `form-field-anatomy.mdc` — `<label>` crudo                          | 4         |
| `form-shell-page.mdc` — deuda aceptada                              | 1         |
| `finance-brand-logo.mdc` — por decidir                              | 1         |

## Hallazgos

### `ui-shared-components.mdc` — `Card` en pantallas de producto

- **H-01** `src/modules/ai/components/chat-action-card.tsx:24` — importa y usa `Card`, `CardHeader`, `CardTitle` y `CardContent`. Debe ser `SummarySection`.
- **H-02** `src/modules/finance/reconciliation/components/bank-charges-card.tsx:17` — `Card` con título "Cargos bancarios". La regla usa ese mismo ejemplo con `SummarySection` y `LandmarkIcon`.

### `ui-shared-components.mdc` — bloque con título sin `SummarySection`

- **H-03** `src/modules/finance/subscriptions/subscriptions-screen.tsx:178,229,379,773,880` — cinco `<section>` con `<h2>` o `<p>` de título y borde propio.
- **H-04** `src/modules/finance/transactions/transaction-detail-screen.tsx:305,332` — bloques "¿Duplicado?" y "Planificación" con `rounded-2xl border border-border p-3` y texto de título.
- **H-05** `src/modules/finance/merchants/merchant-detail-screen.tsx:169` — cabecera con borde propio, sin `SummarySection`.

### `ui-row-group.mdc` — grupo de filas con borde a mano

- **H-06** `src/modules/finance/merchants/merchants-screen.tsx:90` — `div rounded-2xl border bg-card` alrededor de `SummaryItem`.
- **H-07** `src/modules/finance/recycle-bin/components/recycle-bin-view.tsx:239,254` — mismo patrón en archivados y eliminados.
- **H-08** `src/modules/finance/budgets/budget-detail-screen.tsx:341` — mismo patrón en movimientos.

### `finance-money-display.mdc` — monto sin `tabular-nums`

- **H-09** `src/modules/finance/merchants/merchant-detail-screen.tsx:178` — `formatFinanceMoney` dentro de `<p className="text-sm font-semibold">`.
- **H-10** `src/modules/finance/subscriptions/components/subscription-card.tsx:87` — `formatFinanceMoney` dentro de `<p className="text-right text-xs text-muted-foreground">`.

`SummaryItem` ya aplica `tabular-nums` en su valor; los montos que pasan por ahí no cuentan.

### `CODING_GUIDELINES.md` — número no money con `toFixed`

- **H-11** `src/modules/finance/shared/lib/finance-home-month.ts:33,39` — `toFixed(1)` con `%` escrito a mano. La guía pide `Intl` para números que no son money.

### `form-field-icons.mdc` / `icons-required.mdc` — campo sin icono líder

- **H-12** `src/modules/finance/cards/components/card-statement-sheet.tsx:241,246,251` — `FormTextField` "Mínimo", "Balance al corte" y "Vence" sin `icon`.
- **H-13** `src/modules/finance/shared/components/statement-import-button.tsx:125` — `FormTextField` "Clave del PDF" sin `icon`.
- **H-14** `src/modules/finance/subscriptions/components/subscription-sheet.tsx:218,261,341,353` — cuatro `FormTextField` sin `icon`.
- **H-15** `src/modules/finance/quick-entry/components/quick-entry-bar.tsx:51` — `Input` sin icono.
- **H-16** `src/modules/finance/quick-entry/components/quick-entry-preview-sheet.tsx:180,186` — `Input` "Comercio" y "Descripción" sin icono.
- **H-17** `src/modules/finance/reconciliation/components/reconciliation-sheet.tsx:272` — `SelectTrigger` del tipo de línea sin icono.
- **H-18** `src/modules/ai/chat-screen.tsx:481` — `SelectTrigger` del contexto del agente sin icono.

### `icons-required.mdc` — botón sin icono

- **H-19** `src/modules/auth/components/auth-form-footer.tsx:66`.
- **H-20** `src/modules/finance/cards/components/card-statement-sheet.tsx:203,257,265` — "Registrar corte", "Guardar" y "Cancelar".
- **H-21** `src/modules/finance/cards/components/card-payment-sheet.tsx:167,177` — botones de importe.
- **H-22** `src/modules/finance/institutions/components/institution-form-screen.tsx:341` — "Ahora no".
- **H-23** `src/modules/finance/loans/components/installment-detail-sheet.tsx:59` — "Cerrar".
- **H-24** `src/modules/finance/loans/components/loan-prepayment-sheet.tsx:163,171` — "Reducir plazo" y "Reducir cuota".
- **H-25** `src/modules/finance/quick-entry/components/quick-entry-preview-sheet.tsx:203` — "Completar en el formulario".
- **H-26** `src/modules/finance/receivables/components/receivable-payment-sheet.tsx:216,228,252`.
- **H-27** `src/modules/finance/savings-goals/components/savings-goal-contribution-sheet.tsx:255,272`.
- **H-28** `src/modules/finance/shared/components/forms/form-blocks.tsx:224`.
- **H-29** `src/modules/finance/shared/components/statement-import-button.tsx:102,111`.
- **H-30** `src/modules/finance/statements/statement-import-screen.tsx:407,414` — "Aplicar estado de cuenta" y "Descartar".
- **H-31** `src/modules/finance/subscriptions/subscription-detail-screen.tsx:318` — "Registrar pago".
- **H-32** `src/modules/finance/subscriptions/subscriptions-screen.tsx:843` — "Ver bandeja completa".
- **H-33** `src/modules/finance/sync/components/oauth-gmail-result-sheet.tsx:335` — "Cambiar".
- **H-34** `src/modules/finance/transactions/transaction-detail-screen.tsx:313,322,341,353,377`.
- **H-35** `src/modules/finance/transactions/components/instrument-movements.tsx:322` — opciones del filtro.
- **H-36** `src/modules/notifications/notifications-screen.tsx:345` — chips de módulo.

Fuera de esta lista, y discutibles, quedan los botones que son teclas o valores: teclado de la calculadora (`amount-calculator-sheet.tsx:155`), minutos de Keep Awake (`keep-awake-duration-controls.tsx:132`) y días del recordatorio (`keep-awake-reminder-sheet.tsx:186,215`). El número ya es el símbolo.

### `input-placeholders.mdc`

- **H-37** `src/modules/finance/quick-entry/components/quick-entry-preview-sheet.tsx:183,189` — "Comercio" y "Descripción" repiten el `aria-label`.
- **H-38** `src/modules/ai/components/chat-input.tsx:57` — "Mensaje" sustituye a la etiqueta.

No cuentan los `"Elige origen"`, `"Sin padre"` y similares de los disparadores de picker: `form-picker-fields.mdc` los admite como texto de "sin valor".

### `ui-section-states.mdc`

Vacío como párrafo suelto en vez de `Empty`:

- **H-39** `src/modules/finance/merchants/merchant-detail-screen.tsx:210`.
- **H-40** `src/modules/finance/shared/components/pickers/destination-picker-sheet.tsx:141,162`.
- **H-41** `src/modules/finance/loans/components/amortization-sheet.tsx:75`.

Error sin reintento:

- **H-42** `src/modules/finance/reconciliation/components/reconciliation-month-status.tsx:64`.
- **H-43** `src/modules/finance/transactions/components/transaction-search.tsx:107`.
- **H-44** `src/modules/finance/integrity/components/integrity-settings-section.tsx:70` — hay un botón "Verificar ahora" al lado, así que el reintento existe (dudoso).

`Spinner` centrado donde la forma ya se conoce:

- **H-45** `src/modules/ai/components/chat-session-sheet.tsx:96`.
- **H-46** `src/modules/settings/components/sheets/wipe-balance-institution-sheet.tsx:86`.
- **H-47** `src/modules/settings/components/module-settings/finance-currencies-view.tsx:207` — menor, es un refresco en línea.

### `list-infinite-scroll.mdc`

- **H-48** `src/modules/ai/components/chat-session-sheet.tsx:106` — `useAiSessions` ya es `useInfiniteQuery`, pero la hoja pinta `items.map` y no tiene centinela ni `fetchNextPage`. Nunca carga la segunda tanda.

### `navigation-pending.mdc`

- **H-49** `src/shared/components/layout/app-sidebar.tsx:98,123,183` — `SidebarMenuButton` con `router.push` sin overlay. Los enlaces de sección sí lo llevan.
- **H-50** `src/shared/components/layout/app-header.tsx:191,199,207` — items del menú de usuario.
- **H-51** `src/modules/settings/settings-screen.tsx:371` — la fila "Vaciar datos" navega con `onPress` y sin pending.
- **H-52** `src/modules/finance/planning/components/planning-list.tsx:406` — botón "Crear préstamo" dentro del vacío.

### `confirm-important-changes.mdc`

- **H-53** `src/modules/finance/transactions/transaction-detail-screen.tsx:123` — "Unir" ejecuta el merge directo.
- **H-54** `src/modules/finance/transactions/transaction-detail-screen.tsx:214` — "Quitar vínculo" borra el vínculo directo.

El archivo no importa `AlertDialog`.

### `form-field-anatomy.mdc` — `<label>` crudo

La regla pide `Field` / `FieldLabel` en cualquier control con etiqueta. Estos usan `<label>`:

- **H-55** `src/modules/finance/statements/statement-import-screen.tsx:310`.
- **H-56** `src/modules/settings/components/sheets/wipe-balance-institution-sheet.tsx:145`.
- **H-57** `src/modules/settings/components/profile-ui.tsx:46`.
- **H-58** `src/modules/landing/contact-screen.tsx:147,164,185,208`.

Son casillas, radios o carga de avatar. Según se lean como "campo de dato" son violación o no.

### `form-shell-page.mdc` — deuda aceptada

- **H-59** `src/modules/settings/components/module-settings/{finance,agenda,health,projects}-module-settings-form.tsx` — botón al final del `form`, sin barra `sticky`. La propia regla lo marca y dice que se migra cuando se toque.

### `finance-brand-logo.mdc` — por decidir

- **H-60** `src/modules/finance/recycle-bin/components/recycle-bin-view.tsx:60,61,80,81` — institución y cuenta se pintan con `Building2Icon` y `LandmarkIcon`. El payload de papelera (`FinanceArchivedRecord`, `FinanceDeletedRecord`) no trae `logoUrl`, así que `BrandLogo` solo podría mostrar iniciales. Queda como decisión, no como error claro.

## Sin hallazgos

- Imports absolutos, inputs nativos de fecha u hora, `formState.isValid` y frontera de módulos y capabilities: `pnpm lint` pasa limpio.
- Categorías: siempre por `CategoryTrigger` / `CategoryPickerSheet`, nunca chips ni `Select`.
- Keep Awake: sin `Tabs*` locales.
- Borrado de registros de Finanzas: usa `DeleteRecordDialog`.
- `SummaryItem` aplica `tabular-nums` en su valor.

## Fuera de alcance

- No se tocó código. El arreglo de cada hallazgo es un cambio aparte.
- Los hallazgos H-44, H-47, H-55 a H-58 y H-60 son dudosos o dependen de una decisión; el resto es incumplimiento directo.
