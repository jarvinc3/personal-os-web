# Notifications — overview

## Propósito

Inbox in-app, badge, toasts en foreground, Web Push en background, preferencias de canal.

## Alcance

- Ruta `/notifications` (header `secondary`).
- Campana en `AppHeader` (`GET /notifications/unread-count`).
- Socket `notification.new` (namespace `/notifications`).
- Web Push: [../../infrastructure/web-push.md](../../infrastructure/web-push.md).
- Toggles de canal también en Settings.

## Fuera de alcance

- Crear notificaciones de dominio (eso es backend listeners).
- FCM/APNs nativo: [personal-os-back#137](https://github.com/jarvinc3/personal-os-back/issues/137).

## Autenticado

`useAuthGuard` en el client. Socket y push viven en `AppEffectsProvider` (todas las rutas `(app)`).
