# Componentes UI reutilizables

Inventario para agentes. Antes de inventar un control, buscar aquí y en `src/shared/components/`. Evidencia: archivos citados. Estado: `VERIFICADO` en código 2026-09-18.

## Fecha y hora — no usar inputs nativos

**Prohibido** en UI de producto: `<input type="time">`, `<input type="date">`, y `Input` con esos `type`. La rueda vive en [`src/shared/components/ui/wheel-picker.tsx`](../../src/shared/components/ui/wheel-picker.tsx). En pantalla siempre va dentro de [`WheelField`](../../src/shared/components/ui/wheel-field.tsx): la misma fila que `FinanceDateField`.

| Necesitas                          | Usar               | Valor                                                                                    |
| ---------------------------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| Cualquier rueda en pantalla        | `WheelField`       | Fila (icono, valor, chevron), panel a ancho completo y `Listo` abajo a la derecha        |
| Hora de reloj                      | `TimePairWheels`   | Contenido del panel. `HH:mm` 24 h (ej. `"09:00"`)                                        |
| Duración (horas + minutos)         | `DurationWheels`   | Contenido del panel. `HH:mm` de duración (ej. `"01:30"` = 90 min). Sin a. m./p. m.       |
| Fecha                              | `FinanceDateField` | `WheelField` + `DateWheels`. `YYYY-MM-DD`, atajos “Hoy” / “Listo”                        |
| Un día dentro de un rango          | `DayWheel`         | `WheelField` + una rueda. String decimal (`"15"`), `min` / `max`                         |
| Varios días del mes                | `DayListField`     | Cada día es un `DayWheel`                                                                |
| 2 a 5 opciones exclusivas          | `ChoiceGrid`       | Celdas con icono en el color del módulo y, al elegir, borde más grueso y check           |

`TimePairWheels`, `DurationWheels` y `DateWheels` no se montan sueltos en una vista. `TimePairWheels` muestra hora 12 h + minutos + periodo a. m./p. m. `DurationWheels` muestra horas 00–24 + minutos, sin periodo. Los minutos se configuran con `minuteStep`: `1` (00–59), `5` o `10`. Convierte reloj con `hm24To12Parts` / `hm12To24` y duración con `durationMinutesToHm` / `hmToDurationMinutes` en `src/shared/types/wheels.type.ts`.

```tsx
import { WheelField } from "@/src/shared/components/ui/wheel-field"
import { TimePairWheels } from "@/src/shared/components/ui/wheel-picker"
import { ClockIcon } from "lucide-react"

;<WheelField label="Hora" valueLabel="9:07 a. m." icon={ClockIcon}>
  <TimePairWheels
    value="09:07"
    minuteStep={1}
    onChange={(next) => {
      // next es "HH:mm" 24 h
    }}
  />
</WheelField>
```

Un `Input type="number"` para cantidades **sí** es válido; no es fecha/hora. Duraciones con horas y minutos van en `DurationWheels` dentro de `WheelField`, no en un input numérico.

## Collapsible para elegir un dato

`WheelField` (y `FinanceDateField`, `DayWheel`, que lo usan) es la presentación de una rueda:

- El panel abierto ocupa **todo el ancho** del bloque que lo contiene. Si el disparador comparte fila con otro control, ese control va en `aside`, para que el panel siga a ancho completo.
- El pie del panel deja los atajos a la izquierda (`Hoy`, y `Sin fecha` si aplica). A la derecha, al fondo, va un botón `Listo`. Se habilita cuando ya hay un valor elegido. Al pulsarlo, cierra el panel. El valor ya quedó escrito al elegirlo.
- `ChoiceGrid` recibe `accentColor` del módulo. El icono va sobre un fondo tenue de ese color. La celda elegida no se rellena: lleva un borde más grueso de ese color y un check.

## Sheets, listas y vacíos

