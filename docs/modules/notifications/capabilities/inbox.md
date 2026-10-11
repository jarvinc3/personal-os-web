# Capacidad: inbox

## Flujo

1. `useNotifications` lista paginada IN_APP con scroll incremental (`page`/`limit`, `Cargar más`).
2. Tabs cliente `Todas` / `No leídas` sobre lo ya cargado.
3. `groupNotificationsByDate` agrupa la UI; filas esqueleto en la primera carga.
4. Ícono y color: categoría del movimiento (`data.categoryIcon` / `data.categoryColor`) con respaldo al módulo.
5. Tap fila → `PATCH /notifications/:id/read`; si `data.transactionId`, abre `TransactionDetailSheet`.
6. Menú header → marcar todas / abrir prefs (canales + quiet hours sheet).
7. Si `channels.inApp=false`, el backend devuelve lista vacía; el socket **no** se conecta (`useNotificationsSocket` exige `isInAppEnabled`).

## Header

`variant: secondary` (back, sin campana duplicada).

## Criterios

- `AC-NTF-W-001` — Given IN_APP on, When llega `notification.new` y pathname no es `/notifications`, Then toast + invalidate list/unread.
- `AC-NTF-W-002` — Given ya en `/notifications`, When `notification.new`, Then invalidate **sin** toast (evita duplicar).

Evidencia: `notifications-screen.tsx`, `notification-row.tsx`, `notification-list-skeleton.tsx`, `use-notifications.ts`, `notification-visual.ts`, `group-notifications-by-date.ts`.
