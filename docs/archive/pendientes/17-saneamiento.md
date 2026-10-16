# 17 · Saneamiento del registro de revisión (REV-BACK / REV-WEB)

> Decidido por Jarvin. Cierra en un solo pendiente los hallazgos de saneamiento que quedaban `open` en [review-register.md](../review-register.md) y en el de `personal-os-back`, sin agregar dependencias y sin tocar `personal-os-app`.

## Alcance por repo

### Web

| REV          | Qué se hace                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| REV-BACK-003 | Mostrar al usuario el fallo de sincronización de correo en Sincronización (el error ya viaja en el historial de syncs). |
| REV-WEB-023  | Reemplazar todo `window.confirm` por `AlertDialog` o `DeleteRecordDialog`; re-verificar que no quede ninguno.           |
| REV-WEB-021  | Re-verificar y corregir las navegaciones que abren otra vista sin indicador pending (`navigation-pending.mdc`).         |
| REV-WEB-006  | Agregar `NEXT_PUBLIC_APP_URL` a `.env.example`.                                                                         |
| REV-WEB-001  | Corregir la documentación vieja de React Native y cerrar.                                                               |
| REV-WEB-004  | Corregir la documentación vieja de Expo Push y cerrar.                                                                  |
| REV-WEB-005  | Corregir la documentación vieja de Expo/`app.json` en el checklist de Supabase y cerrar.                                |
| REV-WEB-007  | Corregir la documentación vieja de Metro/EAS y cerrar.                                                                  |
| REV-WEB-009  | Roadmap: tests de integración de auth hooks y api client.                                                               |
| REV-WEB-011  | Roadmap: tools de dominio por slug en `MODULE_CONTEXT`.                                                                 |
| REV-WEB-014  | Roadmap: captura de leads de la landing.                                                                                |

### Back

| REV          | Qué se hace                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| REV-BACK-003 | Emitir `finance.email_sync.failed` en el outbox cuando un sync de correo falla (misma transacción que el log). |
| REV-BACK-005 | Crear el script de smoke HTTP de endpoints clave de finanzas contra una URL configurable, con comando y doc.   |
| REV-BACK-011 | Enlazar el smoke nuevo como sustituto de la corrida histórica `PASS 2026-08-07`.                               |
| REV-BACK-001 | Activar `LoggingInterceptor` como `APP_INTERCEPTOR` global y borrar `RolesGuard` y `@Roles` sin uso.           |
| REV-BACK-002 | Agregar `MAX_EMAIL_LLM_EXTRACTS` y `AI_DAILY_INSIGHT_QUOTA` al `env.schema`.                                   |
| REV-BACK-004 | Corregir el comentario de crons en `app.module.ts` (había siete `@Cron`, no cero).                             |
| REV-BACK-009 | Unificar el puerto por defecto en 3100 (schema y ejemplos).                                                    |
| REV-BACK-006 | Roadmap: generalizar `@RequiresEnabledModule`.                                                                 |
| REV-BACK-007 | Roadmap: adaptador FCM/APNs dedicado.                                                                          |
| REV-BACK-008 | Roadmap: tools de dominio por slug en `MODULE_CONTEXT`.                                                        |

## Decisiones

- **REV-BACK-003**: se reutiliza el patrón del evento de éxito. El fallo se escribe en `fin_email_sync_logs` y se encola el evento en la misma transacción, con payload `{ sourceId, error, emailsScanned, transactionsNew, occurredAt, version }`. No se crea notificación nueva: el usuario ya ve el `error` en «Últimos syncs».
- **REV-BACK-005/011**: el script es Node/TS sin dependencias nuevas; recorre endpoints `GET` de finanzas con el bearer token de una variable de entorno y sale con código distinto de cero si alguno falla. Comando `pnpm smoke:finance`. Se elimina `db:reconcile-balances` porque `prisma/scripts/` no existe.
- **REV-BACK-001**: se registra el interceptor existente y se borran el guard, el decorador y sus exports muertos. El RBAC no está en uso; si se necesita, se reintroduce con dueño.
- **REV-BACK-002**: los dos límites son opcionales y con `default` igual al de `ai-limits.ts`; `ai-limits.ts` sigue leyendo `process.env` para no cambiar su firma.
- **REV-BACK-009**: `PORT` default 3100, igual que `.env.example` y el README.
- **REV-WEB-009/011/014 y REV-BACK-006/007/008**: no se implementan. Se abren como issues con label `roadmap` en cada repo y el registro pasa a apuntar ahí.

## Criterios de aceptación

- [ ] No queda ningún `window.confirm` ni `confirm(` de navegador en `src/` ni `app/`.
- [ ] Las navegaciones que abren otra vista pintan pending; las que corren dentro de una mutación no lo necesitan.
- [ ] `.env.example` de la web incluye `NEXT_PUBLIC_APP_URL`.
- [ ] Un sync fallido deja un evento `finance.email_sync.failed` en el outbox y un log `FAILED` con `error`.
- [ ] `pnpm smoke:finance` corre contra `SMOKE_BASE_URL` y falla con código distinto de cero si un endpoint responde mal.
- [ ] `LoggingInterceptor` está registrado; `RolesGuard`, `@Roles` y `ROLES_KEY` no existen.
- [ ] `env.schema` valida `MAX_EMAIL_LLM_EXTRACTS` y `AI_DAILY_INSIGHT_QUOTA`.
- [ ] El comentario de crons coincide con los schedulers reales.
- [ ] `PORT` por defecto es 3100.
- [ ] Los hallazgos van a issues con label `roadmap` y `review-register.md` de ambos repos queda al día.
- [ ] Los cuatro comandos obligatorios pasan en la web y los del back (`format:check`, `lint`, `test`, `build`) pasan.

