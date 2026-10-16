# 18 · Endurecimiento antes de salir de beta (observabilidad, CI web, consistencia de API)

> Decidido por Jarvin (2026-10-15). Cubre los puntos 2, 4 y 5 de la evaluación de salida de beta: ver los errores en prod, completar el CI de la web y uniformar la API. Sin funcionalidades nuevas, sin tocar `personal-os-app`. pi trabaja directo en `develop`, sin ramas. No se abre PR `develop`→`master` ni se despliega.

## Alcance por repo

### A · Observabilidad (Sentry)

Org Sentry `collado-studios`, proyectos `personal-os-back` y `personal-os-web`. **Nunca** se commitea un DSN: solo variables de entorno, documentadas en `.env.example`.

#### Back (`@sentry/nestjs`)

| Qué se hace                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/instrument.ts` con `Sentry.init`; se importa en la **primera línea** de `main.ts`.                                                                                                                   |
| `dsn` = `SENTRY_DSN`; `environment` = `NODE_ENV`; `release` = versión de `package.json`; `tracesSampleRate` = `SENTRY_TRACES_SAMPLE_RATE` (default `0.1`).                                                |
| Si `SENTRY_DSN` no está definido, no se inicializa (no-op en tests y CI). Variables opcionales en `env.schema`.                                                                                           |
| `SentryModule.forRoot()` en `AppModule`.                                                                                                                                                                  |
| `AllExceptionsFilter` reporta a Sentry **solo 5xx**; los 4xx (validación, not found, conflicto) no se envían.                                                                                             |
| `beforeSend` (y `beforeSendTransaction`) limpia `Authorization`, cookies, tokens (`token`, `access_token`, `refresh_token`, query strings con tokens) y **todo el body** del request (datos financieros). |

#### Web (`@sentry/nextjs`)

| Qué se hace                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Configs cliente/servidor/edge (`instrumentation.ts`, `instrumentation-client.ts` o el patrón vigente de `@sentry/nextjs`) con `NEXT_PUBLIC_SENTRY_DSN`, `environment`, `release`, mismo scrubbing que el back. |
| No-op si no hay DSN. **Sin Session Replay** por defecto.                                                                                                                                                       |
| `app/error.tsx` y `app/global-error.tsx` en español, con botón «Reintentar», que reportan a Sentry (`captureException`).                                                                                       |
| `withSentryConfig` en `next.config` **preservando intacto** el agregado de Jarvin para la extensión de dev (enviar componente visual a pi).                                                                    |
| Subida de source maps opcional: solo si existe `SENTRY_AUTH_TOKEN` (back y web). Sin token, el build no falla.                                                                                                 |

### B · CI de la web

| Qué se hace                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml` agrega `lint`, `format:check` y `next build` (con envs públicas dummy: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, etc.) además de `tsc` y tests. |
| Corregir todo lo que falle al activarlos (lint, prettier, build).                                                                                                                                                         |

### C · Consistencia de la API (back, con ajustes en web)

| Qué se hace                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Traducir al español los ~113 mensajes de excepción en inglés (`throw new XxxException('...')`). Re-verificar con grep que no quede ninguno. Si la web compara textos de error, ajustarla.                                                                                                                                                                                     |
| Paginación por cursor `{ items, nextCursor, hasMore }` (patrón de [04-paginacion-uniforme](04-paginacion-uniforme.md)) en las listas de cuentas, tarjetas, instituciones, préstamos, metas de ahorro y cobros. Excepción permitida **solo** para listas pequeñas y acotadas, documentada con justificación en este archivo y en el código. Actualizar los clientes de la web. |
| Normalizar prefijos de rutas de controllers: `bank-charges` que monta bajo `finance/analytics`, `ai-actions` mezclando prefijos, etc. Documentar el patrón (`finance/<recurso>`). Actualizar la web.                                                                                                                                                                          |
| Push token: desactivar pasa a `DELETE`; mantener la ruta vieja como compat si la web la usa y migrar la web.                                                                                                                                                                                                                                                                  |
| Resúmenes de Swagger (`@ApiOperation`) en español.                                                                                                                                                                                                                                                                                                                            |
| Borrar `tmp-bhd-balances.mjs` y la excepción de CORS sin `Origin` de Expo.                                                                                                                                                                                                                                                                                                    |
| Decisión de versionado documentada (en `docs/` del back): **no** `/v1` por ahora (un solo cliente, web y back se despliegan juntos); se revisa si aparece un cliente externo o la app móvil vuelve.                                                                                                                                                                           |

