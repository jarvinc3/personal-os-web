# AI — overview

## Propósito

UI del agente central: sesiones, streaming, cards de confirmación, selector de contexto, insights por socket.

Código: `src/modules/ai/` (docs en `docs/modules/ai/`, no `ai-agent`).

## Alcance

- Ruta `/chat` (sidebar footer, Home, `?module=`).
- SSE `POST /ai/chat/stream` con fallback JSON si el stream falla **antes** de `start`.
- CRUD sesiones; execute/cancel de acciones PENDING.
- Side effects: invalidate query keys, `theme`, `moduleContext`.
- Socket `ai.response` en el mismo namespace `/notifications`.

## Fuera de alcance

- Implementar tools (backend registry).
- Tools de dominio para agenda/projects/health/subscriptions.

> [!WARNING]
> **REV-WEB-011** (`NO_IMPLEMENTADO`) — no hay `agenda-tools.md` etc. El selector igual ofrece esos slugs; el backend solo da tools mínimas. [review-register.md](../../review-register.md#rev-web-011)

## Chrome

No es `ModuleAppNav`. Header propio (`usePageHeader`). Combobox de módulo en el header del chat.
