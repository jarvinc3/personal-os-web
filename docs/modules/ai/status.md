# AI — estado

Fecha: 2026-10-14

| Ítem                                                             | Estado                      | Evidencia                                                                                                     |
| ---------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Chat SSE + JSON + actions                                        | `implemented`               | `src/modules/ai/`                                                                                             |
| Contexto de entidad (`entityRef`) desde los detalles de Finanzas | `implemented`               | `useRegisterChatContext`, `ChatLauncherButton`, chip en `chat-input.tsx` (web v0.25.x)                        |
| Bloques visuales en el chat                                      | `implemented`               | `components/blocks/` (`transaction_card`, `transaction_list`, `budget_progress`, `loan_summary`; web v0.26.x) |
| Selector slugs sin tools de producto                             | `PARCIALMENTE_IMPLEMENTADO` | REV-WEB-011                                                                                                   |
| Tests módulo                                                     | `planned`                   | sin specs; ver [docs/roadmap.md](../../roadmap.md)                                                            |
