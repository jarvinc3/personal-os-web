# Componentes UI reutilizables

Inventario para agentes. Antes de inventar un control, buscar aquí y en `src/shared/components/`. Evidencia: archivos citados. Estado: `VERIFICADO` en código 2026-09-18.

## Fecha y hora — no usar inputs nativos

**Prohibido** en UI de producto: `<input type="time">`, `<input type="date">`, y `Input` con esos `type`. El reemplazo canónico está en [`src/shared/components/ui/wheel-picker.tsx`](../../src/shared/components/ui/wheel-picker.tsx).

| Necesitas                          | Usar               | Valor                                                                                    |
| ---------------------------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| Hora de reloj                      | `TimePairWheels`   | `HH:mm` 24 h (ej. `"09:00"`)                                                             |
| Duración (horas + minutos)         | `DurationWheels`   | `HH:mm` de duración (ej. `"01:30"` = 90 min). No usar `TimePairWheels`: trae a. m./p. m. |
| Fecha                              | `DateWheels`       | `YYYY-MM-DD`                                                                             |
| Fecha en un formulario de Finanzas | `FinanceDateField` | Igual `YYYY-MM-DD`; collapsible + `DateWheels` + atajos “Hoy” / “Listo”                  |

`TimePairWheels` muestra hora 12 h + minutos + periodo a. m./p. m. `DurationWheels` muestra horas 00–24 + minutos, sin periodo. Los minutos se configuran con `minuteStep`: `1` (00–59), `5` o `10`. Convierte reloj con `hm24To12Parts` / `hm12To24` y duración con `durationMinutesToHm` / `hmToDurationMinutes` en `src/shared/types/wheels.type.ts`.

```tsx
import { TimePairWheels } from "@/src/shared/components/ui/wheel-picker"

;<TimePairWheels
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

;<DurationWheels
  label="Duración"
  value="01:30"
  minuteStep={1}
  onChange={(next) => {
    // next es "HH:mm" de duración
  }}
/>
```

Un `Input type="number"` para cantidades **sí** es válido; no es fecha/hora. Duraciones con horas y minutos van en `DurationWheels`, no en un input numérico.

## Collapsible para elegir un dato

Cuando un collapsible abre ruedas u otro control para elegir un valor (`FinanceDateField` y el mismo patrón en otros módulos):

- El panel abierto ocupa **todo el ancho** del bloque que lo contiene. Si el disparador comparte fila con otro control (un switch, por ejemplo), ese control va en `aside` del campo, para que el panel siga a ancho completo.
- El pie del panel deja los atajos a la izquierda (`Hoy`, y `Sin fecha` si aplica). A la derecha, al fondo, va un botón `Listo` del mismo tamaño. Se habilita cuando ya hay un valor elegido. Al pulsarlo, cierra el collapsible. El valor ya quedó escrito al elegirlo.

## Sheets, listas y vacíos

