# Registro de revisión — personal-os-web

Afirmaciones de `project-guide.md`, `docs/infraestructure/*`, módulos monolíticos y `public/README.md` (Expo) que no se presentan como vigentes. Nada se eliminó sin destino.

## REV-WEB-001 {#rev-web-001}

| Campo                     | Valor                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Categoría                 | `CONTEXTO_NO_APLICABLE` / `CONTRADICE_CODIGO`                                                                               |
| Origen                    | `docs/project-guide.md` “fuente de verdad”, RN principal, Frankfurter, regex+IMAP email, IMAP fallback                      |
| Validación                | Este repo es Next.js; FX `exchangerate.host` en backend; extractor LLM; no hay parsers regex en ingestion                   |
| Texto original (extracto) | “Mobile-first — React Native como cliente principal”; “Tipos de cambio: frankfurter.app”; “Regex Parser (bancos conocidos)” |
| Resolución                | `open` (contenido sustituido por `architecture/overview.md`)                                                                |

## REV-WEB-002 {#rev-web-002}

| Campo      | Valor                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| Categoría  | `CONTRADICE_CODIGO`                                                                                           |
| Origen     | `core-contracts.md` → `docs/user-settings-defaults.json`; `core-infra-status` → `shared/config/api-client.ts` |
| Validación | defaults en `src/modules/settings/constants/user-settings-defaults.ts`; client en `src/config/api-client.ts`  |
| Resolución | `migrated`                                                                                                    |

## REV-WEB-003 {#rev-web-003}

| Campo      | Valor                                                    |
| ---------- | -------------------------------------------------------- |
| Categoría  | `CONTRADICE_CODIGO`                                      |
| Origen     | `auth.md` `shared/providers/auth-bootstrap-provider.tsx` |
| Validación | `src/providers/auth-bootstrap-provider.tsx`              |
| Resolución | `migrated`                                               |

## REV-WEB-004 {#rev-web-004}

| Campo      | Valor                             |
| ---------- | --------------------------------- |
| Categoría  | `CONTEXTO_NO_APLICABLE`           |
| Origen     | Push `ExponentPushToken`, Expo Go |
| Validación | Web Push VAPID + `platform: web`  |
| Resolución | `open`                            |

## REV-WEB-005 {#rev-web-005}

| Campo      | Valor                                                              |
| ---------- | ------------------------------------------------------------------ |
| Categoría  | `CONTEXTO_NO_APLICABLE`                                            |
| Origen     | supabase checklist `personal-os://**`, `EXPO_PUBLIC_*`, `app.json` |
| Validación | redirects Next `/auth/callback` + `NEXT_PUBLIC_*`                  |
| Resolución | `open`                                                             |

## REV-WEB-006 {#rev-web-006}

| Campo      | Valor                                   |
| ---------- | --------------------------------------- |
| Categoría  | `NO_VERIFICABLE`                        |
| Origen     | `NEXT_PUBLIC_APP_URL` en metadata       |
| Validación | usado en código; ausente `.env.example` |
| Resolución | `open`                                  |

## REV-WEB-007 {#rev-web-007}

| Campo      | Valor                                                             |
| ---------- | ----------------------------------------------------------------- |
| Categoría  | `CONTEXTO_NO_APLICABLE`                                           |
| Origen     | `core-runbook.md` Metro, EAS, `expo start -c`, crash `addedFiles` |
| Validación | `pnpm dev` = `next dev --turbopack`                               |
| Resolución | `open`                                                            |

## REV-WEB-008 {#rev-web-008}

| Campo      | Valor                                                                       |
| ---------- | --------------------------------------------------------------------------- |
| Categoría  | `CONTRADICE_CODIGO`                                                         |
| Origen     | chat hidden drawer; protected only home/settings                            |
| Validación | sidebar footer Agente IA; proxy cubre finance/keep-awake/notifications/chat |
| Resolución | `migrated`                                                                  |

## REV-WEB-009 {#rev-web-009}

| Campo      | Valor                                                              |
| ---------- | ------------------------------------------------------------------ |
| Categoría  | `NO_IMPLEMENTADO`                                                  |
| Origen     | `core-infra-status` “tests de integración auth hooks / api client” |
| Validación | no hay specs en auth/settings/ai                                   |
| Resolución | `open`                                                             |

## REV-WEB-010 {#rev-web-010}

