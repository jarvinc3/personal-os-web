# Web Push

1. Gesto **Activar en el navegador** (`useWebPushPermissions`).
2. Permission + `public/sw.js` subscribe con `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
3. JSON `PushSubscription` → `POST /notifications/push-tokens` `platform: web`.
4. Logout o canal push off → deactivate + quitar subscription local.

Foreground: socket + toast. Background: SW system notification.

Requisitos: HTTPS (localhost ok), VAPID matching backend, Chrome/Firefox/Edge; Safari limitado.

Evidencia: `src/modules/notifications/`, `public/sw.js`.

> [!WARNING]
> **REV-WEB-004** (`CONTEXTO_NO_APLICABLE`) — runbooks antiguos describían `ExponentPushToken` y Expo Go. Este cliente usa Web Push. [review-register.md](../review-register.md#rev-web-004)
