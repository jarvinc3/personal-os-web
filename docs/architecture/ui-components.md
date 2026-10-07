# Componentes UI reutilizables

Inventario para agentes. Antes de inventar un control, buscar aquí y en `src/shared/components/`. Evidencia: archivos citados. Estado: `VERIFICADO` en código 2026-09-18.

## Fecha y hora — no usar inputs nativos

**Prohibido** en UI de producto: `<input type="time">`, `<input type="date">`, y `Input` con esos `type`. El reemplazo canónico está en [`src/shared/components/ui/wheel-picker.tsx`](../../src/shared/components/ui/wheel-picker.tsx).

| Necesitas | Usar | Valor |
| --- | --- | --- |
| Hora de reloj | `TimePairWheels` | `HH:mm` 24 h (ej. `"09:00"`) |
| Duración (horas + minutos) | `DurationWheels` | `HH:mm` de duración (ej. `"01:30"` = 90 min). No usar `TimePairWheels`: trae a. m./p. m. |
| Fecha | `DateWheels` | `YYYY-MM-DD` |
| Fecha en un formulario de Finanzas | `FinanceDateField` | Igual `YYYY-MM-DD`; collapsible + `DateWheels` + atajo “Hoy” |

`TimePairWheels` muestra hora 12 h + minutos + periodo a. m./p. m. `DurationWheels` muestra horas 00–24 + minutos, sin periodo. Los minutos se configuran con `minuteStep`: `1` (00–59), `5` o `10`. Convierte reloj con `hm24To12Parts` / `hm12To24` y duración con `durationMinutesToHm` / `hmToDurationMinutes` en `src/shared/types/wheels.type.ts`.

```tsx
import { TimePairWheels } from "@/src/shared/components/ui/wheel-picker"

<TimePairWheels
  label="Hora"
  value="09:07"
  minuteStep={1}
  disabled={false}
  onChange={(next) => {
    // next es "HH:mm" 24 h
  }}
/>
```

```tsx
import { DurationWheels } from "@/src/shared/components/ui/wheel-picker"

<DurationWheels
  label="Duración"
  value="01:30"
  minuteStep={1}
  onChange={(next) => {
    // next es "HH:mm" de duración
  }}
/>
```

Un `Input type="number"` para cantidades **sí** es válido; no es fecha/hora. Duraciones con horas y minutos van en `DurationWheels`, no en un input numérico.

## Sheets, listas y vacíos

| Necesitas | Usar | Path |
| --- | --- | --- |
| Sheet / drawer de módulo (edición) | `BottomSheet` | `src/shared/components/layout/bottom-sheet.tsx` |
| Evento (llegó, listo, falló) | `BottomSheet` `variant="floating"` | igual; card abajo, no drawer de formulario |
| Sección con título + card | `SummarySection` | `src/shared/components/ui/summary.tsx` |
| Fila de lista (icono, título, valor) | `SummaryItem` | igual. `tintRow` pinta el fondo de la fila con `accentColor`; por defecto no |
| Acción primaria flotante (una sola) | `Fab` | `src/shared/components/layout/fab.tsx` |
| Varias acciones flotantes | `ExpandableFab` | `src/shared/components/layout/expandable-fab.tsx` |
| Estado vacío | `Empty` + `EmptyHeader` / `EmptyMedia` / `EmptyTitle` / `EmptyDescription` | `src/shared/components/ui/empty.tsx` |
| Color | `ColorPickerSwatch` | `src/shared/components/ui/color-picker.tsx` |
| Tab bar de módulo **con rutas** | `ModuleSectionLayout` | `src/shared/components/layout/module-section-layout.tsx` — [module-conventions.md](./module-conventions.md) |
| Aviso puntual dentro de un flujo | `Alert` | `src/shared/components/ui/alert.tsx` |
| Pending de navegación | `LinkPendingOverlay` / `usePendingNavigation` | `src/shared/components/ui/navigation-pending.tsx` — overlay + spinner en el control que abre otra vista |

No armar un drawer con `Drawer` crudo si `BottomSheet` cubre el caso (título, description, actions, pending).

**Módulo hoja** (Keep Awake): hero + iconos + sheets. **No** uses `Tabs*` para Recordatorio/Historial/ajustes en la misma página. Eso es chrome de hoja, no secciones. Molde: [module-conventions.md — Módulo hoja (UX)](./module-conventions.md#módulo-hoja-ux). `Tabs*` solo si hay ≥2 superficies locales que **no** merecen ruta y **no** es un módulo hoja.

Keep Awake reminder: [`keep-awake-reminder-sheet.tsx`](../../src/modules/keep-awake/components/keep-awake-reminder-sheet.tsx) (`Guardar` activa). Aviso al due: [`keep-awake-reminder-prompt.tsx`](../../src/modules/keep-awake/components/keep-awake-reminder-prompt.tsx) (`floating`). Temporizador: [`keep-awake-duration-controls.tsx`](../../src/modules/keep-awake/components/keep-awake-duration-controls.tsx) (popover + `DurationWheels`). Horario silencioso: [`edit-quiet-hours-sheet.tsx`](../../src/modules/settings/components/sheets/edit-quiet-hours-sheet.tsx).

## Formularios de Finanzas

Viven en `src/modules/finance/components/forms/`. No copiarlos a otros módulos; sí reutilizar el patrón:

- `FinanceDateField` → fecha
- `FinanceAmountField`, `FinanceCurrencyPills`, `FinanceSegmentedControl` → dinero / segmentos
- `Field` / `FieldLabel` / `FieldError` (`src/shared/components/ui/field.tsx`) → etiqueta y error
- Campos de texto y select: icono líder del tipo de dato (`FormTextField` `icon`, `SelectField` `icon`). Estado binario en una fila: icono + `aria-label`, no la etiqueta cruda.

## Primitivos shadcn

`Button`, `Input` (texto/número), `Switch`, `Select`, `Collapsible`, etc. en `src/shared/components/ui/`. Usarlos. No sustituyen a las ruedas de fecha/hora.