## Tests

- Back: `ingestion.service.spec.ts` cubre el fallo con outbox; `env.schema.spec.ts` cubre los límites nuevos.
- Web: los cambios son de chrome, `.env.example` y documentación; no hay lógica pura nueva que probar.

## Implementación

PENDIENTE 17 COMPLETADO — web v0.37.0 · back v0.36.0 (2026-10-15).

### Web

- **REV-BACK-003 (web):** `mailboxes-view.tsx` calcula el último sync por `startedAt`; si quedó en `FAILED`, pinta una `Alert` destructiva con el `error` del back. El historial «Últimos syncs» ya mostraba el error.
- **REV-WEB-023:** `grep` sobre `src/` y `app/` no encuentra `window.confirm` ni `confirm(`; el borrado usa `AlertDialog` o `DeleteRecordDialog`. Se cierra sin cambios.
- **REV-WEB-021:** se agregó `LinkPendingOverlay` a todos los `<Link>` que abren otra vista (mes, cuotas, bloques del chat, markdown interno, 404, landing, navbar, footer). Las cards y filas ya navegaban por `href`; los ítems de menú, FAB y las navegaciones tras una mutación quedan fuera, como documenta la regla.
- **REV-WEB-006:** `NEXT_PUBLIC_APP_URL` en `.env.example`.
- **REV-WEB-001/004/005/007:** la documentación ya estaba migrada a Next.js y marcada con su `REV`; se cierran en el registro.
- **REV-WEB-009/011/014:** a web [#143](https://github.com/jarvinc3/personal-os-web/issues/143), [#144](https://github.com/jarvinc3/personal-os-web/issues/144) y [#145](https://github.com/jarvinc3/personal-os-web/issues/145).

### Back

- **REV-BACK-003:** `IngestionService.completeEmailSyncFailureWithEvent` escribe el log `FAILED` y el evento de outbox en la misma transacción; `ProcessGmailSyncUseCase` lo llama en su `catch`. Nuevo `completeEmailSyncFailureWithOutbox` en el repositorio; se retiró el `completeEmailSyncLog` sin uso.
- **REV-BACK-005/011:** `scripts/finance/smoke-finance-http.ts` recorre 16 `GET` de finanzas contra `SMOKE_BASE_URL` con `SMOKE_ACCESS_TOKEN`; comando `pnpm smoke:finance`; doc en `docs/operations/scripts.md`. Se quitó `db:reconcile-balances`.
- **REV-BACK-001:** `LoggingInterceptor` registrado como `APP_INTERCEPTOR`; se borraron `roles.guard.ts`, `roles.decorator.ts` y su export.
- **REV-BACK-002:** `MAX_EMAIL_LLM_EXTRACTS` (default 25) y `AI_DAILY_INSIGHT_QUOTA` (default 20) en `env.schema`.
- **REV-BACK-004:** comentario de crons en `app.module.ts`.
- **REV-BACK-009:** `PORT` default 3100.
- **REV-BACK-006/007/008:** a back [#136](https://github.com/jarvinc3/personal-os-back/issues/136), [#137](https://github.com/jarvinc3/personal-os-back/issues/137) y [#138](https://github.com/jarvinc3/personal-os-back/issues/138).

### Verificación

- Web: `pnpm format:check`, `pnpm lint`, `pnpm typecheck` y `pnpm test` (749 tests) en verde.
- Back: `pnpm format:check`, `pnpm lint`, `pnpm test` (1003 tests), `pnpm build` y `pnpm smoke:finance` (falla con código 1 si falta token o un endpoint responde mal) en verde.
- `review-register.md` de ambos repos con cada `REV` en `resolved` o `roadmap`.

### Revisión (2026-10-15, web v0.37.1 · back v0.36.1)

- **Web, REV-WEB-021:** el pendiente solo había cubierto los `<Link>`. Se completan las navegaciones que abren otra vista y no son ítem de menú, FAB ni efecto de una mutación: el hero de Inicio (Gasto/Ingreso/Transf., ahora `Link` + `LinkPendingOverlay`), la fila de notificaciones y la card de Apps en Ajustes (`usePendingNavigation` + `PendingSurface`) y el botón del agente que abre `/chat` (`usePendingNavigation` + `Spinner`).
- **Back, REV-BACK-009:** `apps/api/src/main.ts` usaba `?? 3000` como fallback de `PORT`; se alinea en `3100`, igual que `env.schema` y `.env.example`.
- **Back, REV-BACK-002:** `env.schema` acepta una cadena vacía en `MAX_EMAIL_LLM_EXTRACTS` y `AI_DAILY_INSIGHT_QUOTA` y cae al default, igual que `ai-limits.ts`; antes un valor vacío rompía el boot con `z.coerce.number()`.
- **Verificación:** web `format:check`, `lint`, `typecheck` y `test` (749) en verde; back `format:check`, `lint`, `test` (1004) y `build` en verde.
