# Observabilidad (Sentry)

Sentry es **opcional**. Sin `NEXT_PUBLIC_SENTRY_DSN` la SDK no se inicializa y la app funciona igual; es el caso de desarrollo, tests y CI.

## Archivos

| Archivo                     | Runtime                                                   |
| --------------------------- | --------------------------------------------------------- |
| `instrumentation-client.ts` | navegador                                                 |
| `sentry.server.config.ts`   | servidor (Node)                                           |
| `sentry.edge.config.ts`     | edge                                                      |
| `instrumentation.ts`        | carga los dos anteriores y engancha `captureRequestError` |

`src/shared/observability/` tiene el armado de opciones y el scrubber compartido.

## Qué se envía

- Sin Session Replay.
- El scrubber borra el body, las cookies, las cabeceras de autorización y cualquier clave con `token`, `password`, `secret` o `api-key` en cabeceras y query strings. Se conservan método, ruta, status y usuario por id (sin email).

## Variables

| Variable                                | Para qué                                               |
| --------------------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SENTRY_DSN`                | Activa la SDK; sin él no se inicializa                 |
| `SENTRY_TRACES_SAMPLE_RATE`             | Muestreo en servidor/edge (0..1, default 0.1)          |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | Muestreo en el navegador (0..1, default 0.1)           |
| `SENTRY_AUTH_TOKEN`                     | Sube source maps en el build; sin él el build no falla |
| `SENTRY_ORG` / `SENTRY_PROJECT`         | Organización y proyecto para la subida de mapas        |

Los DSN nunca se commitean: van solo por variables de entorno.