| Necesitas                                                    | Usar                                                                                                              | Path                                                                                                                                                                                                                                           |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sheet / drawer de módulo (edición)                           | `BottomSheet`                                                                                                     | `src/shared/components/layout/bottom-sheet.tsx`                                                                                                                                                                                                |
| Evento (llegó, listo, falló)                                 | `BottomSheet` `variant="floating"`                                                                                | igual; card abajo, no drawer de formulario                                                                                                                                                                                                     |
| Sección con título (cualquier vista)                         | `SummarySection`. No `Card` ni `CardHeader` / `CardTitle` / `CardContent` / `CardFooter` en pantallas de producto | `src/shared/components/ui/summary.tsx`                                                                                                                                                                                                         |
| Fila de lista (icono, título, valor)                         | `SummaryItem`                                                                                                     | igual. `tintRow` pinta el fondo de la fila con `accentColor`; por defecto no                                                                                                                                                                   |
| Grupo de filas                                               | `SummarySection` (título + icono) o `SettingsSection` (etiqueta corta)                                            | `summary.tsx` y `src/shared/components/layout/settings-section.tsx`. No un `div` `rounded-2xl border bg-card`                                                                                                                                  |
| Marca de cuenta, tarjeta, institución, comercio o movimiento | `BrandLogo` (`CardNetworkMark` para la red)                                                                       | `src/modules/finance/shared/components/brand-logo.tsx`                                                                                                                                                                                         |
| Importe en pantalla                                          | `formatFinanceMoney` + `tabular-nums`                                                                             | `src/modules/finance/shared/lib/money.ts`. Escribir el monto es `FinanceMoneyField`                                                                                                                                                            |
| Acción primaria flotante (una sola)                          | `Fab`                                                                                                             | `src/shared/components/layout/fab.tsx`                                                                                                                                                                                                         |
| Varias acciones flotantes                                    | `ExpandableFab`                                                                                                   | `src/shared/components/layout/expandable-fab.tsx`                                                                                                                                                                                              |
| Estado vacío                                                 | `Empty` + `EmptyHeader` / `EmptyMedia` / `EmptyTitle` / `EmptyDescription`                                        | `src/shared/components/ui/empty.tsx`                                                                                                                                                                                                           |
| Color                                                        | `ColorPickerSwatch`                                                                                               | `src/shared/components/ui/color-picker.tsx`                                                                                                                                                                                                    |
| Tab bar de módulo **con rutas**                              | `ModuleSectionLayout`                                                                                             | `src/shared/components/layout/module-section-layout.tsx` — [module-conventions.md](./module-conventions.md)                                                                                                                                    |
| Aviso puntual dentro de un flujo                             | `Alert`                                                                                                           | `src/shared/components/ui/alert.tsx`                                                                                                                                                                                                           |
| Pending de navegación                                        | `LinkPendingOverlay` / `usePendingNavigation`                                                                     | `src/shared/components/ui/navigation-pending.tsx` — overlay + spinner en el control que abre otra vista                                                                                                                                        |
| Región pendiente / vacía / contenido                         | `AsyncRegion`                                                                                                     | `src/modules/finance/shared/components/layout/async-region.tsx`                                                                                                                                                                                |
| Registro ausente con vuelta                                  | `MissingRecord`                                                                                                   | `src/modules/finance/shared/components/layout/missing-record.tsx`                                                                                                                                                                              |
| Hero de progreso de un detalle                               | `FinanceProgressHero`                                                                                             | `src/modules/finance/shared/components/layout/progress-hero.tsx`                                                                                                                                                                               |
| Acciones de un registro (⋮ del detalle)                      | `RecordOptionsSheet`                                                                                              | `src/modules/finance/shared/components/record-options-sheet.tsx`                                                                                                                                                                               |
| Novedades de una versión (global)                            | `ReleaseNotesSheet`                                                                                               | `src/shared/components/layout/release-notes-sheet.tsx` — se monta en el shell autenticado vía `ReleaseNotes` (`src/modules/settings`); el texto curado vive en `src/shared/constants/release-notes.ts` (ver [versionado.md](../versionado.md)) |
| Confirmación de borrado                                      | `DeleteRecordDialog`                                                                                              | `src/modules/finance/shared/components/delete-record-dialog.tsx`                                                                                                                                                                               |

Un bloque con título en cualquier superficie (formulario, panel, sheet, lista, chat) es `SummarySection`. `Card` y sus partes no se importan en pantallas de producto. El primitivo `src/shared/components/ui/card.tsx` no sustituye a `SummarySection`. El agrupado de campos de un formulario vive en [form-sections.mdc](../../.cursor/rules/form-sections.mdc); el chrome, en [ui-shared-components.mdc](../../.cursor/rules/ui-shared-components.mdc).

No armar un drawer con `Drawer` crudo si `BottomSheet` cubre el caso (título, description, actions, pending).

`ReleaseNotesSheet` es la única hoja global del shell: aparece una vez por versión. La última versión vista vive en el perfil (`lastSeenReleaseVersion`; se marca con `PATCH /users/me/release-notes-seen`), y `localStorage` (`releaseNotesSeenVersion`) queda solo como caché para no mostrarla mientras el perfil carga. En la primera visita la versión actual se marca en silencio, sin hoja. El componente de `src/shared` es presentacional: recibe la versión vista y el marcado desde `ReleaseNotes` (`src/modules/settings`).

Un atajo del `RecordOptionsSheet` que abre otro sheet o navega a otra vista no cierra el menú antes: cerrarlo usa `router.back()`, y ese retroceso cancela la apertura pedida en el mismo click. El sheet nuevo reemplaza al menú en la URL, y la navegación a otra ruta lo desmonta.

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
- `Field` / `FieldLabel` / `FieldError` (`src/shared/components/ui/field.tsx`) → etiqueta y error en cualquier control con etiqueta, no solo en un formulario que envía
- Campos de texto y select, en cualquier vista: icono líder del tipo de dato (`FormTextField` `icon`, `SelectField` `icon`). Placeholder solo como ejemplo o formato. Un catálogo largo abre hoja, no un `Select` inline. Estado binario en una fila: icono + `aria-label`, no la etiqueta cruda.

