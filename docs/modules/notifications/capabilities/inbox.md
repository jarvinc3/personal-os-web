# Capacidad: inbox

## Flujo

1. `useNotifications` lista paginada IN_APP.
2. `groupNotificationsByDate` agrupa la UI.
3. Tap fila → `PATCH /notifications/:id/read`.
4. Menú header → marcar todas / abrir prefs (canales + quiet hours sheet).
5. Si `channels.inApp=false`, el backend devuelve lista vacía; el socket **no** se conecta (`useNotificationsSocket` exige `isInAppEnabled`).

## Header

`variant: secondary` (back, sin campana duplicada).

## Criterios

- `AC-NTF-W-001` — Given IN_APP on, When llega `notification.new` y pathname no es `/notifications`, Then toast + invalidate list/unread.
- `AC-NTF-W-002` — Given ya en `/notifications`, When `notification.new`, Then invalidate **sin** toast (evita duplicar).

Evidencia: `notifications-client.tsx`, `use-notifications-socket.ts`, `group-notifications-by-date.ts`.
