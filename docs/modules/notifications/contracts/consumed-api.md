# Notifications — contrato HTTP/WS (consumo)

Dueño: `personal-os-back/docs/modules/notifications/`.

| Cliente                                   | Backend                                 |
| ----------------------------------------- | --------------------------------------- |
| `GET /notifications`                      | lista `{ items, pagination }`           |
| `GET /notifications/unread-count`         | `{ count }`                             |
| `PATCH /notifications/:id/read`           |                                         |
| `PATCH /notifications/read-all`           |                                         |
| `POST /notifications/push-tokens`         | `platform: web` + JSON PushSubscription |
| `PATCH .../push-tokens/:token/deactivate` |                                         |
| WS `notification.new`                     | room `user:{sub}`                       |

Query keys: `NOTIFICATIONS_QUERY_KEY`, `NOTIFICATIONS_UNREAD_QUERY_KEY` (`['notifications','list']`, `['notifications','unread-count']`).

`useNotifications` usa `useInfiniteQuery`: `page` inicia en 1, `limit` 20, y `getNextPageParam` avanza con `pagination.totalPages`.
