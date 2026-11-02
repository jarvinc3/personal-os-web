# Capacidad: chat y streaming

> **Histórico.** El chat y su streaming se retiraron de la web en AI-0; se conservan como referencia para AI-9.

## Envío

1. `clientMessageId` = UUID (idempotencia backend); el hook genera uno si el caller no lo pasa.
2. Intenta SSE (`streamAiChat` → `fetch` a `API_BASE_URL/ai/chat/stream`, Bearer de Supabase; no pasa por `api-client`).
3. Eventos: `start` → `chunk*` / `status` / `reset` → `done` | `error`.
4. Fallback JSON `POST /ai/chat` solo si el error es `network`|`parse` **y** aún no hubo `start`.
5. Si el stream empezó pero no llegó `done` y hay `sessionId`, recupera el último mensaje `assistant` con `GET /ai/sessions/:id` (tampoco cae a JSON).
6. `onSuccess` invalida `['ai','sessions']` y `['ai','session', sessionId]`; `done` aplica `sideEffects`.

Runtime 2026-09-15: `/chat` carga combobox `general`, historial y “Nueva conversación”.

## Criterios

- `AC-AI-W-001` — Given retry del mismo envío, When mismo `clientMessageId`, Then el backend no duplica el mensaje de usuario.
- `AC-AI-W-002` — Given stream ya empezó, When error posterior, Then **no** fallback JSON.

Evidencia: `use-ai-chat.ts`, `ai-chat-stream.ts`.

## Render

`ChatMarkdownBlock` pinta `**negrita**`, `` `código` `` y enlaces `[texto](url)`. Una ruta interna (`/finance/...`) se abre con `Link` de Next; una URL externa va en otra pestaña. El asistente usa ese enlace para abrir un formulario ya rellenado.