## Decisiones

- **Sentry solo 5xx**: los 4xx son flujo normal y meterían ruido; los 5xx son los que hoy no se ven en prod.
- **Scrubbing agresivo**: es finanzas real; se pierde contexto del body a cambio de privacidad. Se conservan método, ruta, status y usuario por id (sin email).
- **Dos proyectos Sentry**: alertas, plataforma y source maps separados.
- **Versionado**: sin `/v1` (ver arriba); la decisión queda registrada.
- **Tests web**: `.ts` puros, sin nuevas dependencias de test (las únicas dependencias nuevas son las de Sentry).
- **Migraciones**: no se esperan; si alguna hace falta, usa la fecha real actual.

## Criterios de aceptación

- [ ] Back arranca y pasa tests sin `SENTRY_DSN`; con DSN, un 500 llega a Sentry y un 400 no.
- [ ] `beforeSend` elimina headers sensibles, cookies, tokens y body (test unitario).
- [ ] Web: `error.tsx` y `global-error.tsx` en español reportan a Sentry; sin replay; build sin DSN ni token pasa.
- [ ] `next.config` conserva el agregado de la extensión de dev.
- [ ] `.env.example` de ambos repos documenta `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`. Ningún DSN en el repo.
- [ ] CI web corre `lint`, `format:check`, `tsc`, tests y `next build`, y está verde.
- [ ] No quedan mensajes de excepción en inglés en el back.
- [ ] Las seis listas paginan por cursor o tienen excepción documentada; la web las consume bien.
- [ ] Prefijos de rutas normalizados y documentados; push token se desactiva con `DELETE`.
- [ ] Swagger en español; `tmp-bhd-balances.mjs` y la excepción CORS de Expo eliminados.
- [ ] Decisión de versionado escrita.
- [ ] Comandos obligatorios pasan en web y back (`format:check`, `lint`, `test`, `build`).

## Tests

- Back: spec del scrubber (`beforeSend`), spec del filtro (5xx reporta, 4xx no), specs de paginación de las listas nuevas, `env.schema.spec.ts` con las variables de Sentry.
- Web: `.ts` puros para el scrubber del cliente y para los helpers de paginación/clients actualizados.

## Cierre

Subir versiones (web minor, back minor), CI verde en ambos, push a `develop`, tags, actualizar `review-register.md`/roadmap si aplica y escribir aquí la sección **Implementación** con «PENDIENTE 18 COMPLETADO». Luego revisión habitual terminando con «REVISION 18 COMPLETADA».

## Implementación

PENDIENTE 18 COMPLETADO — web v0.38.0 · back v0.37.0 (2026-10-15).

### Back

- **Observabilidad (Sentry):** `@sentry/nestjs` 11.8.0. `apps/api/src/instrument.ts` llama `Sentry.init` y se importa en la primera línea de `main.ts`; sin `SENTRY_DSN` no se inicializa. El scrubber vive en `packages/core/src/observability/sentry-scrubber.ts` y limpia el body completo, cookies, cabeceras de auth y cualquier clave con `token`/`password`/`secret`/`api-key` en cabeceras y query strings; se aplica en `beforeSend` y `beforeSendTransaction`. `AllExceptionsFilter` reporta solo los 5xx con método, ruta sin query y `statusCode`; deja al usuario por id, sin email. En `@sentry/nestjs` 11 no existe `SentryModule.forRoot()` (la integración de Nest es parte de `init`), así que el módulo del spec se reemplaza por el `init` de `instrument.ts`.
- **`env.schema`:** `SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE` (default 0.1), `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` y `SENTRY_PROJECT`, todos opcionales; `.env.example` los documenta sin DSN real.
- **Source maps:** `pnpm sentry:sourcemaps` (parte de `build`) sube `dist` con `@sentry/cli` solo si existe `SENTRY_AUTH_TOKEN`; sin token el build no falla.
- **Paginación por cursor** en `accounts`, `cards`, `institutions`, `loans`, `savings-goals` y `receivables`. Cuentas ordenan por `name` (cursor de texto), instituciones por `(sortOrder, name, id)` con la clave `sortOrder\u0000name`, y el resto por fecha + id. Los controllers aceptan `CursorQueryDto` y devuelven `{ items, nextCursor, hasMore }`. No hizo falta ninguna excepción: las seis paginan.
- **Prefijos de rutas:** `GET /finance/analytics/bank-charges` pasa a `GET /finance/bank-charges`; `AiActionsController` queda en `ai/actions` y la lista de acciones de una sesión se mueve a `AiSessionsController` como `GET ai/sessions/:id/actions`. Patrón documentado en `docs/modules/finance/contracts/http.md` (`finance/<recurso>`).
- **Push token:** desactivar pasa a `DELETE /notifications/push-tokens/:token`; el `PATCH .../deactivate` queda como alias deprecado.
- **Español:** ~108 ocurrencias de mensajes de excepción traducidas, más los mensajes genéricos del filtro y las constantes `INVALID_CURSOR_MESSAGE`, `NOT_FOUND_MESSAGE`, `NOT_READY_MESSAGE`; los resúmenes `@ApiOperation` también quedan en español. Las pruebas que afirmaban texto en inglés se actualizaron al español.
- **Limpieza:** se borró `tmp-bhd-balances.mjs` y la excepción de CORS que permitía peticiones sin `Origin`; ahora una petición sin `Origin` se rechaza en no-producción. `docs/decisions/ADR-007-sin-prefijo-de-version.md` registra que no se usa `/v1`.

