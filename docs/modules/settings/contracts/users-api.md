# Settings — contrato Users (consumo)

Dueño del contrato HTTP: `personal-os-back/docs/modules/users/contracts/http.md`.

Este cliente:

| Acción                  | Endpoint                             | Hook                               |
| ----------------------- | ------------------------------------ | ---------------------------------- |
| Cargar perfil           | `GET /users/me`                      | `useProfile` / `hydrateAuthUser`   |
| Patch perfil/prefs      | `PATCH /users/me`                    | `useProfile`                       |
| Versión vista Novedades | `PATCH /users/me/release-notes-seen` | `useReleaseNotesSeen`              |
| Módulo                  | `PATCH /users/me/modules/:slug`      | `useUserModuleConfig`              |
| Borrar cuenta           | `DELETE /users/me`                   | `useDeleteAccount` (reauth previa) |
| Vaciar datos por capas  | `POST /users/me/data/wipe`           | `useWipeUserData` (reauth previa)  |
| Providers IA            | `GET /ai/providers`                  | `useAiProviders`                   |

Defaults mergeados en cliente: `src/modules/settings/constants/user-settings-defaults.ts` (`normalizePreferences`, `normalizeModuleConfig`). El backend también mergea; el cliente re-normaliza para UI estable.

> [!WARNING]
> **REV-WEB-002** — no existe `docs/user-settings-defaults.json`. [registro archivado](../../../archive/review-register.md)
