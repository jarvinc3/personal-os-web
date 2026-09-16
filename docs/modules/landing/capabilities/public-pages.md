# Capacidad: páginas públicas

## Proxy

`/` → `/home` o `/landing` según usuario Supabase. Landing **no** usa `useAuthGuard`.

## Superficies

| Path | Rol |
| --- | --- |
| `/landing` | Marketing, features, módulos, waitlist |
| `/privacy` `/terms` `/faq` `/contact` | Legal / FAQ / contacto |
| `/delete-account` | Flujo público Google-only (también hay handler autenticado en Settings) |

## Criterios

- `AC-LND-001` — Given sin sesión, When `/`, Then redirect `/landing`.
- `AC-LND-002` — Given sesión, When `/`, Then redirect `/home`.

Waitlist/contacto: UI visible; persistencia de servidor no verificada — REV-WEB-014.

Evidencia: `proxy.ts`, `app/(landing)/`, `src/modules/landing/`.
