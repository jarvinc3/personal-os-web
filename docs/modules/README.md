# App Modules — Index

Documentation for each functional area of **personal-os-web**. Some files still describe the React Native client (`personal-os-app`); prefer the backend docs when the web UI is not built yet.

| Module        | Doc file           | Route(s)                                    | Backend module              |
| ------------- | ------------------ | --------------------------------------------| ----------------------------|
| Auth          | `auth.md`          | `/login`, `/verify-email`, `/auth/callback` | `auth`, Supabase            |
| Settings      | `settings.md`      | `/settings`                                 | `users`                     |
| AI Agent      | `ai.md`            | `/chat`                                     | `ai-agent`                  |
| Notifications | `notifications.md` | `/notifications`                            | `notifications`             |
| Keep Awake    | `keep-awake.md`    | `/keep-awake`                               | — (client-only)             |
| Finance       | `finance.md`       | `/finance` (shell; hijos aún no)            | `finance`                   |

## Planned modules (settings UI only)

These have config sheets in Settings but no dedicated app routes yet:

- Agenda (`EditAgendaSheet`)
- Projects (`EditProjectsSheet`)
- Health (`EditHealthSheet`)
- Subscriptions (`EditSubscriptionsSheet`)

## Cross-cutting docs

- `project-guide.md` — architecture and data model
- `core-contracts.md` — API envelope and shared types
- `core-infra-status.md` — client infrastructure status
- `core-runbook.md` — local dev and troubleshooting
- `supabase-auth-checklist.md` — auth setup verification

## Backend references

- Module endpoints: `personal-os-back/docs/modules/`
- AI tools per context: `personal-os-back/docs/ai-tools/`
