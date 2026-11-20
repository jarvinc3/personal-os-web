# Settings — overview

Cliente de `UsersService`: perfil, tema, IA, quiet hours, módulos, logout, delete.

Ruta: `/settings` (`settings-screen.tsx`). Sheets `?sheet=`.

| Sección        | Sheet                                                                 | API                                                                        |
| -------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Cuenta         | `EditAccountSheet`                                                    | PATCH `/users/me`                                                          |
| Apariencia     | `EditThemeSheet`, `EditAppearanceStyleSheet`, `EditPrimaryColorSheet` | `preferences.theme` (`value`, `style`, `primaryColor`)                     |
| IA             | `EditAISheet`, `EditAIProviderSheet`                                  | `preferences.ai` + `GET /ai/providers`                                     |
| Notificaciones | `EditQuietHoursSheet`                                                 | `preferences.notifications.quietHours`                                     |
| Módulos        | `EditFinanceSheet` etc.                                               | PATCH `/users/me/modules/:slug`                                            |
| Peligro        | `DeleteAccountSheet`                                                  | DELETE `/users/me`                                                         |
| Peligro        | `WipeDataSheet`                                                       | `GET /users/me/data/branches` + POST `/users/me/data/wipe`                 |
| Moneda         | `FinanceCurrenciesView` (`/settings/finance/currencies`)              | `config.baseCurrency` + `trackedCurrencies`; POST `/finance/base-currency` |
| Uso            | — (`/settings/usage`)                                                 | `GET /intelligence/email/usage?days=`                                      |

`/settings/usage` (`UsageSettingsScreen`): consumo y costo de la clasificación de correos. Consume `GET /intelligence/email/usage?days=` con un tipo local porque el contrato no describe la respuesta; muestra el resumen, los topes (carga inicial, tope diario de tokens y costo global), las gráficas por día y por hora con `ChartContainer` y recharts, y el desglose por banco y por tipo semántico de clasificación. El rango es hoy, 7 o 30 días; el estado del costo llega como `OK`, `ALERT` o `PAUSED` y el reinicio se calcula a la medianoche UTC. La vista no muestra contenido de correos ni recalcula el costo; las series llevan una tabla accesible oculta y el reinicio se refresca al cruzar la medianoche UTC. Pruebas de renderizado pendientes en #450.

`/settings/finance` (`FinanceModuleSettingsForm`): módulo encendido, enlace a moneda principal y monedas seguidas, ingreso fijo (monto, frecuencia, días de pago y cuenta), cuenta por defecto para gastos y transferencias, entrada de monto (teclado o calculadora), inicio de semana, período del panel, visualización, mes financiero, recordatorios de tarjeta, correo (sincronización, modo directo o pendiente y enlace a Bancos y remitentes) y alertas del módulo. Todo vive en `module_config.finance`.

Slugs: `finance`, `agenda`, `projects`, `health`. Solo finance tiene app routes. Suscripciones dejó de ser un módulo: su sección vive en `/settings/finance#suscripciones` y `/settings/subscriptions` redirige allí.

Defaults: `src/modules/settings/constants/user-settings-defaults.ts`. Hooks: `useProfile`, `useUserModuleConfig`, `useDeleteAccount`, `useWipeUserData`, `useLastSeenReleaseVersion`, `useMarkReleaseNotesSeen`. Invalidación `profile`/`me` también desde tools IA.

Apariencia tiene tres ejes independientes: modo (`preferences.theme.value`), estilo visual (`style`) y color primario (`primaryColor`). El registro de estilos vive en `src/shared/appearance/style-registry.ts`; cada estilo aporta un CSS con sus tokens. El selector muestra una vista previa por estilo. El color se elige de `PRIMARY_COLORS` o con el selector nativo, y el texto sobre el primario se calcula por contraste. La preferencia se guarda con `preferences.version` 2; una copia en `localStorage` y un script antes del primer pintado evitan el parpadeo. Cada hoja aplica el cambio mientras está abierta y lo descarta al cerrarse sin guardar, también cuando se cierra con Atrás por la ruta. Los estilos son Estudio y Neo-Skeuo: el segundo pinta papel y tinta, cambia las sombras con la escala `--surface-shadow-*` y usa radios de 0, 4, 8 y 12 px (`--radius-ratio-*`). Decisión: [ADR-006](../../decisions/ADR-006-appearance.md).

Las preferencias se guardan con `PATCH /users/me` desde `useProfile().updatePreferences`: la caché se actualiza de forma optimista antes del envío, cada parche se calcula sobre la última caché, las mutaciones se serializan por `scope` y un fallo restaura el perfil anterior con su toast. Cada pantalla envía solo la hoja que cambia, no el objeto completo de preferencias.

Vaciar datos: `useDataBranches` lee `GET /users/me/data/branches` (identificador, etiqueta, conteo y lo que arrastra cada rama) y `WipeUserDataView` pinta la misma lista en Ajustes de cada app (solo sus ramas) y en Privacidad (todas agrupadas por app). `wipe-branches.ts` expande lo que arrastra la selección y calcula los conteos que se envían; `wipe-branch-texts.ts` es el único mapa de etiquetas, descripciones, iconos, unidad y tema por identificador. El vaciado envía `POST /users/me/data/wipe` con `branches` y `expectedCounts`; un 409 refresca la lista y pide confirmar otra vez. Con contraseña, «Verificar» la valida y entonces habilita «Vaciar datos»; la validación no depende de salir del campo. Al terminar, un toast de 8 s resume las ramas y las filas afectadas y se publica antes de refrescar la caché; si falla, la hoja sigue abierta y el toast de error lo explica. `pending-data-wipe.ts` + `PendingDataWipeHandler` conservan la selección durante el reauth con Google. Reauth con Google vía `loginWithGoogleMutation`; la sesión nunca se cierra.

> [!WARNING]
> **REV-WEB-010** (`CONTRADICE_CODIGO`) — citaba `module-settings-ui.ts` (no existe; hay `module-settings-state.ts`) y “Drawer”. [registro archivado](../../archive/review-register.md)
