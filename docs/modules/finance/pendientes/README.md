# Finanzas: pendientes

Specs de lo que falta tras la alineación de dominio (fases 01-09 y partes 1-4, ya implementadas y descritas en [../dominio.md](../dominio.md)). Estado al 22 oct 2026 (web `v0.35.1`, back `v0.32.3`). Cada pendiente se implementa en una sesión y se revisa en otra, que publica sus correcciones como PATCH. Orden acordado el 15 oct 2026: el 14 va antes del 12 y el 13; versiones previstas a confirmar con el último tag.

| #   | Spec                                                                                                  | Tamaño | Repos      | Estado        | Versiones                                  |
| --- | ----------------------------------------------------------------------------------------------------- | ------ | ---------- | ------------- | ------------------------------------------ |
| 01  | [Agrupar reversa con su original](./01-agrupar-reversas.md)                                           | S      | web        | `implemented` | web v0.21.0–v0.21.2                        |
| 02  | [Importar estado de cuenta (PDF) y conciliar](./02-importar-estado-de-cuenta.md)                      | L      | back + web | `implemented` | web v0.22.0–v0.22.1 · back v0.21.0–v0.21.1 |
| 03  | [Sincronización automática al conectar el correo](./03-sync-tras-conectar-correo.md)                  | S      | web        | `implemented` | web v0.23.0–v0.23.1                        |
| 04  | [Paginación uniforme](./04-paginacion-uniforme.md)                                                    | M      | back + web | `implemented` | web v0.24.0–v0.24.3 · back v0.22.0–v0.22.2 |
| 05  | Contexto de entidad en el agente (spec cerrada; descrito en [dominio.md](../dominio.md#agente-de-ia)) | M      | back + web | `implemented` | web v0.25.0–v0.25.1 · back v0.23.0–v0.23.2 |
| 06  | [Bloques visuales, captura rápida y resumen semanal](./06-agente-bloques-captura-resumen.md)          | L      | back + web | `implemented` | web v0.26.0–v0.26.3 · back v0.24.0–v0.24.4 |
| 07  | [Comercios y pagos recurrentes](./07-comercios-recurrentes-suscripciones.md)                          | L      | back + web | `implemented` | web v0.27.0–v0.27.2 · back v0.25.0–v0.25.2 |
| 08  | [Suscripciones](./08-suscripciones.md)                                                                | L      | back + web | `implemented` | web v0.28.0–v0.28.2 · back v0.26.0–v0.26.1 |
| 09  | [Conciliación con ajustes](./09-conciliacion-ajustes.md)                                              | M      | back + web | `implemented` | web v0.29.0–v0.29.1 · back v0.27.0–v0.27.2 |
| 10  | [Rediseño de la vista Suscripciones](./10-suscripciones-rediseno.md)                                  | L      | back + web | `implemented` | web v0.30.0–v0.30.2 · back v0.28.0–v0.28.2 |
| 11  | [Integridad de saldos](./11-integridad-saldos.md)                                                     | M      | back + web | `implemented` | web v0.31.0 · back v0.29.0                 |
| 14  | [Suscripciones v3](./14-suscripciones-v3.md)                                                          | L      | back + web | `implemented` | web v0.33.0–v0.33.3 · back v0.30.0–v0.30.2 |
| 12  | [Tarjetas prácticas](./12-tarjetas-practicas.md)                                                      | M      | back + web | `implemented` | web v0.34.0–v0.34.1 · back v0.31.0–v0.31.1 |
| 13  | [Decimales exactos](./13-decimales-exactos.md)                                                        | S      | back + web | `implemented` | web v0.35.0–v0.35.1 · back v0.32.0–v0.32.3 |
| 15  | [Auditoría de reglas de UI (REV-WEB-025)](./15-auditoria-reglas-ui.md)                                | M      | web        | `implemented` | web v0.35.2–v0.35.4                        |
| 16  | [Modelo de efectivo](./16-modelo-efectivo.md)                                                         | L      | back + web | `implemented` | web v0.36.0 · back v0.33.0                 |

## Notas

- **16**: PENDIENTE 16 COMPLETADO (web v0.36.0 · back v0.33.0). El efectivo pasa a una institución de sistema «Efectivo» por usuario (`is_system`, migración `20261021110000_fin_cash_institution`), con una cuenta por moneda, total convertido y desglose por moneda y cuenta. El back rechaza editar, archivar o borrar la institución, y crear tarjetas, préstamos o fuentes de correo ligados a ella.
- **02**: la importación es solo subida manual de PDF (pdf.js + cola BullMQ `statement-import` + extractor LLM con esquema estricto). No hay ingesta por correo: los bancos no envían el estado de cuenta por email.
- **07**: Comercios queda fuera del tab bar con atajo solo en Productos. El gestor de `/finance/subscriptions` es del pendiente 08.
- **08**: el gestor completo de suscripciones es vista principal del tab bar de Finanzas, entre Planificación y Productos. Tablas y REST propios (`fin_subscriptions`, `fin_subscription_payments`), emparejado de pagos y recordatorios; los ajustes se movieron a la sección «Suscripciones» de `/settings/finance`.
- **10**: rediseño de Suscripciones como vista principal con diseño propio (pedido del usuario tras el 09).
- **14**: rehace la vista de Suscripciones según los [mockups v3](../mockups/suscripciones-v3/README.md); reemplaza el diseño del 10.
- **09, 11–13, 15**: camino a 1.0; orden, decisiones y fuera de alcance (bitácora, intereses) en [../direccion-y-decisiones.md](../direccion-y-decisiones.md).
- **15**: PENDIENTE 15 COMPLETADO (web v0.35.2). Corrección de la auditoría `REV-WEB-025`: 44 hallazgos vigentes corregidos, 7 resueltos antes por Suscripciones v3 y los pendientes 12-13, y 9 por decidir (H-44, H-47, H-55 a H-58, H-59 y H-60). Desglose en el [spec](./15-auditoria-reglas-ui.md) y en [reference/auditoria-reglas-ui-convenciones.md](../../reference/auditoria-reglas-ui-convenciones.md). Revisión (web v0.35.3–v0.35.4): H-42 solo se veía con datos previos, el pie de las listas infinitas no llevaba icono, el tamaño de tanda de las sesiones de IA era un número suelto, el vacío del historial de conversaciones era un párrafo suelto y el FAB de Planificación y dos filas de Ajustes no bloqueaban la repetición.
- **13**: PENDIENTE 13 COMPLETADO (web v0.35.0–v0.35.1 · back v0.32.0–v0.32.3). El dinero se suma, resta y convierte con `Decimal` hasta presentar o persistir: `Prisma.Decimal` en el back (`shared/domain/money.ts`) y `decimal.js-light` en la web (`shared/lib/decimal.ts`). Redondeo `ROUND_HALF_EVEN` a 2 decimales. La API sigue devolviendo strings (ADR-002). Una regla ESLint y `pnpm lint:money` prohiben `Number`/`toNumber` en las rutas de lectura de dinero (analytics, balance general, FX, suscripciones y comercios).

Fuera de alcance: la app móvil (fuera de servicio) y la configuración externa de OAuth (branding, dominio propio de Supabase, CASA).

Reglas para quien implemente: trabajar en `develop`, migraciones Prisma con fecha posterior a la última, sin drift (`prisma migrate diff ... --exit-code`), tests unitarios de cada caso de uso y specs `*.spec.ts` en la web. Al terminar, mover lo implementado a `dominio.md`.
