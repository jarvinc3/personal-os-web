# API client

- Base URL: `NEXT_PUBLIC_API_URL` + `NEXT_PUBLIC_API_PREFIX` → `src/config/api-base-url.ts` (lanza si falta URL).
- Client: `src/config/api-client.ts` — Bearer desde sesión Supabase; extrae `data` del envelope `{ data, meta }`.
- Endpoints: `src/shared/constants/api-endpoints.ts`.
- Errores: `ApiError`; `meta.requestId`/`path` si existen.
- 401 → sign-out via `auth-events` + toast.

Contratos de dominio (perfil, notificaciones, AI, finance): **backend** `personal-os-back/docs/modules/*`. Este cliente documenta solo el consumo.

> [!WARNING]
> **REV-WEB-002** (`CONTRADICE_CODIGO`) — docs antiguas citaban `docs/user-settings-defaults.json` y `shared/config/api-client.ts`. Reales: `src/modules/settings/constants/user-settings-defaults.ts` y `src/config/api-client.ts`. [registro archivado](../archive/review-register.md)
