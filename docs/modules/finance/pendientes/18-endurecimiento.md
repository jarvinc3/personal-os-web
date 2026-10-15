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

_Pendiente._
