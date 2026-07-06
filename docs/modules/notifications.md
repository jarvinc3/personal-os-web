# Notifications Module (Web)

## Scope

In-app notification inbox, read/unread state, Web Push subscription, preference toggles, and realtime delivery via WebSocket.

## Navigation

| Screen   | Path             | Purpose                                   |
| -------- | ---------------- | ----------------------------------------- |
| Inbox    | `/notifications` | Grouped list by date, mark read           |
| Settings | `/settings`      | Channel toggles + browser push permission |

Accessible from the header `NotificationBell`.

## Data layer

| Hook / lib                    | Purpose                                |
| ----------------------------- | -------------------------------------- |
| `useNotifications`            | Paginated IN_APP notification list     |
| `useMarkNotificationRead`     | Mark single notification read          |
| `useMarkAllNotificationsRead` | Mark all IN_APP as read                |
| `useNotificationPreferences`  | Read `preferences.notifications`       |
| `useNotificationsSocket`      | Realtime `notification.new` events     |
| `usePushToken`                | Auto-register Web Push when permitted  |
| `useWebPushPermissions`       | Browser permission + manual activation |
| `usePushTokenStatus`          | Push registration state for UI/debug   |

## UI components

- `NotificationRow` — single notification item with read state
- `NotificationsClient` + preferences sheet — channel toggles
- `DevicePushSettingsRow` — browser permission activation row
- `showInAppNotificationToast` — foreground toast on new notification
- `groupNotificationsByDate` — date grouping helper
- `notification-visual.ts` — icon/color mapping by notification type

## Web Push

1. User taps **Activar en el navegador** (requires user gesture).
2. Browser requests notification permission.
3. Service worker (`public/sw.js`) registers and subscribes with VAPID public key.
4. Full `PushSubscription` JSON is sent to `POST /notifications/push-tokens` with `platform: web`.
5. On logout or when push channel is disabled, token is deactivated and local subscription is removed.

Foreground vs background:

- **Background / tab inactive:** service worker shows a system notification.
- **Foreground / focused tab:** socket + in-app toast only (SW suppresses duplicate system notification).

Requirements:

- HTTPS (localhost exempted for development)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in web env; matching VAPID keys in backend
- Compatible browsers: Chrome, Firefox, Edge; Safari with limitations

## Backend contract

- `GET /notifications`, `GET /notifications/unread-count`
- `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- `POST /notifications/push-tokens` (`platform: web | ios | android`)
- `PATCH /notifications/push-tokens/:token/deactivate`
- WebSocket: `notification.new` on room `user:{sub}`

Push delivery respects:

- Global channel toggles (`push`, `email`, `inApp`)
- Quiet hours (suppresses push/email, not in-app)
- Per-module notification keys in notification payload

## Notes

- Finance-related notification types depend on backend triggers.
- Invalid web subscriptions (HTTP 410/404) are deactivated automatically by the backend.
