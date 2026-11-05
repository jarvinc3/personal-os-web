# Capacidad histórica: chat y streaming

> **Histórico.** El chat y su streaming se retiraron de la web en AI-0. Este documento conserva el diseño de la implementación anterior como referencia para AI-9; la web actual no tiene la ruta `/chat`, la carpeta `src/modules/ai/` ni el renderer descrito aquí.

## Envío en el runtime retirado

1. El hook anterior asignaba un UUID a `clientMessageId` para la idempotencia del backend cuando quien llamaba no lo enviaba.
2. Intentaba SSE mediante `streamAiChat` y `fetch` a `API_BASE_URL/ai/chat/stream`, con Bearer de Supabase y sin pasar por `api-client`.
3. Los eventos del stream eran `start` → `chunk*` / `status` / `reset` → `done` | `error`.
4. El cliente anterior usaba el fallback JSON `POST /ai/chat` solo ante errores `network` o `parse` y antes de recibir `start`.
5. Si el stream había empezado pero no llegaba `done` y existía un `sessionId`, recuperaba el último mensaje `assistant` con `GET /ai/sessions/:id`; no hacía fallback JSON.
6. Al completar, `onSuccess` invalidaba `['ai','sessions']` y `['ai','session', sessionId]`; `done` aplicaba `sideEffects`.

En la versión documentada el 2026-09-15, `/chat` cargaba el selector `general`, el historial y «Nueva conversación». Esa ruta ya no existe en la web actual.

## Criterios históricos

Estos criterios pertenecían al runtime retirado; no describen una pantalla vigente.

- `AC-AI-W-001` — Given retry del mismo envío, When mismo `clientMessageId`, Then el backend no duplica el mensaje de usuario.
- `AC-AI-W-002` — Given stream ya empezó, When error posterior, Then **no** fallback JSON.

Referencias de la implementación retirada: `use-ai-chat.ts`, `ai-chat-stream.ts`.

## Render del runtime retirado

La implementación anterior usaba `ChatMarkdownBlock` para mostrar `**negrita**`, `` `código` `` y enlaces con la sintaxis `[texto](url)`. Una ruta interna (`/finance/...`) se abría con `Link` de Next; una URL externa iba en otra pestaña. El asistente usaba ese enlace para abrir un formulario ya rellenado. Este renderer ya no forma parte de la web actual.
