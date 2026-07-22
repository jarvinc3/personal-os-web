# App Modules — Index

Documentation for each functional area of the React Native client (`personal-os-app`).

| Module        | Doc file           | Route(s)              | Backend module   |
| ------------- | ------------------ | --------------------- | ---------------- |
| Auth          | `auth.md`          | `(auth)/*`            | `auth`, Supabase |
| Settings      | `settings.md`      | `(app)/settings`      | `users`          |
| AI Agent      | `ai.md`            | `(app)/chat`          | `ai-agent`       |
| Notifications | `notifications.md` | `(app)/notifications` | `notifications`  |
| Keep Awake    | `keep-awake.md`    | `(app)/keep-awake`    | — (client-only)  |
| Finance       | `finance.md`       | `(app)/finance/*`     | `finance`        |

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
