# Supabase Auth — Checklist operativo

Checklist para configurar autenticación en Personal OS (app + backend).

## Supabase Dashboard

- [ ] Proyecto Supabase creado y `SUPABASE_URL` / keys en `.env` (app y backend)
- [ ] **Email** provider habilitado (Authentication → Providers)
- [ ] **Google** provider habilitado con Client ID / Secret de Google Cloud
- [ ] Redirect URLs incluyen:
  - `personal-os://**`
  - URLs de Expo dev si aplica (`exp://...`)
- [ ] Site URL configurada para el entorno de desarrollo
- [ ] Trigger o función que crea fila en `public.users` al registrarse (requerido por `GET /users/me`)

## Google Cloud Console

- [ ] OAuth 2.0 Client (Web) con redirect URI de Supabase
- [ ] OAuth consent screen configurado

## App (`personal-os-app`)

- [ ] `.env` con `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_API_URL`
- [ ] `EXPO_PUBLIC_API_URL` usa IP LAN en dispositivo físico (no `localhost`)
- [ ] Scheme `personal-os` en `app.json`
- [ ] Plugin `expo-web-browser` para OAuth Google

## Backend (`personal-os-back`)

- [ ] `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` en `.env`
- [ ] JWT validado vía JWKS (`/auth/v1/.well-known/jwks.json`)
- [ ] `GET /api/auth/session` responde 200 con token válido

## Verificación E2E

1. Registro email/password → verificar email si está habilitado
2. Login → `GET /users/me` devuelve perfil
3. Google OAuth → sesión activa y perfil cargado
4. Token expirado / 401 → sign-out automático y toast "Sesión expirada"
5. Logout → push token desactivado (dev build)

## Referencias

- [`core-runbook.md`](./core-runbook.md)
- [`core-contracts.md`](./core-contracts.md)