| Necesitas                            | Usar                                                                       | Path                                                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Sheet / drawer de módulo (edición)   | `BottomSheet`                                                              | `src/shared/components/layout/bottom-sheet.tsx`                                                             |
| Evento (llegó, listo, falló)         | `BottomSheet` `variant="floating"`                                         | igual; card abajo, no drawer de formulario                                                                  |
| Sección con título + card            | `SummarySection`                                                           | `src/shared/components/ui/summary.tsx`                                                                      |
| Fila de lista (icono, título, valor) | `SummaryItem`                                                              | igual. `tintRow` pinta el fondo de la fila con `accentColor`; por defecto no                                |
| Acción primaria flotante (una sola)  | `Fab`                                                                      | `src/shared/components/layout/fab.tsx`                                                                      |
| Varias acciones flotantes            | `ExpandableFab`                                                            | `src/shared/components/layout/expandable-fab.tsx`                                                           |
| Estado vacío                         | `Empty` + `EmptyHeader` / `EmptyMedia` / `EmptyTitle` / `EmptyDescription` | `src/shared/components/ui/empty.tsx`                                                                        |
| Color                                | `ColorPickerSwatch`                                                        | `src/shared/components/ui/color-picker.tsx`                                                                 |
| Tab bar de módulo **con rutas**      | `ModuleSectionLayout`                                                      | `src/shared/components/layout/module-section-layout.tsx` — [module-conventions.md](./module-conventions.md) |
| Aviso puntual dentro de un flujo     | `Alert`                                                                    | `src/shared/components/ui/alert.tsx`                                                                        |
| Pending de navegación                | `LinkPendingOverlay` / `usePendingNavigation`                              | `src/shared/components/ui/navigation-pending.tsx` — overlay + spinner en el control que abre otra vista     |
| Región pendiente / vacía / contenido | `AsyncRegion`                                                              | `src/modules/finance/shared/components/layout/async-region.tsx`                                             |
| Registro ausente con vuelta          | `MissingRecord`                                                            | `src/modules/finance/shared/components/layout/missing-record.tsx`                                           |
| Hero de progreso de un detalle       | `FinanceProgressHero`                                                      | `src/modules/finance/shared/components/layout/progress-hero.tsx`                                            |
| Acciones de un registro (⋮ del detalle) | `RecordOptionsSheet`                                                     | `src/modules/finance/shared/components/record-options-sheet.tsx`                                            |
| Confirmación de borrado              | `DeleteRecordDialog`                                                       | `src/modules/finance/shared/components/delete-record-dialog.tsx`                                            |

No armar un drawer con `Drawer` crudo si `BottomSheet` cubre el caso (título, description, actions, pending).

Una lista larga dentro de un sheet lleva búsqueda. El texto ignora mayúsculas y acentos. Cada coincidencia destella una vez (`animate-search-flash`). Si el ítem está dentro de un collapsible cerrado, ábrelo solo cuando la coincidencia es un hijo: un padre que coincide se queda cerrado para que sus hijos no tapen el resultado.

Toda vista de lista (dentro o fuera de un sheet) trae más filas al bajar: scroll infinito, sin botones de página. La regla y el contrato por cursor viven en [`list-infinite-scroll.mdc`](../../.cursor/rules/list-infinite-scroll.mdc).

