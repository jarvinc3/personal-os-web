# Settings — overview

Cliente de `UsersService`: perfil, tema, IA, quiet hours, módulos, logout, delete.

Ruta: `/settings` (`settings-client.tsx`). Sheets `?sheet=`.

| Sección | Sheet | API |
| --- | --- | --- |
| Cuenta | `EditAccountSheet` | PATCH `/users/me` |
| Apariencia | `EditThemeSheet` | `preferences.theme` |
| IA | `EditAISheet`, `EditAIProviderSheet` | `preferences.ai` + `GET /ai/providers` |
| Notificaciones | `EditQuietHoursSheet` | `preferences.notifications.quietHours` |
| Módulos | `EditFinanceSheet` etc. | PATCH `/users/me/modules/:slug` |
| Peligro | `DeleteAccountSheet` | DELETE `/users/me` |

Slugs: `finance`, `agenda`, `projects`, `health`, `subscriptions`. Solo finance tiene app routes.

Defaults: `src/modules/settings/constants/user-settings-defaults.ts`. Hooks: `useProfile`, `useUserModuleConfig`, `useDeleteAccount`. Invalidación `profile`/`me` también desde tools IA.

> [!WARNING]
> **REV-WEB-010** (`CONTRADICE_CODIGO`) — citaba `module-settings-ui.ts` (no existe; hay `module-settings-state.ts`) y “Drawer”. [review-register.md](../../review-register.md#rev-web-010)
