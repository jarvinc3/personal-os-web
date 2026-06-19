# Personal OS — Core API Contracts (Frontend ↔ Backend)

Contratos mínimos usados por `personal-os-app` hoy. Base URL: `EXPO_PUBLIC_API_URL` (ej. `http://host:3100/api`).

Autenticación: header `Authorization: Bearer <supabase_access_token>`.

## Envelope de respuesta

Respuestas exitosas con cuerpo JSON:

```json
{
  "data": { },
  "meta": {
    "timestamp": "2026-05-18T...",
    "path": "/users/me",
    "requestId": "optional-uuid"
  }
}
```

El cliente (`api-client.ts`) extrae `data` automáticamente. En errores, `meta.requestId` y `meta.path` se adjuntan a `ApiError` cuando existen.

Errores Nest típicos:

```json
{
  "statusCode": 404,
  "message": "User not found",
  "path": "/users/me"
}
```

## Users

### `GET /users/me`

Perfil del usuario autenticado.

**Response `data`:**

| Campo         | Tipo                                                 |
| ------------- | ---------------------------------------------------- |
| `id`          | string                                               |
| `email`       | string                                               |
| `fullName`    | string \| null                                       |
| `avatarUrl`   | string \| null                                       |
| `timezone`    | string \| null                                       |
| `locale`      | string \| null                                       |
| `preferences` | object (ver abajo, incluye `fieldGuide` por sección) |
| `userModules` | array (config por módulo activo)                     |
| `createdAt`   | string (ISO)                                         |
| `updatedAt`   | string (ISO)                                         |

### `PATCH /users/me`

Actualización parcial del perfil.

**Body (todos opcionales):**

```json
{
  "fullName": "string",
  "avatarUrl": "string",
  "timezone": "string",
  "locale": "string",
  "preferences": { }
}
```

`preferences` se mergea en backend; enviar solo las claves que cambian o el objeto completo según implementación del servicio.

**`preferences` — forma esperada (v1, persistida con `fieldGuide`):**

Referencia canónica: `docs/user-settings-defaults.json` → `users.preferences`.

```json
{
  "version": 1,
  "theme": {
    "fieldGuide": "Apariencia global (system | light | dark).",
    "value": "system"
  },
  "onboarding": {
    "fieldGuide": "Flujo inicial de la app, no de un módulo.",
    "completed": false
  },
  "ai": {
    "fieldGuide": "Comportamiento del agente en toda la app.",
    "tone": "balanced",
    "proactiveInsights": true,
    "confirmBeforeActions": true,
    "defaultProvider": null
  },
  "notifications": {
    "fieldGuide": "Cómo el usuario quiere recibir notificaciones.",
    "channels": { "push": true, "email": false, "inApp": true },
    "quietHours": {
      "enabled": false,
      "start": "22:00",
      "end": "08:00",
      "timezone": null
    }
  },
  "privacy": {
    "fieldGuide": "Preferencias transversales de telemetría.",
    "analyticsEnabled": true,
    "crashReportsEnabled": true
  }
}
```

La configuración por módulo (Finanzas, Agenda, etc.) **no** va en `preferences`. Va en `user_modules.config`.

### `DELETE /users/me`

Elimina la cuenta autenticada y todos los datos asociados en la base de datos de la app, y borra el usuario en Supabase Auth.

**Auth:** Bearer token requerido.

**Response `data`:**

```json
{ "success": true }
```

**Errores:** `404` si el usuario no existe en `public.users`; `401` sin token válido.

La app reautentica con contraseña (Supabase) antes de llamar este endpoint. Cuentas solo-Google deben usar la URL web `/delete-account`.

### `PATCH /users/me/modules/:slug`

Actualiza (upsert) la fila `user_modules` del usuario para el módulo indicado (`finance`, `agenda`, `projects`, `subscriptions`, `health`).

**Body:**

