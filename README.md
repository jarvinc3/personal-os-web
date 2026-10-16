# Personal OS — Web

**Estado:** beta (0.x). Política de versiones en [docs/versionado.md](./docs/versionado.md).

Cliente Next.js de Personal OS (finanzas, ajustes, notificaciones, chat IA, Keep Awake).

**Documentación:** [docs/README.md](./docs/README.md) · [AGENTS.md](./AGENTS.md) · [Glosario: App y módulo](./docs/glosario.md)

API: repositorio hermano `personal-os-back`.

## Stack

Next.js 16 (App Router) + React 19, Tailwind 4, TanStack Query, Zustand, `@supabase/ssr`, Sentry.

## Arranque

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

## Scripts

| Script              | Qué hace                                    |
| ------------------- | ------------------------------------------- |
| `pnpm dev`          | Next en desarrollo (`next dev --turbopack`) |
| `pnpm build`        | Build de producción                         |
| `pnpm lint`         | ESLint                                      |
| `pnpm format:check` | Prettier sobre `ts`, `tsx` y `md`           |
| `pnpm typecheck`    | `tsc --noEmit`                              |
| `pnpm test`         | Tests de reglas (`node --test`)             |

## Entorno

Todo en [.env.example](./.env.example): Supabase, API, Web Push (VAPID), Logo.dev y Sentry (opcional; sin DSN la SDK no se inicializa).

Runbook: [docs/operations/runbook.md](./docs/operations/runbook.md).
