# Runbook web

## Requisitos

- Node 20+, pnpm
- Backend Nest en `personal-os-back`
- Proyecto Supabase Auth (email + Google)

## Env (`.env.example`)

| Variable                               | Uso                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase                                                                           |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon key                                                                           |
| `NEXT_PUBLIC_API_URL`                  | Origin API, ej. `http://localhost:3100`                                            |
| `NEXT_PUBLIC_API_PREFIX`               | `api`                                                                              |
| `NEXT_PUBLIC_URL`                      | Origin de esta app (OAuth returnTo, CORS)                                          |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`         | Web Push                                                                           |
| `NEXT_PUBLIC_APP_NAME` / `VERSION`     | Branding                                                                           |
| `NEXT_PUBLIC_LANDING_URL`              | Origen de la landing; sin valor usa la publicada                                   |
| `NEXT_OS` / `NEXT_ENV`                 | No públicas; settings usa también `NEXT_PUBLIC_ENV` (default `"preview"` si falta) |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_*`  | Sentry (opcional); sin DSN la SDK no se inicializa                                 |

## Arranque

```bash
cd personal-os-web
cp .env.example .env.local   # o .env según el proyecto
pnpm install
pnpm dev                     # next dev --turbopack
```

App típica: `http://localhost:3000`. CORS del API debe incluir ese origin.

## Troubleshooting

- API 401 → sign-out automático.
- Push no registra → permiso denegado o VAPID mismatch; no es Expo Go.
- OAuth Gmail finance: `CORS_ORIGIN` del API debe incluir `NEXT_PUBLIC_URL`.
- Sentry no reporta → falta DSN o el token de source maps; el build no falla por eso.
