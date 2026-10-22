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
| `NEXT_PUBLIC_APP_NAME`                 | Branding; la versión sale de `package.json` vía `next.config.mjs`                  |
| `NEXT_PUBLIC_LANDING_URL`              | Origen de la landing; sin valor usa la publicada                                   |
| `NEXT_OS` / `NEXT_ENV`                 | No públicas; settings usa también `NEXT_PUBLIC_ENV` (default `"preview"` si falta) |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_*`  | Sentry (opcional); sin DSN la SDK no se inicializa                                 |

## Variables de entorno y secretos

Infisical es la fuente de verdad: proyecto `personal-os`, entornos `dev` y `prod`, carpetas `/back` y `/web`. Vercel (web) y Railway (back) se llenan con sus Secret Syncs, así que no edites variables directo en esas plataformas: el siguiente sync sobrescribe el cambio.

El repo trae `.infisical.json` con el `workspaceId`. Con la CLI de Infisical instalada y la sesión iniciada:

```bash
infisical export --env=dev --path=/web > .env
# o el atajo
pnpm env:pull
```

`env:pull` reemplaza el `.env` local. No commitees ese archivo ni pongas valores reales en `.env.example`, documentación o tests.

## Arranque

```bash
cd personal-os-web
pnpm install
pnpm env:pull   # trae las variables de desarrollo desde Infisical
pnpm dev        # next dev --turbopack
```

Sin acceso a Infisical, copia `.env.example` a `.env.local` y ajusta los valores.

App típica: `http://localhost:3000`. CORS del API debe incluir ese origin.

## Troubleshooting

- API 401 → sign-out automático.
- Push no registra → permiso denegado o VAPID mismatch; no es Expo Go.
- OAuth Gmail finance: `CORS_ORIGIN` del API debe incluir `NEXT_PUBLIC_URL`.
- Sentry no reporta → falta DSN o el token de source maps; el build no falla por eso.
