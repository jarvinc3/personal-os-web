# Capacidad: contexto de módulo y acciones

## Selector

`CHAT_MODULE_OPTIONS`: `general`, `agenda`, `projects`, `health`, `subscriptions`, `finance`. `POST /ai/sessions` omite `moduleSlug` si es `general`; `contextType` sí se envía (`general` u otro slug). Query `?module=finance` preselecciona.

`parseModuleChatSlug` cae a `general` si el slug es desconocido.

Finance desbloquea tools finance en backend (módulo enabled). Otros slugs no tienen tools de producto.

## Acciones

Si `confirmBeforeActions` (prefs) o el tool es mutante, el backend deja `AiAction` PENDING. UI: `ChatActionCard` → `POST /ai/actions/:id/execute` o `cancel`.

Socket `ai.response` tipos: `chat.complete` | `chat.chunk` | `insight` | `action.updated`. Insights toast si pathname no es `/chat`.

## Side effects

| type | Cliente |
| --- | --- |
| `invalidate` | `queryClient.invalidateQueries({ queryKey: effect.keys })` |
| `theme` | `setTheme` + invalidate profile |
| `moduleContext` | actualiza selector/label |

Evidencia: `chat.types.ts`, `use-ai-side-effects.ts`, `use-ai-actions.ts`, `use-ai-socket.ts`.