| Campo      | Valor                                           |
| ---------- | ----------------------------------------------- |
| Categoría  | `CONTRADICE_CODIGO`                             |
| Origen     | `settings.md` `module-settings-ui.ts`, “Drawer” |
| Validación | `module-settings-state.ts`; sidebar             |
| Resolución | `migrated`                                      |

## REV-WEB-011 {#rev-web-011}

| Campo      | Valor                             |
| ---------- | --------------------------------- |
| Categoría  | `NO_IMPLEMENTADO`                 |
| Origen     | `ai.md` tabla `agenda-tools.md` … |
| Validación | archivos inexistentes en backend  |
| Resolución | `open`                            |

## REV-WEB-012 {#rev-web-012}

| Campo              | Valor                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Categoría          | `CONTRADICE_CODIGO`                                                                                                             |
| Origen             | `finance.md` + `modules/README.md` ruta `/finance/budgets`; tab bar 5 ítems                                                     |
| Validación         | no hay `app/(app)/finance/budgets/page.tsx`; budgets UI en planning; tab bar 4 ítems + estadísticas sidebar                     |
| También            | `APP_ROUTES.app.financeBudgets` se eliminó; reciclar cuentas/cobros = archivar / `CANCELLED`                                    |
| Runtime 2026-09-15 | `GET http://localhost:3000/finance/budgets` → Next.js 404. `/finance/planning` muestra sección Presupuestos paginada (`DOP $…`) |
| Resolución         | `resolved`                                                                                                                      |

## REV-WEB-013 {#rev-web-013}

| Campo      | Valor                                                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Categoría  | `PARCIALMENTE_IMPLEMENTADO`                                                                                                        |
| Origen     | `catalog/categories-screen.tsx` (antes `pages/finance-categories.tsx`)                                                             |
| Validación | `app/(app)/finance/categories/page.tsx` importa `CategoriesScreen` desde `@/src/modules/finance`; el archivo huérfano ya no existe |
| Resolución | `resolved`                                                                                                                         |

## REV-WEB-014 {#rev-web-014}

| Campo      | Valor                                               |
| ---------- | --------------------------------------------------- |
| Categoría  | `NO_VERIFICABLE`                                    |
| Origen     | landing waitlist/contact como captura de leads      |
| Validación | no hay endpoint Nest de waitlist en este inventario |
| Resolución | `open`                                              |

## REV-WEB-015 {#rev-web-015}

| Campo      | Valor                                                                               |
| ---------- | ----------------------------------------------------------------------------------- |
| Categoría  | `CONTEXTO_NO_APLICABLE`                                                             |
| Origen     | `public/README.md` Expo prebuild, `icon-x2.png`, `getAppIconSource`                 |
| Validación | assets en `public/assets/` vía `app-assets.ts`; falta `icon-x2.png`; hay PWA extras |
| Resolución | `migrated` (README público reescrito)                                               |

## REV-WEB-016 {#rev-web-016}

| Campo      | Valor                                                       |
| ---------- | ----------------------------------------------------------- |
| Categoría  | `PARCIALMENTE_IMPLEMENTADO`                                 |
| Origen     | `core-infra-status` “Fase 1 web: auth + settings”           |
| Validación | web tiene finance, notifications, keep-awake, chat, landing |
| Resolución | `migrated`                                                  |

## REV-WEB-017 {#rev-web-017}

| Campo       | Valor                                                                                  |
| ----------- | -------------------------------------------------------------------------------------- |
| Categoría   | `NO_VERIFICABLE`                                                                       |
| Origen      | superpowers plan/spec money format 2026-09-11                                          |
| Validación  | helpers `money.ts` existen y se usan; el plan completo no se re-ejecutó como checklist |
| Destino ADR | `docs/decisions/ADR-002-money-strings.md`                                              |
| Resolución  | `partial`                                                                              |

## REV-WEB-018 {#rev-web-018}

| Campo      | Valor                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| Categoría  | `CONTRADICE_CODIGO`                                                                                     |
| Origen     | `.cursor/rules/icons-required.mdc` (icono obligatorio en todo botón)                                    |
| Validación | 97 bloques `<Button>` sin componente `*Icon`; se agregó icono a todos los botones de acción de producto |
| Resolución | `resolved` (quedan solo controles segmentados y botones con icono lucide sin sufijo `Icon`)             |

## REV-WEB-021 {#rev-web-021}

