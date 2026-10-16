# 06 · Bloques visuales en el chat, captura rápida y resumen semanal

## Estado verificado

- `ChatBlock` solo tiene `markdown` y `action` (`ai-agent/src/shared/ai.types.ts`); la web renderiza esos dos en `chat-message-renderer.tsx` (`chat-markdown-block.tsx`, `chat-action-card.tsx`).
- No hay captura rápida en lenguaje natural ni resumen semanal. `notifications.monthlyReport` existe como ajuste, pero no hay un resumen semanal.

## 6a · Bloques visuales

**Comportamiento:** el agente responde con tarjetas nativas del módulo en lugar de solo texto: un movimiento, el progreso de un presupuesto, una cuota, un gráfico de gasto por categoría, o una lista corta de movimientos. Tocar una tarjeta navega al detalle.

**Back:** ampliar `ChatBlock`:

```ts
| { type: 'transaction_card'; transactionId: string; snapshot: {...} }
| { type: 'transaction_list'; items: {...}[]; moreHref?: string }
| { type: 'budget_progress'; budgetId: string; spent: string; limit: string; currency: string }
| { type: 'loan_summary'; loanId: string; balance: string; nextInstallment?: {...} }
| { type: 'chart'; kind: 'bar' | 'donut' | 'line'; series: {...}[] }
```

Las tools de lectura devuelven datos estructurados; el runner los convierte en bloques (no el LLM a mano). Montos como strings decimales (ADR-002). Persistir los bloques en el mensaje (`enrich-session-messages.ts`). Clientes viejos: ignorar tipos desconocidos.

**Web:** un renderer por tipo en `src/modules/ai/components/blocks/`, que reutiliza componentes de finanzas (fila de movimiento, barra de presupuesto, gráficos de Estadísticas). Tipo desconocido → no se renderiza.

## 6b · Captura rápida en lenguaje natural

**Comportamiento:** en la barra del módulo (Movimientos y Resumen) un input "Registrar rápido": "café 250 popular", "pagué 3,500 de luz con la visa", "me pagaron la quincena". Se muestra una vista previa (tipo, monto, categoría, cuenta/tarjeta, fecha) editable y un botón "Guardar". Nunca guarda sin confirmación.

**Back:** `POST /finance/quick-entry/parse` `{ text }` → `{ draft: { type, amount, currency, categoryId?, accountId?, cardId?, date, merchant?, description }, confidence, missing[] }`. Resolver alias: "popular" → cuenta 3447/débito 5089, "visa" → BHD Visa 6506, "quincena"/"nómina" → `fixedIncome`. Usa el LLM con salida estructurada y luego valida contra el catálogo del usuario. Guardar con el endpoint actual de transacciones.

**Web:** componente `QuickEntryBar` → sheet de vista previa que abre el flujo guiado precargado si falta algo.

## 6c · Resumen semanal

**Comportamiento:** cada lunes (hora del usuario) una notificación y una tarjeta en el Resumen: gasto de la semana vs. promedio, top 3 categorías, presupuestos en riesgo, próximas cuotas y vencimientos de tarjeta, pendientes de correo sin revisar. Ajuste `notifications.weeklySummary` (encendido por defecto) y día de envío.

**Back:** scheduler `weekly-summary.scheduler.ts` que arma el resumen con la fachada de analytics (`analytics.controller.ts`) y lo emite por el outbox de notificaciones. `GET /finance/analytics/weekly-summary?weekStart=` para la tarjeta. El texto lo puede redactar el agente, pero las cifras salen de consultas, no del LLM.

**Web:** tarjeta en el Resumen y entrada de ajuste en `finance-module-settings-form.tsx`.

## Criterios de aceptación

- [ ] "¿Cómo voy con el presupuesto de comida?" responde con un `budget_progress` que navega al detalle.
- [ ] "café 250 popular" propone un DEBIT de RD$250 en Comida/Café con la cuenta Popular y no guarda hasta confirmar.
- [ ] El resumen semanal llega el lunes con cifras que cuadran con Estadísticas.
- [ ] Tipos de bloque desconocidos no rompen el chat.

Depende de 05 para bloques en contexto; 6c usa 07 para "próximos cobros recurrentes".