### Botón de registrar o guardar

Estado del botón de envío: [`.cursor/rules/form-submit-disabled.mdc`](../../.cursor/rules/form-submit-disabled.mdc). Las reglas compartidas (`isPositiveAmountInput`, `isLedgerTargetInput`) viven en [`ledger-form.ts`](../../src/modules/finance/shared/lib/ledger-form.ts) con su spec.

## Reglas registradas (`.cursor/rules/`)

Una regla por archivo `.mdc`; se leen todas antes de crear o cambiar un control. El detalle vive en cada `.mdc`; aquí solo el índice y su componente canónico.

| Regla                                                                              | Componente o helper canónico                                                                           |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [ui-shared-components.mdc](../../.cursor/rules/ui-shared-components.mdc)           | `wheel-picker.tsx`, `BottomSheet`, `FinanceDateField`, `SummarySection` (bloque con título; no `Card`) |
| [leaf-module-ux.mdc](../../.cursor/rules/leaf-module-ux.mdc)                       | hero + `BottomSheet` (Keep Awake)                                                                      |
| [navigation-pending.mdc](../../.cursor/rules/navigation-pending.mdc)               | `LinkPendingOverlay` / `usePendingNavigation`                                                          |
| [confirm-important-changes.mdc](../../.cursor/rules/confirm-important-changes.mdc) | `AlertDialog`                                                                                          |
| [switch-row-icons.mdc](../../.cursor/rules/switch-row-icons.mdc)                   | `SettingsRow` / `SwitchFieldRow`                                                                       |
| [visual-status-icons.mdc](../../.cursor/rules/visual-status-icons.mdc)             | icono + `aria-label`                                                                                   |
| [form-shell-page.mdc](../../.cursor/rules/form-shell-page.mdc)                     | `FinanceFormScreen`                                                                                    |
| [form-shell-sheet.mdc](../../.cursor/rules/form-shell-sheet.mdc)                   | `BottomSheet` (acciones del sheet) + `useDiscardChanges`                                               |
| [form-sections.mdc](../../.cursor/rules/form-sections.mdc)                         | agrupado de campos del formulario                                                                      |
| [form-field-anatomy.mdc](../../.cursor/rules/form-field-anatomy.mdc)               | `Field` / `FieldLabel` / `FieldError` en cualquier control con etiqueta                                |
| [form-picker-fields.mdc](../../.cursor/rules/form-picker-fields.mdc)               | hoja de catálogo en cualquier vista; `usePicker` en el formulario                                      |
| [form-submit-flow.mdc](../../.cursor/rules/form-submit-flow.mdc)                   | constructor de payload + `toast`                                                                       |
| [form-derived-fields.mdc](../../.cursor/rules/form-derived-fields.mdc)             | campos derivados del estado elegido                                                                    |
| [form-submit-disabled.mdc](../../.cursor/rules/form-submit-disabled.mdc)           | botón de envío                                                                                         |
| [form-field-icons.mdc](../../.cursor/rules/form-field-icons.mdc)                   | icono líder en todo campo de dato                                                                      |
| [icons-required.mdc](../../.cursor/rules/icons-required.mdc)                       | icono obligatorio en todo botón y control                                                              |
| [input-placeholders.mdc](../../.cursor/rules/input-placeholders.mdc)               | placeholder solo para ejemplo o formato, en cualquier campo                                            |
| [list-infinite-scroll.mdc](../../.cursor/rules/list-infinite-scroll.mdc)           | `useInfiniteQuery` + `IntersectionObserver`                                                            |
| [ui-section-states.mdc](../../.cursor/rules/ui-section-states.mdc)                 | `FinanceListSkeleton` / `Empty` / `FinanceErrorState`                                                  |
| [ui-row-group.mdc](../../.cursor/rules/ui-row-group.mdc)                           | `SummarySection` o `SettingsSection` alrededor de las filas                                            |
| [finance-brand-logo.mdc](../../.cursor/rules/finance-brand-logo.mdc)               | `BrandLogo` / `CardNetworkMark`                                                                        |
| [finance-money-display.mdc](../../.cursor/rules/finance-money-display.mdc)         | `formatFinanceMoney`                                                                                   |

Molde: `transaction-form.tsx` y `transfer-form.tsx`. No copiar los componentes de Finanzas a otros módulos; sí el patrón.

## Primitivos shadcn

`Button`, `Input` (texto/número), `Switch`, `Select`, `Collapsible`, etc. en `src/shared/components/ui/`. Usarlos. No sustituyen a las ruedas de fecha/hora.
