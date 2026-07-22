# Keep Awake Module (Web)

## Scope

Client-only utility that keeps the screen awake via the **Wake Lock API** and
optionally shows session controls in a **Document Picture-in-Picture** window.
No backend endpoints or database tables.

## Routes

| Screen     | Path          | Purpose                                      |
| ---------- | ------------- | -------------------------------------------- |
| Keep Awake | `/keep-awake` | Activate/pause wake lock; open miniplayer UI |

Protected under `app/(app)` with `useAuthGuard()` and `proxy.ts`.

## Data layer

| Piece            | Location                                      | Purpose                                      |
| ---------------- | --------------------------------------------- | -------------------------------------------- |
| `useWakeLock`    | `modules/keep-awake/hooks/use-wake-lock.ts`   | Lock lifecycle, timer, PiP window            |
| `document-pip`   | `modules/keep-awake/lib/document-pip.ts`      | Open PiP, copy styles, visibility helpers    |
| `format-elapsed` | `modules/keep-awake/lib/format-elapsed.ts`    | `HH:MM:SS` formatting                        |
| Storage key      | `modules/keep-awake/constants/storage.ts`     | `localStorage` session start timestamp       |

Session start time is persisted in `localStorage` (`keepawake_start_ts`) so a
reload can restore an active session. There is no server sync.

## UX notes

- Main page shows **Activo / Inactivo** and CTAs only (no timer).
- Timer and compact toggle render inside the PiP panel via `createPortal`.
- When PiP opens while active, the wake lock is re-acquired against the PiP
  window `navigator` so the lock stays valid while the opener tab is hidden.

## Browser support

- **Wake Lock**: Chromium-based browsers and recent Firefox/Safari where available.
- **Document PiP**: Chrome/Edge and recent Firefox. Unsupported browsers still
  get wake lock on the tab; a support banner explains the limitation.

## Navigation entry points

- Sidebar → Aplicaciones → Keep Awake
- Home → card “Keep Awake”
