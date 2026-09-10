# Keep Awake Module (Web)

## Scope

Client-only utility that keeps the screen awake via the **Wake Lock API** and
optionally shows session controls in a **Document Picture-in-Picture** window.
No backend endpoints or database tables: a server cannot hold a screen wake
lock. Persistence is local (`localStorage` + `BroadcastChannel`) so the session
can survive reloads and stay coordinated across tabs.

## Routes

| Screen     | Path          | Purpose                                      |
| ---------- | ------------- | -------------------------------------------- |
| Keep Awake | `/keep-awake` | Activate, pause/resume, or end the wake lock; open miniplayer UI |

Protected under `app/(app)` with `useAuthGuard()` and `proxy.ts`.

The wake lock lives in `KeepAwakeProvider` (`app/(app)/layout.tsx`), not in the
page. Navigating to Home, Finanzas or any other authenticated route **does not**
release the lock. The lock is released when the app layout unmounts, the user
pauses or ends the session, or another tab claims ownership. Pausing keeps the
same session so **Continuar** can reacquire the lock without starting over.

## Data layer

| Piece               | Location                                            | Purpose                                        |
| ------------------- | --------------------------------------------------- | ---------------------------------------------- |
| `KeepAwakeProvider` | `modules/keep-awake/context/keep-awake-context.tsx` | App-shell session + PiP portal                 |
| `useWakeLock`       | `modules/keep-awake/hooks/use-wake-lock.ts`         | Browser adapters, PiP transfer, visibility     |
| `wake-lock-session` | `modules/keep-awake/lib/wake-lock-session.ts`       | Activate, restore, countdown auto-stop         |
| `session-status`    | `modules/keep-awake/lib/session-status.ts`          | Phase, copy, hero timer display                |
| `session-storage`   | `modules/keep-awake/lib/session-storage.ts`         | Live `{ startTimestamp, ownerId, endsAt, pause }` |
| `session-history`   | `modules/keep-awake/lib/session-history.ts`         | Closed sessions in `keepawake_history`         |
| `prefs`             | `modules/keep-awake/lib/prefs.ts`                   | Libre vs temporizador and duration             |
| `reminders`         | `modules/keep-awake/lib/reminders.ts`               | Local reminder; lock still needs confirmation  |

Live session start is persisted under `keepawake_start_ts`. Legacy raw epoch
strings are still accepted. Records older than 24 hours or too far in the
future are discarded. Closed sessions are appended to `keepawake_history`
(max 50) with `ended`, `countdown_finished` or `tab_yielded`. Older `paused`
rows are still shown as “Pausada”.

## Session modes

- **Libre:** open-ended lock. Hero shows elapsed `Tiempo` (including `00:00:00` when idle).
- **Temporizador:** presets 15/25/45/60 min or a custom duration. Hero shows
  `Quedan`. At `endsAt` the session auto-stops, toasts, and writes history.
  If the tab was hidden, expiry is applied when it becomes visible again.

## Session states

| Phase         | Meaning                                              |
| ------------- | ---------------------------------------------------- |
| `unsupported` | Wake Lock API is missing                             |
| `idle`        | User has not requested a session                     |
| `activating`  | Request or resume in flight                          |
| `active`      | Session requested and the sentinel is held           |
| `paused`      | User paused; same session, lock released, timer frozen |
| `interrupted` | Session requested, but the OS released the sentinel  |
| `pausing`     | User pause in flight                                 |
| `ending`      | User ended the session; release in flight            |

**Pausar** releases the sentinel and freezes elapsed/remaining time. **Continuar**
reacquires the lock on the same session (countdown deadline shifts by the pause).
**Terminar** writes history and clears the live record. Hiding the browser tab
can release the sentinel; that is `interrupted`, not a user pause, and Keep Awake
retries when the document is visible again. Changing **sections inside Personal
OS** does not end the session. Elapsed time keeps running during `interrupted`.

## Reminders

A local clock reminder can notify at a time (and optional weekdays). The
notification or in-app banner **never** requests Wake Lock by itself. The user
must confirm. Browsers cannot reliably acquire a lock from a hidden tab.

## UX notes

- The shell header is the only page title (no duplicate hero in the body).
- One hero number: elapsed **or** remaining, never both.
- Help (“Cómo funciona”) opens from the status header, not as an inline section.
- Timer and compact toggle also render inside the PiP panel via `createPortal`
  from the provider, so the miniplayer survives in-app navigation.
- Duration can be copied from the live timer or a history row.

## Browser support

- **Wake Lock**: detected at runtime (`"wakeLock" in navigator`). Unsupported
  browsers see an empty state instead of the controls.
- **Document PiP**: detected at runtime (`documentPictureInPicture`). Wake lock
  still works on the tab; a non-blocking alert explains the limitation.

## Navigation entry points

- Sidebar → Aplicaciones → Keep Awake
- Home → card “Keep Awake”
