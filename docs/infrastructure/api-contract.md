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
| Deriva          | `src/config/api-contract/contract-drift.ts`        | Compara la copia con el contrato del back y nombra la ruta, la operación o el esquema que cambió.                                            |

## Comandos

- `pnpm api:contract` copia el `swagger-spec.json` del repo hermano `personal-os-back` del workspace, tanto en la copia principal como en una copia de `temp/<rama>`, o desde `OPENAPI_SPEC_PATH`. Falla si el archivo no existe.
- Solo es seguro correr `pnpm api:contract` cuando el back regeneró su archivo. Si el archivo del back está atrasado, la copia revierte el contrato del cliente: pasó con el archivo del 15/11 ([personal-os-back#375](https://github.com/jarvinc3/personal-os-back/issues/375)), sin `DISCARDED`, y por eso el contrato actual se generó desde el código del back en #445 y el back lo regeneró en [personal-os-back#419](https://github.com/jarvinc3/personal-os-back/issues/419).
- Antes de correrlo, confirmá que el back publicó su contrato y que cada estado de correo del archivo nuevo existe en `MESSAGE_STATUS_LABELS`, que declara sus claves con `satisfies`: un estado nuevo no compila hasta agregar su etiqueta.
- `pnpm api:generate` escribe `src/config/api-contract/api-schema.ts`.
- `pnpm api:contract:check` compara la copia versionada con el contrato del back y termina en 1 si difieren. Usa la misma resolución que `pnpm api:contract`: el repo hermano o `OPENAPI_SPEC_PATH`. No compara `info` (título y versión cambian con cada release del back y no describen lo que el cliente puede enviar); sí compara rutas, operaciones —parámetros, cuerpos y respuestas— y esquemas.
- `pnpm typecheck` ejecuta la generación antes de `tsc`; falla si el contrato no está disponible. CI corre ese script.

Para actualizar el contrato: `pnpm api:contract && pnpm api:generate`, revisá el diff de los dos archivos y commitea en el mismo cambio los ajustes de tipos del cliente que el contrato nuevo exija.

## Gate de deriva en el CI

El job `contract` corre en cada PR y en cada push a `develop`. Clona `personal-os-back` en `develop` con el secreto de solo lectura **`BACK_REPO_TOKEN`** (creado por el owner del repo; el job no lo crea), lee su `swagger-spec.json` y ejecuta `pnpm api:contract:check`. Si la copia versionada no coincide, el job falla y lista las diferencias, por ejemplo:

```text
ruta solo en la copia versionada: /api/ai/chat
operación cambió en el back: GET /api/intelligence/messages
esquema cambió en el back: BudgetDto
```

Cómo se arregla: `pnpm api:contract && pnpm api:generate` en la rama del PR, revisar el diff y commitear los dos archivos con los ajustes de tipos que el contrato nuevo exija.

Sin el secreto el job falla con un mensaje que lo nombra: un gate apagado no puede pasar por verde. Si `personal-os-back` cambia y la copia no se regenera, el cliente sigue enviando el nombre viejo y el API responde 400 porque el `ValidationPipe` del back usa `forbidNonWhitelisted` (le pasó a los correos con `limit`, [personal-os-back#436](https://github.com/jarvinc3/personal-os-back/issues/436)).

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

El contrato ya publica `clientMessageId`, `stream` y el tipo de entidad `institution` del contexto. El cliente toma el cuerpo de `SendAiConversationMessageDto`, fija `stream: true` y exige `clientMessageId` en `AgentSendMessageBody`; el contexto sale de `AgentInvocationContext`, que solo acota `entityRef` a `{ type, id }`.

## Cobertura del contrato

En la copia actual del contrato (183 rutas y 297 schemas) 225 de las 234 respuestas 2xx traen schema. La copia coincide hoy con el `swagger-spec.json` del back y el gate de deriva la mantiene así: regenerarla dejó de ser un pendiente manual. Las señales de correo de AI-7 se leen con los tipos generados (`components["schemas"]["AiSignalResponseDto"]`) y el resto de Inteligencia ya usa un alias de `components["schemas"]` para cada tipo del módulo. Las respuestas que el contrato todavía no describe siguen a mano hasta que el back publique los schemas ([personal-os-back#263](https://github.com/jarvinc3/personal-os-back/issues/263)).

## Pruebas

- `contract.spec.ts`: lectura, validación y origen del contrato.
- `sync-contract.spec.ts`: copia desde el back y fallo sin el repo hermano.
- `contract-drift.spec.ts`: la copia en orden no reporta nada, el orden de las claves no cuenta como diferencia y cada tipo de deriva (ruta, operación, esquema, documento) se nombra del lado que corresponde.
- `generate.spec.ts`: el archivo versionado coincide con la generación y falla si falta el contrato.
- `api-schema.assertions.ts`: el typecheck compila solo si los montos del balance siguen siendo texto decimal.
