# Contrato OpenAPI y tipos del API

Los tipos de request y de respuesta del cliente salen del contrato OpenAPI que publica `personal-os-back`. No se escriben a mano. La decisión y el alcance están en #155; el hueco de las respuestas que el back todavía no describe, en [personal-os-back#263](https://github.com/jarvinc3/personal-os-back/issues/263).

## Piezas

| Pieza           | Ruta                                               | Qué es                                                                                                                                       |
| --------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Contrato        | `openapi/swagger-spec.json`                        | Contrato versionado del cliente: entrada de la generación y del CI. Se sincroniza desde el contrato del back cuando ese archivo está al día. |
| Generador       | `src/config/api-contract/generate.ts`              | Convierte el contrato en tipos con `openapi-typescript`.                                                                                     |
| Tipos generados | `src/config/api-contract/api-schema.ts`            | Archivo generado. ESLint y Prettier lo ignoran.                                                                                              |
| Comprobaciones  | `src/config/api-contract/api-schema.assertions.ts` | Afirmaciones que resuelve `pnpm typecheck`, entre ellas que el monto sea texto decimal.                                                      |
| Sincronización  | `src/config/api-contract/sync-contract.ts`         | Copia el contrato del back a `openapi/swagger-spec.json`.                                                                                    |

## Comandos

- `pnpm api:contract` copia el `swagger-spec.json` del repo hermano `personal-os-back` del workspace, tanto en la copia principal como en una copia de `temp/<rama>`, o desde `OPENAPI_SPEC_PATH`. Falla si el archivo no existe.
- Solo es seguro correr `pnpm api:contract` cuando el back regeneró su archivo. Si el archivo del back está atrasado, la copia revierte el contrato del cliente: pasó con el archivo del 15/11 ([personal-os-back#375](https://github.com/jarvinc3/personal-os-back/issues/375)), sin `DISCARDED`, y por eso el contrato actual se generó desde el código del back en #445 y el back lo regeneró en [personal-os-back#419](https://github.com/jarvinc3/personal-os-back/issues/419).
- Antes de correrlo, confirmá que el back publicó su contrato y que cada estado de correo del archivo nuevo existe en `MESSAGE_STATUS_LABELS`, que declara sus claves con `satisfies`: un estado nuevo no compila hasta agregar su etiqueta.
- `pnpm api:generate` escribe `src/config/api-contract/api-schema.ts`.
- `pnpm typecheck` ejecuta la generación antes de `tsc`; falla si el contrato no está disponible. CI corre ese script.

Para actualizar el contrato: `pnpm api:contract && pnpm api:generate`, revisá el diff de los dos archivos y commitea en el mismo cambio los ajustes de tipos del cliente que el contrato nuevo exija.

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
- Cuando el contrato todavía no describe un campo que el back ya acepta, el cliente lo declara en un alias local del tipo generado. Es el caso de `relevance` y `notes` en las verificaciones y de `templateFingerprint` como texto en la verificación por grupo.
- Los montos son texto decimal (`string`); `null` significa "sin datos". Ver [ADR-002](../decisions/ADR-002-money-strings.md).

El contrato versionado todavía no publica `clientMessageId` ni `stream` del envío de mensajes del agente (back #421). El overlay los declara como alias local en `src/modules/intelligence/types/agent-chat.types.ts` y los elimina cuando la copia OpenAPI se sincronice.

## Cobertura del contrato

En la copia actual del contrato (181 rutas y 291 schemas) 223 de las 231 respuestas 2xx traen schema. La copia se generó desde el código del back en #445; el archivo del back publica 183 rutas y 296 schemas desde [personal-os-back#419](https://github.com/jarvinc3/personal-os-back/issues/419), con `CLASSIFYING` entre los estados del correo. Igualarlas es un cambio aparte: `pnpm api:contract && pnpm api:generate` más los tipos del cliente que cambien. Las señales de correo de AI-7 se leen con los tipos generados (`components["schemas"]["AiSignalResponseDto"]`) y el resto de Inteligencia ya usa un alias de `components["schemas"]` para cada tipo del módulo. Las respuestas que el contrato todavía no describe siguen a mano hasta que el back publique los schemas ([personal-os-back#263](https://github.com/jarvinc3/personal-os-back/issues/263)).

## Pruebas

- `contract.spec.ts`: lectura, validación y origen del contrato.
- `sync-contract.spec.ts`: copia desde el back y fallo sin el repo hermano.
- `generate.spec.ts`: el archivo versionado coincide con la generación y falla si falta el contrato.
- `api-schema.assertions.ts`: el typecheck compila solo si los montos del balance siguen siendo texto decimal.