```json
{
  "config": { "baseCurrency": "USD" }
}
```

El backend hace merge profundo con los defaults del slug (incluyendo `fieldGuide`). Respuesta: mismo shape que `GET /users/me`.

**`userModules[]` en `GET /users/me`:**

| Campo       | Tipo                                                              |
| ----------- | ----------------------------------------------------------------- |
| `slug`      | string                                                            |
| `isEnabled` | boolean                                                           |
| `config`    | object (ver `configBySlug` en `docs/user-settings-defaults.json`) |
| `enabledAt` | string (ISO)                                                      |

La app solo muestra la sección de Ajustes de un módulo si existe entrada con `isEnabled: true`.

## Notifications (push tokens)

### `POST /notifications/push-tokens`

Registra token Expo/FCM del dispositivo.

**Body:**

```json
{
  "platform": "ios" | "android",
  "token": "ExponentPushToken[...]"
}
```

### `PATCH /notifications/push-tokens/:token/deactivate`

Desactiva el token al cerrar sesión. `:token` = valor URL-encoded del push token.

## Notifications (in-app)

### `GET /notifications`

Query: `page`, `limit`, `channel` (default `IN_APP`), `unreadOnly` (boolean).

Respuesta paginada: `{ items: Notification[], pagination }`.

Si `preferences.notifications.channels.inApp` es `false`, la lista viene vacía.

### `GET /notifications/unread-count`

Respuesta: `{ count: number }` (solo canal IN_APP).

### `PATCH /notifications/read-all`

Marca todas las notificaciones IN_APP del usuario como leídas. Respuesta: `{ updated: number }`.

### `PATCH /notifications/:id/read`

Marca una notificación como leída (ownership por usuario).

### `POST /notifications`

Crea notificación para el **usuario autenticado** (no acepta `userId` en body).

**Política:** respeta `channels.*`, `quietHours` (solo suprime PUSH/EMAIL; IN_APP sigue visible), y toggles por módulo en `data`:

```json
{ "moduleSlug": "finance", "notificationKey": "budgetAlerts" }
```

## AI Agent

### `GET /ai/providers`

`{ providers: [{ name, model }] }`

### `GET /ai/sessions` | `POST /ai/sessions` | `GET /ai/sessions/:id` | `DELETE /ai/sessions/:id`

CRUD de sesiones y mensajes persistidos. `POST` acepta `{ moduleSlug?, contextType? }`. Respuesta incluye `moduleSlug`, `title`, `memorySnapshot`.

### `GET /ai/sessions/:id/actions`

Lista acciones (`ai_actions`) de la sesión.

### `POST /ai/actions/:id/execute` | `POST /ai/actions/:id/cancel`

Ejecuta o cancela una acción PENDING (tool mutante con confirmación).

### `POST /ai/chat`

Body: `{ sessionId?, clientMessageId?, messages: [{ role, content }] }`.

Respuesta: `{ sessionId, provider, model, content, requiresConfirmation?, actions?, sideEffects?, blocks? }`.

`sideEffects`: `[{ type: 'invalidate', keys: ['profile','me'] } | { type: 'theme', value: 'dark' }]`.

### `POST /ai/chat/stream`

Mismo body; SSE: `start` → `chunk`* → `done` / `error`. Evento `done` incluye `actions`, `sideEffects`, `blocks`.

## WebSocket (`/notifications`)

Eventos: `notification.new`, `ai.response` (`type`: `chat.complete` | `chat.chunk` | `insight` | `action.updated`). Auth: Bearer en handshake.

## Códigos HTTP — manejo en cliente

| Código | Comportamiento app                           |
| ------ | -------------------------------------------- |
| 401    | `UNAUTHORIZED` → sign-out automático + toast |
| 403    | `FORBIDDEN`                                  |
| 404    | `NOT_FOUND`                                  |
| 5xx    | `SERVER_ERROR` + retry (máx. 2)              |
