# AI — reglas de cliente

| ID | Condición | Resultado | Evidencia |
| --- | --- | --- | --- |
| `BR-AI-001` | Slug de `?module=` desconocido | `parseModuleChatSlug` → `general` | `chat.types.ts` |
| `BR-AI-002` | Crear sesión `general` | `POST /ai/sessions` sin `moduleSlug`; `contextType: 'general'` | `use-ai-sessions.ts` |
| `BR-AI-003` | Error SSE `network`/`parse` antes de `start` | Fallback `POST /ai/chat` mismo `clientMessageId` | `use-ai-chat.ts` |
| `BR-AI-004` | Stream ya envió `start` | No fallback JSON | `shouldFallbackToJson` |
| `BR-AI-005` | Socket `ai.response` tipo `insight` y pathname no es `/chat` | Toast recortado a 120 chars | `use-ai-socket.ts` |