| Campo      | Valor                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| Categoría  | `CONTRADICE_CODIGO`                                                                                                        |
| Origen     | `.cursor/rules/navigation-pending.mdc` (la navegación muestra pending)                                                     |
| Validación | 29 archivos con `router.push` sin `usePendingNavigation`/`useTransition`; 15 archivos con `<Link` sin `LinkPendingOverlay` |
| Resolución | `open`                                                                                                                     |

## REV-WEB-022 {#rev-web-022}

| Campo      | Valor                                                                                                                                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Categoría  | `CONTRADICE_CODIGO`                                                                                                                                                                                                               |
| Origen     | `.cursor/rules/switch-row-icons.mdc` (icono a la izquierda del título)                                                                                                                                                            |
| Validación | los `SettingsRow` / `SwitchFieldRow` de `notifications-screen.tsx`, `settings-screen.tsx` y `device-push-settings-row.tsx` reciben el icono por el spread `{...SETTINGS_REGISTRY...}` (`createRowMeta` en `settings-metadata.ts`) |
| Resolución | `resolved` (falso positivo)                                                                                                                                                                                                       |

## REV-WEB-023 {#rev-web-023}

| Campo      | Valor                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| Categoría  | `CONTRADICE_CODIGO`                                                                                                         |
| Origen     | `.cursor/rules/confirm-important-changes.mdc` (acción destructiva pide `AlertDialog`)                                       |
| Validación | 14 archivos confirman el borrado con `window.confirm` en vez del `AlertDialog` de `@/src/shared/components/ui/alert-dialog` |
| Resolución | `open`                                                                                                                      |

## REV-WEB-024 {#rev-web-024}

| Campo      | Valor                                                                                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Categoría  | `CONTRADICE_CODIGO`                                                                                                                                       |
| Origen     | `.cursor/rules/form-shell-page.mdc` (formulario de página con barra fija)                                                                                 |
| Validación | los formularios de `settings/components/module-settings/*` dejan el botón al final del `form`; la propia regla lo marca y dice "se migra cuando se toque" |
| Resolución | `open` (deuda conocida y aceptada en la regla)                                                                                                            |

## REV-WEB-019 {#rev-web-019}

| Campo      | Valor                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| Categoría  | `CONTRADICE_CODIGO`                                                                                    |
| Origen     | `.cursor/rules/input-placeholders.mdc` (placeholder solo para ejemplo o formato)                       |
| Validación | 11 placeholders instruían o repetían la etiqueta (login, registro, chat, contacto, contraseñas, cobro) |
| Resolución | `resolved` (eliminados o acortados; 54 a 43)                                                           |

## REV-WEB-020 {#rev-web-020}

| Campo      | Valor                                                                                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Categoría  | `CONTRADICE_CODIGO`                                                                                                                                       |
| Origen     | `.cursor/rules/list-infinite-scroll.mdc` (listas con scroll infinito)                                                                                     |
| Validación | presupuestos usaba botones Anterior/Siguiente; notificaciones un botón "Cargar más"; movimientos precargaba todas las páginas; sesiones de IA no paginaba |
| Resolución | `resolved` (`useInfiniteQuery` + `IntersectionObserver` sobre cursor)                                                                                     |

## REV-WEB-025 {#rev-web-025}

| Campo           | Valor                                                                                                                                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Categoría       | `CONTRADICE_CODIGO`                                                                                                                                                                                                                                                |
| Origen          | `.cursor/rules/` (24 reglas), `CODING_GUIDELINES.md`, `AGENTS.md`, `architecture/ui-components.md`, `architecture/module-conventions.md`                                                                                                                           |
| Validación      | 60 hallazgos de UI y convenciones; detalle con archivo y línea en [reference/auditoria-reglas-ui-convenciones.md](./reference/auditoria-reglas-ui-convenciones.md)                                                                                                 |
| Re-verificación | 2026-10-22 (pendiente 15, web v0.35.2; revisión web v0.35.3–v0.35.4): 44 vigentes corregidos, 7 resueltos antes por Suscripciones v3 y los pendientes 12-13, 9 por decidir. La revisión cerró H-42 en su caso principal y tres incumplimientos fuera de H-01..H-60 |
| Resolución      | `partial` (quedan por decidir H-44, H-47, H-55 a H-58, H-59 y H-60; spec en [modules/finance/pendientes/15-auditoria-reglas-ui.md](./modules/finance/pendientes/15-auditoria-reglas-ui.md))                                                                        |
