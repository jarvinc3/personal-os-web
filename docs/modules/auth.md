# Auth Module (App)

## Scope

Client-side authentication with Supabase Auth. Handles login, registration, email verification, session hydration, and protected route guards.

## Routes

Route group: `app/(auth)`

| Screen           | Path                  | Purpose                                           |
| ---------------- | --------------------- | ------------------------------------------------- |
| Login / Register | `(auth)/index`        | Combined auth sheet with login and register forms |
| Verify email     | `(auth)/verify-email` | Post-signup email confirmation flow               |

Protected app screens live under `app/(app)` and use `useAuthGuard()`.

## Data layer

| Hook / lib         | Location             | Purpose                             |
| ------------------ | -------------------- | ----------------------------------- |
| `useAuth`          | `modules/auth`       | Login, register, logout mutations   |
| `useAuthGuard`     | `modules/auth`       | Redirect unauthenticated users      |
| `useAuthBootstrap` | `modules/auth/hooks` | Hydrate session on app start        |
| `hydrateAuthUser`  | `modules/auth/lib`   | Map Supabase user to app user shape |

## Bootstrap flow

1. App loads → Supabase session read from secure storage.
2. `useAuthBootstrap` calls `GET /auth/session` with JWT.
3. Backend emits `user.logged_in` and returns claims.
4. Profile fetched via `GET /users/me` when entering app shell.

## Components

- `LoginForm`, `RegisterForm` — credential auth UI
- `AuthSheetFooter` — shared footer for auth sheets

## Backend contract

- `GET /api/auth/session` — JWT validation and session payload
- User row in `public.users` created by Supabase trigger on signup

## Notes

- Tokens are managed by `@supabase/supabase-js`; never stored manually in app code.
- See `docs/supabase-auth-checklist.md` for setup verification steps.
