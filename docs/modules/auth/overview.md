# Auth — overview

Auth de **este** cliente con Supabase Auth. El backend Nest solo valida el JWT (JWKS) y sirve el perfil (`Users`). Sin fila en `public.users` (trigger de signup) no hay sesión de app.

## Alcance

- Login email/password, registro, verify-email, Google OAuth.
- Bootstrap de sesión + hidratación `GET /users/me`.
- Guards de cliente (`useAuthGuard`) y de edge (`proxy.ts`).
- Logout (desactiva push token) y 401 → sign-out.
- Reauth para borrar cuenta (password o Google).

## Fuera de alcance

- JWT strategy / JWKS (backend `docs/modules/auth/`).
- OAuth Gmail bancario (Finance ingestion).
- Pantallas RN / Expo.

## Rutas

| Path             | Grupo         | Notas                                      |
| ---------------- | ------------- | ------------------------------------------ |
| `/login`         | `(auth)`      | Bienvenida + sheets login/registro         |
| `/verify-email`  | `(auth)`      | Tras `REGISTER_PENDING_VERIFICATION`       |
| `/auth/callback` | Route Handler | Intercambia `code`; `next` default `/home` |
| `(app)/*`        | protegido     | `proxy.ts` + `useAuthGuard`                |

> [!WARNING]
> **REV-WEB-008** (`CONTRADICE_CODIGO`) — docs antiguas: chat “hidden from drawer”; rutas protegidas solo `/home` `/settings`. [registro archivado](../../archive/review-register.md)

## Autenticado en el cliente

`useAuthGuard().isAuthenticated` es `Boolean(user?.profile)`, no basta el JWT de Supabase. Si `/users/me` falla, se revoca la sesión (`BackendProfileUnavailableError`).
