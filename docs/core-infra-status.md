# Personal OS App - Core & Infra Status

Documento de estado para dejar trazabilidad de lo implementado en frontend (`personal-os-app`) y definir los siguientes pasos para cerrar core/infra antes de construir los modulos de producto (finanzas, agenda, proyectos, etc.).

> **Nota:** Este documento describe principalmente el cliente React Native (`personal-os-app`). Para el estado de **Fase 1 web** (`personal-os-web`: auth + settings), ver [`docs/modules/auth.md`](./modules/auth.md) y la app en `/login`, `/home`, `/settings`.

---

## 1) Estado actual (implementado)

## Auth (Supabase + Google)

- Migracion de auth local mock a Supabase real.
- `supabase-auth.service.ts` implementado con:
  - login email/password
  - registro con metadata (`full_name`)
  - logout
  - OAuth Google con `expo-web-browser` + `exchangeCodeForSession`
- Manejo de caso registro con verificacion de email (`REGISTER_PENDING_VERIFICATION`).
- `useAuthBootstrap` sincronizado con `supabase.auth.onAuthStateChange`.
- `useAuth` con mutations y feedback de errores/success via toast.

## UX de autenticacion

- Refactor a una sola pantalla `app/(auth)/index.tsx` (`APP_ROUTES.auth.landing`).
- Login y Register como `BottomSheetModal` (no pantallas separadas de flujo).
- Backdrop configurado (`pressBehavior="close"`) para cierre facil.
- StatusBar en auth forzado a `light`.
- Form login: Enter en email enfoca password, Enter en password envia.

## Integracion con backend core (Nest)

- `shared/constants/api-endpoints.ts` expandido con `API_BASE_URL`, `AUTH`, `USERS`, `NOTIFICATIONS`, `AI`.
- `shared/config/api-client.ts` creado con:
  - `apiGet/apiPost/apiPatch/apiDelete`
  - token bearer desde sesion Supabase
  - soporte de envelope `{ data, meta }`
  - `ApiError` tipado
- `use-profile` migrado a backend (`GET /users/me`, `PATCH /users/me`).
- Tipos de perfil alineados a modelo `User` backend.

## Notificaciones/push token (web)

- Web Push con service worker (`public/sw.js`) y suscripción VAPID.
- Hook `usePushToken` registra token en `POST /notifications/push-tokens` cuando push está activo y el permiso del navegador es `granted`.
- `DevicePushSettingsRow` en Ajustes e inbox para activar permisos del navegador (gesto explícito).
- Desactivación al apagar push o logout (`deactivatePushTokenIfPresent`).
- Integrado en `AppEffectsProvider` junto a sockets de notificaciones e IA.
- Variables: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (web), `VAPID_*` (backend).

## Centro de notificaciones (in-app)

- Pantalla `/notifications` con lista paginada, marcar leída y marcar todas.
- `NotificationBell` en header con badge (`GET /notifications/unread-count`).
- Hooks React Query: `useNotifications`, `useUnreadCount`, invalidación vía Socket.IO (`useNotificationsSocket`).
- Política alineada con backend: quiet hours no oculta IN_APP; toggles por módulo en `data`.

## Chat IA

- Drawer `/chat` — Agente IA con SSE + fallback JSON solo pre-servidor.
- Idempotencia con `clientMessageId`; sin duplicación por re-envío.
- CRUD sesiones + sheet de historial; selector de módulo (general/agenda/projects/health/subscriptions).
- Tool calling: theme, preferencias, módulos; tarjetas de acción Confirmar/Cancelar.
- Markdown básico en burbujas; `useAiSocket` + `useThemeSync` globales.
- Atajos desde Home → `/chat?module=...`

## Ajustes (Settings / perfil)

- Ruta `app/(app)/settings` — módulo `modules/settings` (antes profile).
- Sheets por sección: cuenta, tema, IA, quiet hours, módulos (finance, agenda, etc.).
- `useProfile` → `GET/PATCH /users/me` y merge de `preferences` / `userModules`.
- Pull-to-refresh en Ajustes e Inicio.

## Configuracion y branding

- `app.json` actualizado:
  - name: `Personal OS`
  - slug/scheme: `personal-os`
  - package/bundle ids actualizados
  - plugin `expo-web-browser`
- `.env` y `.env.example` con `EXPO_PUBLIC_API_URL=http://localhost:3100/api`.
- Checklist operativo en `docs/supabase-auth-checklist.md`.

---

## 2) Riesgos/observaciones actuales

1. **Metro + NativeWind watcher crash intermitente**
  Se observo error `addedFiles` en desarrollo. No es logica de app, sino watcher/tooling.
2. **Expo Go limitacion de push remoto**
  Comportamiento esperado; push remoto requiere development build o standalone.

---

## 3) Siguiente fase (para dejar core/infra robusto)

## A. Estabilidad de entorno dev

- Estandarizar Node LTS (recomendado Node 20) y documentar en repo (`.nvmrc`).
- Agregar guia de arranque limpia para Metro/Expo (`expo start -c`) y troubleshooting.

## B. Endurecer capa de networking

- Unificar manejo de errores API por codigo HTTP (401/403/404/500) con mensajes UX consistentes.
- Agregar retry/backoff selectivo solo para errores transient (red/5xx), no para validaciones.
- Añadir telemetria minima en cliente (requestId/path cuando venga en `meta`).

## C. Hardening de auth

- Validar flujo de expiracion/refresh de token en sesiones largas.
- Definir comportamiento UX estandar para `SIGNED_OUT` por token invalido/expirado.
- Agregar pantalla/estado explicito de "verifica tu email" opcional (si producto lo requiere).

## D. Push notifications readiness

- Crear development build y validar alta real de token en backend.
- Desactivacion de token en logout implementada.
- Registro de push condicionado a `preferences.notifications.channels.push`.
- Centro in-app implementado: pantalla `/notifications`, campana con badge, Socket.IO para refresco.
- Pendiente: FCM/APNs real (sender en backend).

## E. Calidad y automatizacion

- Tests de integracion para auth hooks (`login`, `register`, `oauth`, `bootstrap`, `logout`).
- Tests de API client (envelope parse + `ApiError`).
- Smoke tests de rutas auth/app y redirecciones.

## F. Documentacion de core

- `docs/core-runbook.md` — operación local.
- `docs/core-contracts.md` — contratos v1 (perfil, notificaciones in-app, chat IA, sesiones).
- Referencia canónica de defaults: `docs/user-settings-defaults.json` (raíz del monorepo).

---

## 4) Criterio de “Core listo” antes de modulos

Se considera listo para iniciar modulos de negocio cuando:

- Auth + sesion + perfil funcionan de extremo a extremo en Android/iOS/web.
- API client y errores estan estandarizados.
- Push token flujo base validado en development build.
- Entorno dev es estable (sin crashes recurrentes de Metro watcher).
- Existe runbook de setup y troubleshooting para el equipo.

---

## 5) Referencias

- `docs/core-contracts.md`
- `docs/supabase-auth-checklist.md`
- `app/(auth)/index.tsx`
- `app/(app)/settings/index.tsx`
- `app/(app)/notifications/index.tsx`
- `app/(app)/chat/index.tsx`
- `modules/auth/services/supabase-auth.service.ts`
- `modules/auth/hooks/use-auth-bootstrap.ts`
- `modules/notifications/`
- `modules/ai/`
- `modules/settings/`
- `shared/config/api-client.ts`
- `shared/constants/api-endpoints.ts`
