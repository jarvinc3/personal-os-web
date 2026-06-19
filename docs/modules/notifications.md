# Notifications Module (App)

## Scope

In-app notification inbox, read/unread state, push token registration, preference toggles, and realtime delivery via WebSocket.

## Navigation

Route group: `app/(app)/notifications`

| Screen   | Path                     | Purpose                               |
| -------- | ------------------------ | ------------------------------------- |
| Inbox    | `notifications/index`    | Grouped list by date, mark read       |
| Settings | `notifications/settings` | Channel and module notification prefs |

Accessible from the header `NotificationBell` (hidden from drawer).

## Data layer

| Hook / lib                    | Purpose                                |
| ----------------------------- | -------------------------------------- |
| `useNotifications`            | Paginated IN_APP notification list     |
| `useMarkNotificationRead`     | Mark single notification read          |
| `useMarkAllNotificationsRead` | Mark all IN_APP as read                |
| `useNotificationPreferences`  | Read/write `preferences.notifications` |
| `useModuleNotificationPrefs`  | Per-module notification keys           |
| `useNotificationsSocket`      | Realtime `notification.new` events     |
| `usePushTokenStatus`          | Expo push token registration state     |
| `useCreateTestNotification`   | Dev helper from Home screen            |

## UI components

- `NotificationRow` — single notification item with read state
- `NotificationPreferencesPanel` / `NotificationPreferencesSheet` — channel toggles
- `showInAppNotificationToast` — foreground toast on new notification
- `groupNotificationsByDate` — SectionList grouping helper
- `notification-visual.ts` — icon/color mapping by notification type

## Push tokens

On login, the app registers an Expo push token via `POST /notifications/push-tokens`. Logout deactivates the token.

Push delivery respects:

- Global channel toggles (`push`, `email`, `inApp`)
- Quiet hours (suppresses push/email, not in-app)
- Per-module notification keys in notification payload

## Backend contract

- `GET /notifications`, `GET /notifications/unread-count`
- `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- `POST /notifications/push-tokens`
- WebSocket: `notification.new` on room `user:{sub}`

## Notes

- Home screen includes dev utilities: test notification creation and push token status display.
- Finance-related notification types (budget alerts, transaction detected) are defined in project guide but depend on backend triggers.
