# Finanzas: pendientes

Specs de lo que falta tras la alineación de dominio (fases 01-09 y partes 1-4, ya implementadas y descritas en [../dominio.md](../dominio.md)). Cada una se verificó contra el código de develop al 13 oct 2026 (web `fd0630c`, back `bfcfded`).

| #   | Spec                                                                                         | Tamaño | Repos      | Estado        |
| --- | -------------------------------------------------------------------------------------------- | ------ | ---------- | ------------- |
| 01  | [Agrupar reversa con su original](./01-agrupar-reversas.md)                                  | S      | web        | `implemented` |
| 02  | [Importar estado de cuenta (PDF) y conciliar](./02-importar-estado-de-cuenta.md)             | L      | back + web | `implemented` |
| 03  | [Sincronización automática al conectar el correo](./03-sync-tras-conectar-correo.md)         | S      | web        | `implemented` |
| 04  | [Paginación uniforme](./04-paginacion-uniforme.md)                                           | M      | back + web | `implemented` |
| 06  | [Bloques visuales, captura rápida y resumen semanal](./06-agente-bloques-captura-resumen.md) | L      | back + web | `pending`     |
| 07  | [Comercios, recurrentes y suscripciones](./07-comercios-recurrentes-suscripciones.md)        | L      | back + web | `pending`     |

## Orden sugerido

1. **01** y **03**: rápidas, solo web.
2. **04**: base para las listas que crecen. 02 y 07 la reutilizan.
3. **07**: el comercio normalizado mejora la conciliación de 02 y la captura rápida de 06.
4. **02**: el más grande; usa comercios (07) para emparejar.
5. **06**: bloques, captura rápida y resumen semanal (este último usa 07 para "próximos cobros").

Fuera de alcance: la app móvil (fuera de servicio) y la configuración externa de OAuth (branding, dominio propio de Supabase, CASA).

Reglas para quien implemente: trabajar en `develop`, migraciones Prisma con fecha posterior a la última (`20261015220000_*`), sin drift (`prisma migrate diff ... --exit-code`), tests unitarios de cada caso de uso y specs `*.spec.ts` en la web. Al terminar, mover lo implementado a `dominio.md` y borrar la spec.
