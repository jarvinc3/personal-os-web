# AI Agent Module (App)

## Scope

Chat UI for the central AI agent: sessions, streaming responses, tool action cards, module context switching, and realtime updates via WebSocket.

## Navigation

| Screen | Path         | Entry                                           |
| ------ | ------------ | ----------------------------------------------- |
| Chat   | `(app)/chat` | Home shortcut, deep link with `?module=finance` |

The chat screen is hidden from the drawer (`drawerItemStyle: { display: 'none' }`) but reachable from Home and module shortcuts.

## Module context

`ChatModuleSelect` lets the user pick context:

| Slug            | Backend tools doc        |
| --------------- | ------------------------ |
| `general`       | `core-tools.md`          |
| `finance`       | `finance-tools.md`       |
| `agenda`        | `agenda-tools.md`        |
| `projects`      | `projects-tools.md`      |
| `health`        | `health-tools.md`        |
| `subscriptions` | `subscriptions-tools.md` |

Session creation sends `moduleSlug` to `POST /ai/sessions`. Chat requests include the active session id.

## Data layer

| Hook / lib          | Purpose                                                  |
| ------------------- | -------------------------------------------------------- |
| `useAiChat`         | Send messages (JSON + stream), manage local message list |
| `useAiSessions`     | List, create, load, delete sessions                      |
| `useAiActions`      | Execute or cancel pending tool actions                   |
| `useAiSocket`       | Listen for `ai.response` over Socket.IO                  |
| `useAiSideEffects`  | Apply server side effects (theme, cache invalidation)    |
| `ai-chat-stream.ts` | Parse SSE chunks from `/ai/chat/stream`                  |

## UI components

- `ChatMessageRenderer` — renders user/assistant messages and tool blocks
- `ChatActionCard` — confirmation UI for mutating tools when `confirmBeforeActions` is on
- `ChatEmptySuggestions` — starter prompts per module
- `ChatSessionSheet` — session history picker
- `ChatMarkdownBlock` — markdown rendering for assistant replies

## User preferences (AI)

Configured in Settings → AI section (`EditAISheet`, `EditAIProviderSheet`):

- Tone: concise / balanced / detailed
- Default provider: Groq, Cerebras, OpenRouter
- Proactive insights toggle
- Confirm before actions toggle

These map to `preferences.ai` and are readable/writable by AI tools (`update_ai_settings`).

## Backend contract

- `GET /ai/providers`
- `POST /ai/chat`, `POST /ai/chat/stream`
- CRUD `/ai/sessions`
- `POST /ai/actions/:id/execute|cancel`
- WebSocket event `ai.response` on `/notifications` namespace

## Notes

- Idempotency: client sends `clientMessageId` to avoid duplicate messages on retry.
- Finance context unlocks finance-specific tool calling on the backend.
