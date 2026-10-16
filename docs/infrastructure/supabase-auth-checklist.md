# Supabase Auth — checklist (web)

## Dashboard

- [ ] Proyecto + `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en web; `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` en backend
- [ ] Email y Google providers
- [ ] Redirect URLs: origin de `NEXT_PUBLIC_URL` (ej. `http://localhost:3000`) + `/auth/callback`
- [ ] Trigger que crea `public.users` al signup

## Google Cloud

- [ ] OAuth client web con redirect de Supabase
- [ ] Consent screen

## Backend

- [ ] JWKS validation
- [ ] `GET /api/auth/session` 200 con JWT válido (opcional para web; el bootstrap usa `/users/me`)

## E2E manual

1. Registro → verify-email si aplica
2. Login → perfil
3. Google OAuth → sesión
4. 401 → sign-out
5. Logout → push deactivate

> [!WARNING]
> **REV-WEB-005** (`CONTEXTO_NO_APLICABLE`) — checklist anterior incluía `personal-os://**`, Expo, `EXPO_PUBLIC_*`, scheme `app.json`. [registro archivado](../archive/review-register.md)
