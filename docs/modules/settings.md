# Settings Module (App)

## Scope

User profile, appearance, AI preferences, notification quiet hours, and per-module configuration sheets. Acts as the client for `UsersService` endpoints.

## Navigation

| Screen   | Path             | Drawer    |
| -------- | ---------------- | --------- |
| Settings | `(app)/settings` | "Ajustes" |

## Sections

### Account

- Display name, avatar, locale, timezone
- Sheet: `EditAccountSheet` → `PATCH /users/me`

### Appearance

- Theme: system / light / dark
- Sheet: `EditThemeSheet` → updates `preferences.theme`

### AI assistant

- Tone, confirm-before-actions, proactive insights
- Default provider selection
- Sheets: `EditAISheet`, `EditAIProviderSheet`

### Notifications

- Quiet hours configuration
- Sheet: `EditQuietHoursSheet` → `preferences.notifications.quietHours`
- Full notification prefs also in Notifications module screens

### Danger zone

- Delete account (email/password users): `DeleteAccountSheet` → reauth + `DELETE /users/me`.
- Google-only accounts: in-app sheet links to web `/delete-account`.

### Session

- Log out from the app.

### Modules

Per-module enable toggle and config sheets:

| Module        | Sheet                    | Slug            |
| ------------- | ------------------------ | --------------- |
| Finanzas      | `EditFinanceSheet`       | `finance`       |
| Agenda        | `EditAgendaSheet`        | `agenda`        |
| Proyectos     | `EditProjectsSheet`      | `projects`      |
| Salud         | `EditHealthSheet`        | `health`        |
| Suscripciones | `EditSubscriptionsSheet` | `subscriptions` |

Module updates use `PATCH /users/me/modules/:slug` via `useUserModuleConfig`.

## Data layer

| Hook / lib               | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `useProfile`             | Fetch and patch user profile + preferences      |
| `useDeleteAccount`       | Reauth + delete account via `DELETE /users/me`  |
| `useUserModuleConfig`    | Read/update per-module config and enabled state |
| `useModuleSheetEnable`   | Shared enable/disable toggle for module sheets  |
| `normalizePreferences`   | Merge server prefs with defaults                |
| `normalizeModuleConfig`  | Merge module config with defaults               |
| `user-settings-defaults` | Default preference shapes                       |

## Constants

- `settings-metadata.ts` — labels and icons for settings rows
- `module-settings-ui.ts` — module row definitions

## Backend contract

- `GET /users/me`
- `PATCH /users/me` — partial update with deep merge on `preferences`
- `DELETE /users/me` — delete account and associated data
- `PATCH /users/me/modules/:slug` — `{ isEnabled?, config? }`

## Notes

- Settings changes made via AI chat invalidate the same query keys (`profile`, `me`).
- Finance module config is editable here but not via AI `update_module_config` tool.
