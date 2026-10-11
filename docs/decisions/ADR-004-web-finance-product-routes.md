# ADR-004: Rutas de productos, instituciones y cuentas en Finanzas

- Estado: `accepted`

## Contexto

`/finance/accounts` mezclaba tres cosas: el listado de instituciones con sus anillos de balance, los atajos a Categorías y Correos, y el detalle de una cuenta de banco. El término "account" nombraba a la vez un hub, una vista y una cuenta real, y el detalle de cuenta colgaba de una ruta plana sin relación con su institución. El efectivo (CASH) no tiene institución, así que no encaja en una jerarquía pura.

## Decisión

- `/finance/products` es el hub: instituciones, anillos de balance y atajos. La pestaña se llama "Productos".
- `/finance/institutions/[institutionId]` es el detalle de una institución.
- El detalle de cuenta cuelga de su institución: `/finance/institutions/[institutionId]/accounts/[accountId]`.
- El detalle de tarjeta cuelga de su institución: `/finance/institutions/[institutionId]/cards/[cardId]`.
- El efectivo sin institución vive en `/finance/cash/[accountId]`.
- Categorías y sincronización suben al nivel del módulo: `/finance/categories` y `/finance/sync`.
- Los endpoints HTTP (`/finance/accounts`, ...) no cambian: son otra capa.

## Consecuencias

- Los enlaces antiguos a `/finance/accounts*` dejan de resolver; hay que actualizarlos.
- La institución aparece dos veces en la URL de una cuenta (segmento y dato del recurso); el segmento es contexto de navegación, no una validación.
- El efectivo mantiene una ruta propia en vez de una institución sintética.
