# Contrato OpenAPI y tipos del API

Los tipos de request y de respuesta del cliente salen del contrato OpenAPI que publica `personal-os-back`. No se escriben a mano. La decisión y el alcance están en #155; el hueco de las respuestas que el back todavía no describe, en [personal-os-back#263](https://github.com/jarvinc3/personal-os-back/issues/263).

## Piezas

| Pieza           | Ruta                                               | Qué es                                                                                  |
| --------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Contrato        | `openapi/swagger-spec.json`                        | Copia del `swagger-spec.json` del back. La usan la generación y el CI.                  |
| Generador       | `src/config/api-contract/generate.ts`              | Convierte el contrato en tipos con `openapi-typescript`.                                |
| Tipos generados | `src/config/api-contract/api-schema.ts`            | Archivo generado. ESLint y Prettier lo ignoran.                                         |
| Comprobaciones  | `src/config/api-contract/api-schema.assertions.ts` | Afirmaciones que resuelve `pnpm typecheck`, entre ellas que el monto sea texto decimal. |
| Sincronización  | `src/config/api-contract/sync-contract.ts`         | Copia el contrato del back a `openapi/swagger-spec.json`.                               |

## Comandos

- `pnpm api:contract` copia el contrato desde el repo hermano `personal-os-back` del workspace, tanto en la copia principal como en una copia de `temp/<rama>`, o desde `OPENAPI_SPEC_PATH`. Falla si el archivo no existe.
- `pnpm api:generate` escribe `src/config/api-contract/api-schema.ts`.
- `pnpm typecheck` ejecuta la generación antes de `tsc`; falla si el contrato no está disponible. CI corre ese script.

Para actualizar el contrato: `pnpm api:contract && pnpm api:generate` y commitea el contrato y el archivo generado en el mismo cambio.

## Cómo se consumen

El archivo generado exporta `paths`, `components` y `operations` con los nombres del contrato.

```ts
import type {
  components,
  operations,
} from "@/src/config/api-contract/api-schema"

type KnowledgeItem = components["schemas"]["KnowledgeItemDto"]

type BalanceSheet =
  operations["BalanceSheetController_get"]["responses"][200]["content"]["application/json"]
```

- Si el cliente necesita un nombre propio, lo declara como alias del tipo generado. Ejemplo: `src/modules/intelligence/types/knowledge.types.ts` mantiene `KnowledgeItem` apuntando a `KnowledgeItemDto`.
- Un tipo escrito a mano que duplique uno generado se elimina y se usa el generado.
- El contrato no marca `required` en las respuestas. Los campos llegan tipados como opcionales salvo que el schema los exija; cuando el cliente requiere un campo de una respuesta, lo declara con un alias local (`ContractField` en `src/modules/finance/shared/types/entities/accounts.ts`). La web no agrega `required` al contrato: eso se corrige en el back.
- Los montos son texto decimal (`string`); `null` significa "sin datos". Ver [ADR-002](../decisions/ADR-002-money-strings.md).

## Cobertura del contrato

En la copia actual del contrato (154 rutas y 74 schemas) solo 10 de las 202 respuestas 2xx traen schema: health (3), conocimiento de IA (6) y balance patrimonial. Las demás solo traen descripción, así que sus tipos de lectura siguen a mano hasta que el back publique los schemas ([personal-os-back#263](https://github.com/jarvinc3/personal-os-back/issues/263)).

## Pruebas

- `contract.spec.ts`: lectura, validación y origen del contrato.
- `sync-contract.spec.ts`: copia desde el back y fallo sin el repo hermano.
- `generate.spec.ts`: el archivo versionado coincide con la generación y falla si falta el contrato.
- `api-schema.assertions.ts`: el typecheck compila solo si los montos del balance siguen siendo texto decimal.
