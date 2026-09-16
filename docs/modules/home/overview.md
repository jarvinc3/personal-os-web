# Home — overview

## Propósito

Página de inicio post-login: saludo con nombre de perfil y atajos a notificaciones, chat, ajustes, finanzas y Keep Awake.

## Alcance

- Ruta `/home` bajo `app/(app)`.
- `useAuthGuard` + redirect a login si no hay sesión.
- Header: subtitle `Hola,` + `fullName` (perfil o user store).
- No es `ModuleAppNav`; no tiene tab bar.

## Fuera de alcance

- Dashboard financiero (eso es `/finance`).
- Lista de notificaciones (eso es `/notifications`).

## Dependencias

`useProfile` (`GET /users/me`), `APP_ROUTES`, shell `(app)`.
