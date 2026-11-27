# Capacidad: sesión Keep Awake

## Data layer

| Pieza          | Path                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Provider       | `context/keep-awake-context.tsx`                                                                                                                  |
| `useWakeLock`  | `hooks/use-wake-lock.ts`                                                                                                                          |
| Session        | `lib/wake-lock-session.ts`                                                                                                                        |
| Status / timer | `lib/session-status.ts`                                                                                                                           |
| Live storage   | `lib/session-storage.ts` — `{ startTimestamp, ownerId, endsAt, pause }` key `keepawake_start_ts`                                                  |
| History        | `lib/session-history.ts` — `keepawake_history` max 50; reasons `ended`, `countdown_finished`, `tab_yielded`; legacy `paused` se muestra “Pausada” |
| Prefs          | `lib/prefs.ts` — `keepawake_prefs`                                                                                                                |
| Reminders      | `lib/reminders.ts` — `keepawake_reminder`                                                                                                         |
| PiP            | `lib/document-pip.ts`                                                                                                                             |
| Errors         | `lib/wake-lock-error.ts`                                                                                                                          |

Legacy epoch strings se aceptan. Records >24h o futuro se descartan.

## Modos

- Libre: hero elapsed `Tiempo` (incluye `00:00:00` idle). Se elige con **Limpiar** en el popover del temporizador (no hay botón Libre).
- Temporizador: un botón abre un popover con presets 15/25/45/60 min, `DurationWheels` (horas + minutos) y Aceptar / Cancelar / Limpiar. Hero `Quedan`. Al `endsAt` auto-stop + toast + history. Tab oculta aplica expiry al volver visible.

## Fases

`unsupported` | `idle` | `activating` | `active` | `paused` | `interrupted` | `pausing` | `ending`.

Pausar suelta sentinel y congela tiempo; Continuar reacquire (countdown se desplaza). Terminar escribe history. Tab hidden → `interrupted` (no pause de usuario); retry al visible. Elapsed corre durante `interrupted`.

## Reminders

Clock local; **nunca** pide Wake Lock solo. **Guardar** persiste y activa; **Quitar** lo apaga. `days: []` = todos los días. Dispara en una ventana de 5 min (`isReminderDue`). El aviso es una hoja flotante (`Drawer` con `FLOATING_SHEET_CONTENT_CLASS`) en Keep Awake; `Notification` si el permiso está granted. `TimePairWheels` (`HH:mm`, `minuteStep={1}`). Ver [ui-components.md](../../../architecture/ui-components.md).

## UX

Título solo en shell header. Un número hero. Chrome y sesión viven en `keep-awake-screen.tsx`: Recordatorio e Historial (sheets, izquierda); alerta PiP y Help “Cómo funciona” (derecha). Reminder activo: punto en la campana y chip con la hora. No hay tabs locales ni un panel intermedio. Timer/toggle también en PiP via portal. Duración copiable del timer o history.

Molde de módulo hoja para otras vistas: [module-conventions.md — Módulo hoja (UX)](../../../architecture/module-conventions.md#módulo-hoja-ux).

## Browser

Wake Lock: `"wakeLock" in navigator` — empty state si falta. Document PiP: `documentPictureInPicture`; lock sigue en el tab.

Entradas: sidebar Aplicaciones, Home card.
