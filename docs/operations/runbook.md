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

Infisical es la fuente de verdad: proyecto `personal-os`, entornos `dev` y `prod`, carpetas `/back` y `/web`. Vercel (web) y Railway (back) se llenan con sus Secret Syncs, así que no edites variables directo en esas plataformas. Los syncs tienen activado el borrado: cualquier variable de Railway o Vercel que no exista en Infisical se elimina en el siguiente sync, y los cambios manuales se sobrescriben. Las variables nuevas se agregan solo en Infisical.

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

## Pruebas

`pnpm test` corre node:test con `scripts/test-env.mjs` (variables públicas de prueba), `scripts/alias-register.mjs` (alias `@/`, relativos sin extensión y subpaths de `next/*`) y `scripts/tsx-register.mjs` (compila los `.tsx` con el `typescript` del repo, stubea los `.css` y deja source maps para la cobertura). Una prueba `.spec.ts` puede importar una pantalla completa; para renderizarla, las que usan hooks de router necesitan props o un stub. Las pruebas que simulan interacción usan jsdom: `installTestDom` (`src/shared/lib/fixtures/test-dom.ts`) monta el DOM, renderiza con `act` y expone `pressKey` y `waitForScreen`, y `TestNextRouter` (`src/shared/lib/fixtures/test-next-router.tsx`) da los contextos de `next/navigation`. Instala el DOM antes de importar `react-dom/client` o `next/dynamic`: ambos deciden al cargar si hay navegador. No hay Testing Library. `pnpm test:coverage` usa el mismo setup y aplica los umbrales de `package.json`.

Los estados de una pantalla se prueban afirmando textos, roles y el botón de reintento, sin snapshots de HTML completo. Ejemplos: `src/modules/settings/components/usage/usage-state-view.spec.ts` y `src/shared/lib/tsx-loader.spec.ts`. La prueba que abre el chat del agente como el usuario, `src/modules/intelligence/components/agent-chat-host.spec.ts`, monta el host con sus proveedores, pulsa Ctrl/Cmd+K y espera la hoja.

## Troubleshooting

- API 401 → sign-out automático.
- Push no registra → permiso denegado o VAPID mismatch; no es Expo Go.
- OAuth Gmail finance: `CORS_ORIGIN` del API debe incluir `NEXT_PUBLIC_URL`.
- Sentry no reporta → falta DSN o el token de source maps; el build no falla por eso.
