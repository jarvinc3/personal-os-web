# Registro de revisión — personal-os-web

Afirmaciones de `project-guide.md`, `docs/infraestructure/*`, módulos monolíticos y `public/README.md` (Expo) que no se presentan como vigentes. Nada se eliminó sin destino.

## REV-WEB-001 {#rev-web-001}

| Campo | Valor |
| --- | --- |
| Categoría | `CONTEXTO_NO_APLICABLE` / `CONTRADICE_CODIGO` |
| Origen | `docs/project-guide.md` “fuente de verdad”, RN principal, Frankfurter, regex+IMAP email, IMAP fallback |
| Validación | Este repo es Next.js; FX `exchangerate.host` en backend; extractor LLM; no hay parsers regex en ingestion |
| Texto original (extracto) | “Mobile-first — React Native como cliente principal”; “Tipos de cambio: frankfurter.app”; “Regex Parser (bancos conocidos)” |
| Resolución | `open` (contenido sustituido por `architecture/overview.md`) |

## REV-WEB-002 {#rev-web-002}

| Campo | Valor |
| --- | --- |
| Categoría | `CONTRADICE_CODIGO` |
| Origen | `core-contracts.md` → `docs/user-settings-defaults.json`; `core-infra-status` → `shared/config/api-client.ts` |
| Validación | defaults en `src/modules/settings/constants/user-settings-defaults.ts`; client en `src/config/api-client.ts` |
| Resolución | `migrated` |

## REV-WEB-003 {#rev-web-003}

| Campo | Valor |
| --- | --- |
| Categoría | `CONTRADICE_CODIGO` |
| Origen | `auth.md` `shared/providers/auth-bootstrap-provider.tsx` |
| Validación | `src/providers/auth-bootstrap-provider.tsx` |
| Resolución | `migrated` |

## REV-WEB-004 {#rev-web-004}

| Campo | Valor |
| --- | --- |
| Categoría | `CONTEXTO_NO_APLICABLE` |
| Origen | Push `ExponentPushToken`, Expo Go |
| Validación | Web Push VAPID + `platform: web` |
| Resolución | `open` |

## REV-WEB-005 {#rev-web-005}

| Campo | Valor |
| --- | --- |
| Categoría | `CONTEXTO_NO_APLICABLE` |
| Origen | supabase checklist `personal-os://**`, `EXPO_PUBLIC_*`, `app.json` |
| Validación | redirects Next `/auth/callback` + `NEXT_PUBLIC_*` |
| Resolución | `open` |

## REV-WEB-006 {#rev-web-006}

| Campo | Valor |
| --- | --- |
| Categoría | `NO_VERIFICABLE` |
| Origen | `NEXT_PUBLIC_APP_URL` en metadata |
| Validación | usado en código; ausente `.env.example` |
| Resolución | `open` |

## REV-WEB-007 {#rev-web-007}

| Campo | Valor |
| --- | --- |
| Categoría | `CONTEXTO_NO_APLICABLE` |
| Origen | `core-runbook.md` Metro, EAS, `expo start -c`, crash `addedFiles` |
| Validación | `pnpm dev` = `next dev --turbopack` |
| Resolución | `open` |

## REV-WEB-008 {#rev-web-008}

| Campo | Valor |
| --- | --- |
| Categoría | `CONTRADICE_CODIGO` |
| Origen | chat hidden drawer; protected only home/settings |
| Validación | sidebar footer Agente IA; proxy cubre finance/keep-awake/notifications/chat |
| Resolución | `migrated` |

## REV-WEB-009 {#rev-web-009}

| Campo | Valor |
| --- | --- |
| Categoría | `NO_IMPLEMENTADO` |
| Origen | `core-infra-status` “tests de integración auth hooks / api client” |
| Validación | no hay specs en auth/settings/ai |
| Resolución | `open` |

## REV-WEB-010 {#rev-web-010}

| Campo | Valor |
| --- | --- |
| Categoría | `CONTRADICE_CODIGO` |
| Origen | `settings.md` `module-settings-ui.ts`, “Drawer” |
| Validación | `module-settings-state.ts`; sidebar |
| Resolución | `migrated` |

## REV-WEB-011 {#rev-web-011}

| Campo | Valor |
| --- | --- |
| Categoría | `NO_IMPLEMENTADO` |
| Origen | `ai.md` tabla `agenda-tools.md` … |
| Validación | archivos inexistentes en backend |
| Resolución | `open` |

## REV-WEB-012 {#rev-web-012}

| Campo | Valor |
| --- | --- |
| Categoría | `CONTRADICE_CODIGO` |
| Origen | `finance.md` + `modules/README.md` ruta `/finance/budgets`; tab bar 5 ítems |
| Validación | no hay `app/(app)/finance/budgets/page.tsx`; budgets UI en planning; tab bar 4 ítems + estadísticas sidebar |
| También | `APP_ROUTES.app.financeBudgets` se eliminó; reciclar cuentas/cobros = archivar / `CANCELLED` |
| Runtime 2026-09-15 | `GET http://localhost:3000/finance/budgets` → Next.js 404. `/finance/planning` muestra sección Presupuestos paginada (`DOP $…`) |
| Resolución | `resolved` |

## REV-WEB-013 {#rev-web-013}

| Campo | Valor |
| --- | --- |
| Categoría | `PARCIALMENTE_IMPLEMENTADO` |
| Origen | `pages/finance-categories.tsx` existe |
| Validación | la ruta de app importa `finance-categories-view.tsx` |
| Resolución | `open` |

## REV-WEB-014 {#rev-web-014}

| Campo | Valor |
| --- | --- |
| Categoría | `NO_VERIFICABLE` |
| Origen | landing waitlist/contact como captura de leads |
| Validación | no hay endpoint Nest de waitlist en este inventario |
| Resolución | `open` |

## REV-WEB-015 {#rev-web-015}

| Campo | Valor |
| --- | --- |
| Categoría | `CONTEXTO_NO_APLICABLE` |
| Origen | `public/README.md` Expo prebuild, `icon-x2.png`, `getAppIconSource` |
| Validación | assets en `public/assets/` vía `app-assets.ts`; falta `icon-x2.png`; hay PWA extras |
| Resolución | `migrated` (README público reescrito) |

## REV-WEB-016 {#rev-web-016}

| Campo | Valor |
| --- | --- |
| Categoría | `PARCIALMENTE_IMPLEMENTADO` |
| Origen | `core-infra-status` “Fase 1 web: auth + settings” |
| Validación | web tiene finance, notifications, keep-awake, chat, landing |
| Resolución | `migrated` |

## REV-WEB-017 {#rev-web-017}

| Campo | Valor |
| --- | --- |
| Categoría | `NO_VERIFICABLE` |
| Origen | superpowers plan/spec money format 2026-09-11 |
| Validación | helpers `money.ts` existen y se usan; el plan completo no se re-ejecutó como checklist |
| Destino ADR | `docs/decisions/ADR-002-money-strings.md` |
| Resolución | `partial` |
