# Auth Module (Web)

## Scope

Client-side authentication with Supabase Auth. Handles login, registration, email verification, Google OAuth, session hydration, and protected route guards.

## Routes

| Screen         | Path             | Purpose                                          |
| -------------- | ---------------- | ------------------------------------------------ |
| Auth landing   | `/login`         | RN-style welcome screen; login/register in Sheet |
| Verify email   | `/verify-email`  | Post-signup email confirmation flow              |
| OAuth callback | `/auth/callback` | Exchanges OAuth code; optional `?next=` redirect |

Protected app screens live under `app/(app)` (`/home`, `/settings`) and use `useAuthGuard()`. Unauthenticated access is also blocked by `proxy.ts`.

## Data layer

| Hook / lib              | Location                                       | Purpose                               |
| ----------------------- | ---------------------------------------------- | ------------------------------------- |
| `useAuth`               | `modules/auth/hooks/use-auth.ts`               | Login, register, Google OAuth, logout |
| `useAuthGuard`          | `modules/auth/hooks/use-auth-guard.ts`         | Redirect unauthenticated users        |
| `useAuthBootstrap`      | `modules/auth/hooks/use-auth-bootstrap.ts`     | Hydrate session on app start          |
| `AuthBootstrapProvider` | `shared/providers/auth-bootstrap-provider.tsx` | Mounts bootstrap in root layout       |
| `hydrateAuthUser`       | `modules/auth/lib/hydrate-auth-user.ts`        | Map Supabase user + `GET /users/me`   |

## Bootstrap flow

1. Root layout mounts `QueryProvider` → `AuthBootstrapProvider`.
2. `useAuthBootstrap` reads Supabase session from browser storage.
3. If session exists, `hydrateAuthUser` calls `GET /users/me` and updates the app store.
4. `useAuthGuard` exposes `isLoading: !bootstrapped` until step 2–3 complete.

## OAuth flow

1. User taps “Continuar con Google” → `signInWithOAuth` redirects to Google.
2. Google returns to `/auth/callback?code=…&next=/home` (or `/settings` for account deletion re-auth).
3. Server route exchanges code for session and redirects to `next`.
4. Bootstrap hydrates profile on the destination page.

## Google-only account deletion

1. User opens delete sheet → “Confirmar con Google”.
2. `sessionStorage.pendingAccountDeletion = '1'` + OAuth with `next=/settings`.
3. After callback, `PendingAccountDeletionHandler` shows final confirmation.
4. `deleteAfterReauth()` calls `DELETE /users/me`, clears session, redirects to `/login`.

## Components

- `AuthLandingScreen` — welcome layout + auth sheets
- `LoginForm`, `RegisterForm` — credential auth (FieldGroup + Field validation)
- `AuthFormFooter` — switch login ↔ register inside sheets

## Backend contract

- `GET /users/me` — profile hydration after login (required before entering app)
- `DELETE /users/me` — permanent account deletion after re-authentication
- User row in `public.users` created by Supabase trigger on signup

## Notes

- Tokens are managed by `@supabase/supabase-js`; never stored manually in app code.
- See `docs/supabase-auth-checklist.md` for redirect URL and provider setup.
