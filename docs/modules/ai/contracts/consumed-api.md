# AI — contrato (consumo)

Dueño: `personal-os-back/docs/modules/ai-agent/contracts/http.md`.

| Cliente                                                | Backend                                                 |
| ------------------------------------------------------ | ------------------------------------------------------- |
| `GET /ai/providers`                                    | Settings (`useAiProviders`, query `['ai','providers']`) |
| `GET/POST /ai/sessions`, `GET/DELETE /ai/sessions/:id` |                                                         |
| `POST /ai/chat`                                        | fallback                                                |
| `POST /ai/chat/stream`                                 | SSE                                                     |
| `POST /ai/actions/:id/execute\|cancel`                 |                                                         |
| WS `ai.response`                                       | namespace `/notifications`                              |

Query keys: `['ai','sessions']`, `['ai','session', id]`, `['ai','providers']`.
