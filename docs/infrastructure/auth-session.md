# Sesión y proxy

Infra transversal. Comportamiento de producto: [../modules/auth/](../modules/auth/README.md).

## Árbol

1. `app/layout.tsx`: QueryProvider → AuthBootstrapProvider → Theme → AppEffects.
2. `useAuthBootstrap` (`BOOTSTRAP_FALLBACK_MS` = 3s si no llega `INITIAL_SESSION`). En `/login` no hidrata la sesión guardada: el proxy ya la descartó y el formulario no espera al bootstrap.
3. Con sesión: `establishAuthenticatedSession` → `hydrateAuthUser` (`GET /users/me`) → store + `PROFILE_QUERY_KEY` = `['profile','me']`.
4. `TOKEN_REFRESHED` con `user.profile` ya hidratado: actualiza tokens, no re-fetch.
5. `useAuthGuard` en páginas `(app)`: `isLoading: !bootstrapped`; autenticado = `Boolean(user?.profile)`. La pantalla de login no usa `isLoading`: muestra el formulario y redirige cuando hay perfil.
6. `proxy.ts` bloquea unauthenticated en home/settings/chat/notifications/keep-awake/finance; `/` redirige a `/home` con sesión y a `/login` sin ella; `/login` bounce si ya hay sesión.

Tokens: `@supabase/ssr` + `@supabase/supabase-js`; no se guardan a mano.

Google OAuth: `signInWithOAuth` → `GET /auth/callback` intercambia `code`. Query `next` se usa tal cual (default `/home`).

401: `api-client` emite `authEvents` salvo `suppressUnauthorizedEvent` (push register/deactivate). Bootstrap: clear + `signOut` + toast “Sesión expirada”.

Evidencia: `src/providers/auth-bootstrap-provider.tsx`, `src/modules/auth/hooks/*`, `proxy.ts`.

> [!WARNING]
> **REV-WEB-003** (`CONTRADICE_CODIGO`) — `auth.md` antiguo citaba `shared/providers/auth-bootstrap-provider.tsx`. Path real: `src/providers/`. [registro archivado](../archive/review-register.md)
