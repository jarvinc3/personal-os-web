# Arquitectura — overview

**Personal OS web** es un cliente Next.js 16 (App Router) + React 19. No es el backend ni la app React Native.

```text
Browser  →  proxy.ts (sesión Supabase)
         →  app/(landing) | (auth) | (app)
         →  src/modules/*  +  src/shared  +  src/providers
         →  Nest API  (NEXT_PUBLIC_API_URL + API_PREFIX)
```

## Principios vigentes (producto)

- Multi-usuario: el API exige JWT; el cliente hidrata `GET /users/me`.
- IA integrada: chat en `/chat` con tools del backend.
- Módulos desacoplados en `src/modules/` con chrome compartido ([module-conventions.md](./module-conventions.md)).
- Automatización (Gmail) se opera desde Finance UI; las reglas viven en el backend.

## Stack de este repo (VERIFICADO)

| Capa            | Tecnología                                             |
| --------------- | ------------------------------------------------------ |
| Framework       | Next.js 16, React 19, Turbopack (`pnpm dev`)           |
| Auth            | `@supabase/ssr` + `@supabase/supabase-js`              |
| Datos servidor  | Nest envelope vía `src/config/api-client.ts`           |
| Estado servidor | TanStack Query                                         |
| Estado UI       | Zustand `app-store`                                    |
| Estilos         | Tailwind 4 + componentes en `src/shared/components/ui` |
| Tiempo real     | socket.io-client namespace `/notifications`            |
| Push            | Web Push + `public/sw.js` + VAPID                      |

> [!WARNING]
> **REV-WEB-001** (`CONTEXTO_NO_APLICABLE`) — `docs/project-guide.md` declaraba React Native como cliente principal, Frankfurter FX, parsers regex de email e IMAP. El cliente activo es este Next.js; FX es exchangerate.host en backend; ingestión es LLM. [review-register.md](../review-register.md#rev-web-001)

## Capas

| Path             | Rol                                           |
| ---------------- | --------------------------------------------- |
| `app/`           | Rutas delgadas (landing / auth / app)         |
| `src/modules/`   | Feature UI                                    |
| `src/shared/`    | Rutas, registry, layout, api-endpoints, store |
| `src/providers/` | Query, AuthBootstrap, Theme, AppEffects       |
| `src/config/`    | api-client, supabase                          |
| `proxy.ts`       | Refresh de sesión + guards de rutas           |

## Grupos de rutas

| Grupo                        | Layout                               | Auth                                         |
| ---------------------------- | ------------------------------------ | -------------------------------------------- |
| `(landing)`                  | marketing + legal                    | público                                      |
| `(auth)`                     | login / verify-email                 | público; login redirige a home si hay sesión |
| `(app)`                      | sidebar + header + KeepAwakeProvider | `proxy.ts` + `useAuthGuard`                  |
| `app/auth/callback/route.ts` | Route Handler                        | intercambio OAuth                            |

`/` redirige a `/home` o `/landing` según haya usuario Supabase.

Rutas protegidas (`isProtectedAppPath`): home, settings, chat, notifications, keep-awake, finance (y subpaths).

## Providers (árbol)

`app/layout.tsx` (raíz):

1. `QueryProvider`
2. `AuthBootstrapProvider`
3. `ThemeProvider`
4. `AppEffectsProvider` — tema, sockets notif/IA, registro Web Push (`usePushToken`)
5. Tooltip / Toaster

`app/(app)/layout.tsx`: `SidebarProvider` → `AppSidebar` → `HeaderProvider` → `AppHeader` + `main` → `KeepAwakeProvider` + `PendingAccountDeletionHandler`.

Detalle de sesión: [../infrastructure/auth-session.md](../infrastructure/auth-session.md). API: [../infrastructure/api-client.md](../infrastructure/api-client.md).

## Módulos (docs atómicos)

| Área                                         | Doc                                                             |
| -------------------------------------------- | --------------------------------------------------------------- |
| Auth (bootstrap, guards, 401)                | [../modules/auth/](../modules/auth/README.md)                   |
| Notifications (inbox, socket, push)          | [../modules/notifications/](../modules/notifications/README.md) |
| AI (`/chat`, stream, acciones)               | [../modules/ai/](../modules/ai/README.md)                       |
| Settings, Home, Finance, Keep Awake, Landing | [../modules/](../modules/README.md)                             |

## Evidencia

`package.json`, `app/layout.tsx`, `app/(app)/layout.tsx`, `proxy.ts`, `src/providers/`.
