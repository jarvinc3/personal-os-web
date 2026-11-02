# AI (web)

> **Histórico.** La web no tiene módulo de IA ni ruta `/chat` desde AI-0. Estos documentos describen el chat retirado y se conservan como referencia para AI-9; los contratos del back siguen vigentes.

Estos documentos no describen código vigente: no existe `src/modules/ai/`. El rediseño del chat llega con AI-9.

| Documento                                                                    | Contenido                      |
| ---------------------------------------------------------------------------- | ------------------------------ |
| [overview.md](./overview.md)                                                 | Alcance y selector             |
| [capabilities/chat.md](./capabilities/chat.md)                               | Stream, fallback, idempotencia |
| [capabilities/context-and-actions.md](./capabilities/context-and-actions.md) | Módulo, cards, side effects    |
| [rules/chat.md](./rules/chat.md)                                             | `BR-AI-001`–`005`              |
| [contracts/consumed-api.md](./contracts/consumed-api.md)                     | REST + WS                      |

Estado y trabajo pendiente: GitHub Issues del repo (`roadmap`).