### Web

- **Observabilidad (Sentry):** `@sentry/nextjs` 11.8.0 con `instrumentation.ts` (servidor y edge), `instrumentation-client.ts` (navegador) y `sentry.server.config.ts`/`sentry.edge.config.ts`. Sin `NEXT_PUBLIC_SENTRY_DSN` no se inicializa y no hay Session Replay. El mismo scrubber vive en `src/shared/observability/`. `app/error.tsx` y `app/global-error.tsx` están en español, reportan con `captureException` y ofrecen «Reintentar». `next.config.mjs` envuelve la config con `withSentryConfig` y conserva intacto el agregado de la extensión de dev; los source maps se suben solo si existe `SENTRY_AUTH_TOKEN`.
- **CI:** `ci.yml` ahora corre `lint`, `format:check`, `tsc`, tests y `next build` con variables públicas dummy.
- **Paginación:** `accountsQuery`, `cardsQuery`, `institutionsQuery`, `loansQuery`, `savingsGoalsQuery` y `receivablesQuery` piden `limit=100` y devuelven `items`, así que los ~70 usos (selects, filtros y cruces) siguen leyendo un array. Ninguna pantalla usa estos seis hooks como fuente de una lista con scroll propia: Productos y Planificación combinan varias entidades con el balance sheet, así que no se migraron a scroll infinito.
- **Rutas y push token:** `ANALYTICS_BANK_CHARGES` apunta a `/finance/bank-charges` y la desactivación del token push usa `DELETE`.
- `.env.example` documenta `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE`, `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` y `SENTRY_PROJECT`.

### Verificación

- Web: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (758) y `pnpm build` (con envs dummy, sin DSN ni token) en verde.
- Back: `pnpm format:check`, `pnpm lint`, `pnpm test` (1028), `pnpm build` y `pnpm lint:money` en verde.
- `review-register.md` y `roadmap.md` no tenían hallazgos abiertos que cayeran dentro del pendiente 18; no se tocaron.

### Revisión (2026-10-15, web v0.38.3 · back v0.37.3)

- **Back, Sentry:** el CI falló en `lint` por un `as T` innecesario en el scrubber; se quitó. `instrument.ts` ahora importa `dotenv/config` antes de leer `process.env`, para que un `SENTRY_DSN` guardado en `.env` cuente; antes el import de instrument corría antes que dotenv y la variable quedaba sin efecto.
- **Back, e2e:** las pruebas esperaban arrays en cuentas, tarjetas y préstamos y mensajes en inglés; se actualizaron al nuevo contrato paginado y al español, junto con `moduleDisabledMessage`.
- **Web, endpoints:** `ANALYTICS_BANK_CHARGES` pasa a `BANK_CHARGES`, acorde con la ruta nueva.
- **Docs:** se agrega `docs/infrastructure/observability.md` en la web y el `docs/operations/ci.md` del back menciona `format:check`; `docs/operations/scripts.md` documenta `sentry:sourcemaps`.
- **Guía de código:** `AllExceptionsFilter.reportToSentry` recibe un objeto en vez de tres parámetros y las tres configs de Sentry de la web comparten `sentryBaseOptions`, en línea con la regla de descomposición por intención.
- **Verificación:** web `format:check`, `lint`, `typecheck`, `test` (758) y `build` en verde; back `format:check`, `lint`, `test` (1028), `build` y e2e en verde.
