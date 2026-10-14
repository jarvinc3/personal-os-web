# 10 · Rediseño de la vista Suscripciones

> Pedido del usuario tras el 09 (14 oct 2026): Suscripciones es vista principal del tab bar de Finanzas (entre Planificación y Productos) y hoy es una lista con filtros sin diseño propio. Debe estar al nivel de Planificación, Productos y Movimientos. Ver [direccion-y-decisiones.md](../direccion-y-decisiones.md).

## Estado verificado

Back (`packages/finance/src/subscriptions/`, migración `20261018090000_fin_subscriptions`), verificado contra `develop` en back v0.27.0:

| Dato                                                                                                                                               | Estado                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `amount`, `currency`, `billingCycle`, `billingInterval`, `nextBillingDate`, `anchorDate`, `status`, `pausedAt`, `cancelledAt`                      | ✅ existe                                                                     |
| `trialEndsAt` (`trial_ends_at`), `reminderDaysBefore`, `lastRemindedFor`                                                                           | ✅ existe                                                                     |
| `cardId`/`cardName`, `accountId`/`accountName` en la respuesta de la lista                                                                         | ✅ existe (solo nombre; sin banco, últimos 4 ni logo del instrumento)         |
| `logoUrl`, `domain`, `manageUrl`, `sourcePatternId`                                                                                                | ✅ existe                                                                     |
| `monthlyEquivalent`, `annualEquivalent`, `daysUntil` por suscripción                                                                               | ✅ existe                                                                     |
| Historial de pagos (`fin_subscription_payments`: `amount`, `currency`, `paidAt`, `transactionId`, `source`)                                        | ✅ existe; permite derivar precio anterior y gasto real del mes               |
| `GET /finance/subscriptions/summary`: `baseCurrency`, `activeCount`, `monthlyCost`, `annualCost`, `upcoming` (ventana fija `UPCOMING_WINDOW_DAYS`) | ✅ existe; sin tendencia, sin gasto real, sin días configurables              |
| Categoría de la suscripción (`categoryId`)                                                                                                         | ❌ no existe: requiere migración                                              |
| Precio anterior (`previousAmount` / `priceChangedAt`)                                                                                              | ❌ no existe como columna; se deriva de los dos últimos pagos (sin migración) |
| Desglose por categoría, instrumento o moneda                                                                                                       | ❌ no existe                                                                  |
| Alertas                                                                                                                                            | ❌ no existe (solo el job de recordatorios)                                   |
| Ajuste `subscriptions.groupBy`                                                                                                                     | ✅ existe en settings (default `none`)                                        |
| Monto y conteo del summary usan `Number`                                                                                                           | ⚠️ coherente con el pendiente 13; aquí usar `Decimal` en lo nuevo             |

Web: la vista actual es una lista con filtros y pestañas (Suscripciones / Recurrentes). Componentes reutilizables: `FinanceHomeHeroSection`, `ExpenseTrendBadge`, `FinanceRingChart`, `FinanceRingLegend`, `buildRingStackSlices`, `FinanceSegmentedControl`, `FinanceSuggestionRow`, `BrandLogo`, `calendar-weeks.ts`, `MonthPicker`, patrón de `transaction-search`.

## Comportamiento esperado

De arriba hacia abajo:

1. **Hero «Gasto en suscripciones»** (patrón `FinanceHomeHeroSection`): costo mensual grande en moneda base, equivalente anual, «N activas» y `ExpenseTrendBadge` contra el mes anterior. Barra de acciones: **Nueva**, **Por confirmar** (badge con el número de detectados) y **Calendario**.
2. **Anillo de distribución** (`FinanceRingChart` + `FinanceRingLegend` + `buildRingStackSlices`) con `FinanceSegmentedControl`: categoría / tarjeta-cuenta / moneda. Tocar un segmento filtra «Mis suscripciones»; tocarlo de nuevo quita el filtro.
3. **Próximos cobros**: franja horizontal de 30 días (logo, monto, tarjeta o cuenta, «en N días») y calendario mensual (`calendar-weeks.ts`, `MonthPicker`) con los cobros de cada día; el botón Calendario del hero abre esta vista.
4. **Alertas** (patrón `FinanceSuggestionRow`), descartables:
   - Subida de precio: el último pago supera al anterior («Netflix subió 11 %»).
   - Prueba gratis por vencer (`trialEndsAt` dentro de `reminderDaysBefore`).
   - Renovación anual próxima (ciclo `YEARLY`/`SEMIANNUAL` dentro de `reminderDaysBefore`).
   - Cobro esperado que no llegó: `nextBillingDate` ya pasó (más 3 días de gracia) sin pago registrado.
