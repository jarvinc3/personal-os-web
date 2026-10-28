# Capacidad: sesión

## Bootstrap

Montado en raíz (`AuthBootstrapProvider` → `useAuthBootstrap`):

1. `onAuthStateChange` (`INITIAL_SESSION`, refresh, sign-in/out).
2. Fallback 3s si no llegó `INITIAL_SESSION`.
3. Con sesión: `establishAuthenticatedSession` → `hydrateAuthUser` (`GET /users/me`) → store + `PROFILE_QUERY_KEY`.
4. `TOKEN_REFRESHED` con perfil ya hidratado: solo actualiza tokens, no re-fetch.
5. `bootstrapped=true` al terminar (o al fallar y limpiar). Hasta entonces `useAuthGuard().isLoading`.
6. En `/login` no se hidrata la sesión guardada: el proxy ya no encontró claims. El formulario se muestra sin esperar a `bootstrapped`, y un login o registro exitoso marca `bootstrapped=true` aunque el bootstrap siga pendiente.

## Login / registro

| Flujo                                    | Resultado                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| Login OK                                 | Hidrata perfil → toast → `/home`                                        |
| Registro con sesión inmediata            | Igual, `/home`                                                          |
| Registro pendiente de email              | code `REGISTER_PENDING_VERIFICATION` → `/verify-email?email=`           |
| Perfil backend inválido o error HTTP/red | `BackendProfileUnavailableError` → `revokeAuthSession`; no entra al app |

Google: `loginWithGoogle({ next })` → redirect IdP → `GET /auth/callback?code&next=`. `next` se usa tal cual en el redirect post-exchange (p. ej. `/settings` en delete). Sin `code` o error de exchange → `/login`.

El formulario se pinta desde el HTML: la pantalla no lee la URL y los sheets de móvil viven en su propio `Suspense` con `useSheetParam`. Mientras React hidrata, campos y botones están deshabilitados y el botón principal dice «Preparando…» (`useHydrated` + `resolveAuthFormGate`); antes el formulario no existía en el primer pintado y un clic en ese hueco se perdía sin error (#345). `LoginForm` y `RegisterForm` son `<form>` reales con `type="submit"`, así Enter envía desde la contraseña y el correo solo mueve el foco a la contraseña.

## Errores y contraseña

- El texto de Supabase nunca llega al usuario: cada código conocido tiene su mensaje en español y un código desconocido deja el respaldo de la operación.
- Credenciales inválidas no dicen si falló el correo o la contraseña.
- Registro y login exigen antes de enviar la misma política que Supabase: 6 caracteres como mínimo, con mayúscula, minúscula y número.

## 401

`api-client` en 401 emite `authEvents.emitUnauthorized` (salvo `suppressUnauthorizedEvent`). Bootstrap: clear store, quita `PROFILE_QUERY_KEY`, `signOut`, toast “Sesión expirada”.

## Logout

1. `deactivatePushTokenIfPresent`
2. `supabase.auth.signOut`
3. `clearAuthState` + remove profile queries → `/login`

## Delete account

- Password: sheet en Settings reautentica y `DELETE /users/me`.
- Google-only: `sessionStorage.pendingAccountDeletion='1'` + OAuth `next=/settings` → `PendingAccountDeletionHandler` → `deleteAfterReauth`. Alternativa pública `/delete-account`.

## Criterios

- `AC-AUTH-001` — Given JWT válido y fila `users`, When login, Then store tiene `user.profile` y navegación a `/home`.
- `AC-AUTH-002` — Given 401 del API sin `suppressUnauthorizedEvent`, When `apiGet`/`apiPost`, Then sign-out + toast “Sesión expirada”.
- `AC-AUTH-003` — Given `/users/me` 404/4xx/5xx o body sin `id`+`email`, When hidratar, Then no queda sesión de app.
- `AC-AUTH-004` — Given el HTML de `/login` antes de hidratar, When el usuario intenta escribir o enviar, Then los controles están deshabilitados y el envío no se pierde en silencio.

Evidencia: `use-auth.ts`, `use-auth-bootstrap.ts`, `hydrate-auth-user.ts`, `app/auth/callback/route.ts`, `proxy.ts`.