**Módulo hoja** (Keep Awake): hero + iconos + sheets. **No** uses `Tabs*` para Recordatorio/Historial/ajustes en la misma página. Eso es chrome de hoja, no secciones. Molde: [module-conventions.md — Módulo hoja (UX)](./module-conventions.md#módulo-hoja-ux). `Tabs*` solo si hay ≥2 superficies locales que **no** merecen ruta y **no** es un módulo hoja. El tab activo se guarda en la query (`tab`) para que Atrás lo recupere; un sheet que reinicia su tab pasa `persist={false}`. El chip se desliza, el panel entra con presencia y un swipe horizontal cambia de tab.

Keep Awake reminder: [`keep-awake-reminder-sheet.tsx`](../../src/modules/keep-awake/components/keep-awake-reminder-sheet.tsx) (`Guardar` activa). Aviso al due: [`keep-awake-reminder-prompt.tsx`](../../src/modules/keep-awake/components/keep-awake-reminder-prompt.tsx) (`floating`). Temporizador: [`keep-awake-duration-controls.tsx`](../../src/modules/keep-awake/components/keep-awake-duration-controls.tsx) (popover + `DurationWheels`). Horario silencioso: [`edit-quiet-hours-sheet.tsx`](../../src/modules/settings/components/sheets/edit-quiet-hours-sheet.tsx).

## Formularios de Finanzas

Viven en `src/modules/finance/shared/components/forms/`. No copiarlos a otros módulos; sí reutilizar el patrón:

- `FinanceDateField` → fecha
- `FinanceMoneyField` → monto con teclado y calculadora; `FinanceCurrencyPickerSheet` → moneda con bandera; `FinanceSegmentedControl` → segmentos
- Cuenta o tarjeta: `DestinationTrigger` + `DestinationPickerSheet`; institución: `InstitutionTrigger` + `InstitutionPickerSheet`; categoría: `CategoryTrigger` + `CategoryPickerSheet`; país: `CountryTrigger` + `CountryPickerSheet`. No se elige un catálogo largo en un `Select` inline.
- Cerrar un formulario con cambios sin guardar: `useDiscardChanges` (`src/modules/finance/shared/hooks/use-discard-changes.tsx`).
- `Field` / `FieldLabel` / `FieldError` (`src/shared/components/ui/field.tsx`) → etiqueta y error
- Campos de texto y select: icono líder del tipo de dato (`FormTextField` `icon`, `SelectField` `icon`). Estado binario en una fila: icono + `aria-label`, no la etiqueta cruda.

### Botón de registrar o guardar

Estado del botón de envío: [`.cursor/rules/form-submit-disabled.mdc`](../../.cursor/rules/form-submit-disabled.mdc). Las reglas compartidas (`isPositiveAmountInput`, `isLedgerTargetInput`) viven en [`ledger-form.ts`](../../src/modules/finance/shared/lib/ledger-form.ts) con su spec.

## Reglas registradas (`.cursor/rules/`)

Una regla por archivo `.mdc`; se leen todas antes de crear o cambiar un control. El detalle vive en cada `.mdc`; aquí solo el índice y su componente canónico.

| Regla | Componente o helper canónico |
| --- | --- |
| [ui-shared-components.mdc](../../.cursor/rules/ui-shared-components.mdc) | `wheel-picker.tsx`, `BottomSheet`, `FinanceDateField` |
| [leaf-module-ux.mdc](../../.cursor/rules/leaf-module-ux.mdc) | hero + `BottomSheet` (Keep Awake) |
| [navigation-pending.mdc](../../.cursor/rules/navigation-pending.mdc) | `LinkPendingOverlay` / `usePendingNavigation` |
| [confirm-important-changes.mdc](../../.cursor/rules/confirm-important-changes.mdc) | `AlertDialog` |
| [switch-row-icons.mdc](../../.cursor/rules/switch-row-icons.mdc) | `SettingsRow` / `SwitchFieldRow` |
| [visual-status-icons.mdc](../../.cursor/rules/visual-status-icons.mdc) | icono + `aria-label` |
| [form-shell-page.mdc](../../.cursor/rules/form-shell-page.mdc) | `FinanceFormScreen` |
| [form-shell-sheet.mdc](../../.cursor/rules/form-shell-sheet.mdc) | `BottomSheet` (acciones del sheet) + `useDiscardChanges` |
| [form-sections.mdc](../../.cursor/rules/form-sections.mdc) | bloques con título |
| [form-field-anatomy.mdc](../../.cursor/rules/form-field-anatomy.mdc) | `Field` / `FieldLabel` / `FieldError` |
| [form-picker-fields.mdc](../../.cursor/rules/form-picker-fields.mdc) | picker de selección en `BottomSheet` |
| [form-submit-flow.mdc](../../.cursor/rules/form-submit-flow.mdc) | constructor de payload + `toast` |
| [form-derived-fields.mdc](../../.cursor/rules/form-derived-fields.mdc) | campos derivados del estado elegido |
| [form-submit-disabled.mdc](../../.cursor/rules/form-submit-disabled.mdc) | botón de envío |
| [form-field-icons.mdc](../../.cursor/rules/form-field-icons.mdc) | `FormTextField` `icon` / `SelectField` `icon` |
| [icons-required.mdc](../../.cursor/rules/icons-required.mdc) | icono obligatorio en todo botón y control |
| [input-placeholders.mdc](../../.cursor/rules/input-placeholders.mdc) | placeholder solo para ejemplo o formato |
| [list-infinite-scroll.mdc](../../.cursor/rules/list-infinite-scroll.mdc) | `useInfiniteQuery` + `IntersectionObserver` |
| [ui-section-states.mdc](../../.cursor/rules/ui-section-states.mdc) | `FinanceListSkeleton` / `Empty` / `FinanceErrorState` |

Molde: `transaction-form.tsx` y `transfer-form.tsx`. No copiar los componentes de Finanzas a otros módulos; sí el patrón.

## Primitivos shadcn

`Button`, `Input` (texto/número), `Switch`, `Select`, `Collapsible`, etc. en `src/shared/components/ui/`. Usarlos. No sustituyen a las ruedas de fecha/hora.
