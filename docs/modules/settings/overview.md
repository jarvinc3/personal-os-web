# Settings — overview

Cliente de `UsersService`: perfil, tema, IA, quiet hours, módulos, logout, delete.

Ruta: `/settings` (`settings-screen.tsx`). Sheets `?sheet=`.

| Sección        | Sheet                                                    | API                                                                        |
| -------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| Cuenta         | `EditAccountSheet`                                       | PATCH `/users/me`                                                          |
| Apariencia     | `EditThemeSheet`                                         | `preferences.theme`                                                        |
| IA             | `EditAISheet`, `EditAIProviderSheet`                     | `preferences.ai` + `GET /ai/providers`                                     |
| Notificaciones | `EditQuietHoursSheet`                                    | `preferences.notifications.quietHours`                                     |
| Módulos        | `EditFinanceSheet` etc.                                  | PATCH `/users/me/modules/:slug`                                            |
| Peligro        | `DeleteAccountSheet`                                     | DELETE `/users/me`                                                         |
| Peligro        | `WipeUserDataSheet`                                      | POST `/users/me/data/wipe`                                                 |
| Moneda         | `FinanceCurrenciesView` (`/settings/finance/currencies`) | `config.baseCurrency` + `trackedCurrencies`; POST `/finance/base-currency` |

`/settings/finance` (`FinanceModuleSettingsForm`): módulo encendido, enlace a moneda principal y monedas seguidas, ingreso fijo (monto, frecuencia, días de pago y cuenta), cuenta por defecto para gastos y transferencias, entrada de monto (teclado o calculadora), inicio de semana, período del panel, visualización, mes financiero, recordatorios de tarjeta, correo (sincronización, modo directo o pendiente y enlace a Bancos y remitentes) y alertas del módulo. Todo vive en `module_config.finance`.

Slugs: `finance`, `agenda`, `projects`, `health`. Solo finance tiene app routes. Suscripciones dejó de ser un módulo: su sección vive en `/settings/finance#suscripciones` y `/settings/subscriptions` redirige allí.

Defaults: `src/modules/settings/constants/user-settings-defaults.ts`. Hooks: `useProfile`, `useUserModuleConfig`, `useDeleteAccount`, `useWipeUserData`. Invalidación `profile`/`me` también desde tools IA.

Vaciar datos: `wipe-layers.ts` (espejo del back: ids, labels, dependencias catalog → ledger y categories → planning), `pending-data-wipe.ts` + `PendingDataWipeHandler` para el reauth con Google. Reauth con Google vía `loginWithGoogleMutation`; la sesión nunca se cierra.

> [!WARNING]
> **REV-WEB-010** (`CONTRADICE_CODIGO`) — citaba `module-settings-ui.ts` (no existe; hay `module-settings-state.ts`) y “Drawer”. [registro archivado](../../archive/review-register.md)
