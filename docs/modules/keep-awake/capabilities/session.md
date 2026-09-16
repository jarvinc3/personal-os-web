# Capacidad: sesión Keep Awake

## Data layer

| Pieza | Path |
| --- | --- |
| Provider | `context/keep-awake-context.tsx` |
| `useWakeLock` | `hooks/use-wake-lock.ts` |
| Session | `lib/wake-lock-session.ts` |
| Status / timer | `lib/session-status.ts` |
| Live storage | `lib/session-storage.ts` — `{ startTimestamp, ownerId, endsAt, pause }` key `keepawake_start_ts` |
| History | `lib/session-history.ts` — `keepawake_history` max 50; reasons `ended`, `countdown_finished`, `tab_yielded`; legacy `paused` se muestra “Pausada” |
| Prefs | `lib/prefs.ts` — `keepawake_prefs` |
| Reminders | `lib/reminders.ts` — `keepawake_reminder` |
| PiP | `lib/document-pip.ts` |
| Errors | `lib/wake-lock-error.ts` |

Legacy epoch strings se aceptan. Records >24h o futuro se descartan.

## Modos

- Libre: hero elapsed `Tiempo` (incluye `00:00:00` idle).
- Temporizador: 15/25/45/60 o custom; hero `Quedan`. Al `endsAt` auto-stop + toast + history. Tab oculta aplica expiry al volver visible.

## Fases

`unsupported` | `idle` | `activating` | `active` | `paused` | `interrupted` | `pausing` | `ending`.

Pausar suelta sentinel y congela tiempo; Continuar reacquire (countdown se desplaza). Terminar escribe history. Tab hidden → `interrupted` (no pause de usuario); retry al visible. Elapsed corre durante `interrupted`.

## Reminders

Clock local; **nunca** pide Wake Lock solo. Confirmación de usuario. Browsers no adquieren lock desde tab oculta de forma fiable.

## UX

Título solo en shell header. Un número hero. Help “Cómo funciona” en status header. Timer/toggle también en PiP via portal. Duración copiable del timer o history.

## Browser

Wake Lock: `"wakeLock" in navigator` — empty state si falta. Document PiP: `documentPictureInPicture`; lock sigue en el tab.

Entradas: sidebar Aplicaciones, Home card.