5. **Mis suscripciones** como tarjetas propias (grid de 2 columnas en web, 1 en móvil): `BrandLogo` grande, estado, monto + ciclo + equivalente mensual, cuenta regresiva al próximo cobro con barra de progreso del ciclo, chip del método de pago. Agrupación según `subscriptions.groupBy`. Filtros estado / moneda / búsqueda (patrón `transaction-search`).
6. **Detectados por confirmar (N)**: la pestaña Recurrentes desaparece; los patrones detectados pendientes se muestran como bandeja en la vista (confirmar como suscripción o descartar). Confirmados y descartados pasan a un sheet/subpágina.
7. **Pie**: canceladas (colapsable) y «Canceladas: ahorras RD$X al año» (suma anual en moneda base).

Estados `Empty`, carga y error reintentable en cada sección. Pantallas sin suscripciones muestran un empty con CTA «Nueva» y «Revisar detectados».

## Back

### Esquema

- `fin_subscriptions.category_id TEXT NULL` con FK a `fin_categories` (`SetNull`) e índice. Sin backfill obligatorio; opcional: copiar la categoría del patrón recurrente de origen o de la última transacción emparejada.
- Precio anterior: **sin columna**, se deriva de los dos últimos `fin_subscription_payments`. Si la revisión lo considera costoso, agregar `previous_amount` + `price_changed_at` actualizados en `matchTransaction`.
- Migración Prisma con fecha posterior a la última; sin drift.

### REST

- `GET /finance/subscriptions/summary`: añade `previousMonthlyCost` (mes anterior), `realSpendThisMonth` y `realSpendPreviousMonth` (suma de pagos en moneda base), `trend` (`up|down|flat` + porcentaje), `pendingDetectedCount`, `cancelledAnnualSavings`.
- `GET /finance/subscriptions/breakdown?by=category|instrument|currency` → `[{ key, label, amount, count, color? }]` en moneda base, solo activas.
- `GET /finance/subscriptions/upcoming?days=30` (1–90; o `from&to` para el calendario) → cobros proyectados con logo, monto, instrumento; incluye ocurrencias múltiples de ciclos semanales.
- `GET /finance/subscriptions/alerts` → `[{ id, kind: PRICE_INCREASE|TRIAL_ENDING|ANNUAL_RENEWAL|MISSED_CHARGE, subscriptionId, data }]`; descarte persistido (por `kind`+`subscriptionId`+fecha).
- Lista: incrustar `paymentMethod { type: CARD|ACCOUNT, id, name, institution, last4?, logoUrl? }` y `category { id, name, icon, color }`; mantener `cardId/accountId` por compatibilidad. Filtros nuevos `categoryId`, `cardId`, `accountId`.
- `PATCH /finance/subscriptions/:id` acepta `categoryId`.
- Dinero nuevo en `Decimal`.

### Tools

- `get_subscriptions_summary` refleja la tendencia; `get_subscription_alerts` nuevo.

## Web

- Reemplazar la vista por las 7 secciones; layout responsive al estilo de Planificación/Productos.
- Hooks nuevos: `useSubscriptionsBreakdown`, `useSubscriptionsUpcoming`, `useSubscriptionAlerts`; la lista acepta los filtros del anillo.
- Tarjeta `SubscriptionCard` con barra de ciclo (`(hoy - inicioCiclo) / (próximo - inicioCiclo)`).
- Bandeja de detectados reutiliza las acciones de Recurrentes del 07/08; ruta o sheet para confirmados/descartados.
- Formulario de suscripción: selector de categoría.

## Criterios de aceptación

- [ ] La vista no tiene pestañas Suscripciones/Recurrentes; muestra hero, anillo, próximos cobros, alertas, tarjetas, detectados y pie.
- [ ] El hero muestra mensual, anual, activas y tendencia correcta contra el mes anterior.
- [ ] El anillo cambia entre categoría, tarjeta-cuenta y moneda, y tocar un segmento filtra las tarjetas.
- [ ] Próximos cobros cubre 30 días y el calendario mensual coincide con la franja.
- [ ] Cada tipo de alerta aparece en su caso y se puede descartar.
- [ ] La agrupación respeta `subscriptions.groupBy`; búsqueda y filtros funcionan.
- [ ] Confirmar un detectado lo convierte en suscripción y actualiza el badge.
- [ ] El ahorro anual de canceladas se calcula en moneda base.
- [ ] Sin regresiones en detalle, pagos, logo ni ajustes de suscripciones.

## Tests

- Back: summary con tendencia y gasto real (multimoneda), breakdown por los tres ejes, upcoming con ciclos semanales y ventana, cada tipo de alerta y su descarte, lista con `paymentMethod`/`category`, migración sin drift.
- Web: hero, anillo con filtro, franja y calendario, alertas, `SubscriptionCard` (barra de ciclo), bandeja de detectados, agrupación y estados vacíos/error.

## Versión esperada

MINOR en ambos repos: web v0.30.0 / back v0.28.0. Las correcciones de la revisión salen como PATCH.
