# Notifications — reglas de cliente

Dominio quiet hours: backend `BR-NTF-001` (suprime PUSH/EMAIL; IN_APP sigue).

| ID             | Condición               | Resultado                                                                       | Evidencia                         |
| -------------- | ----------------------- | ------------------------------------------------------------------------------- | --------------------------------- |
| `BR-NTF-W-001` | Quiet hours activas     | El cliente **no** oculta IN_APP (`quietHoursActive` se calcula y no se consume) | `use-notification-preferences.ts` |
| `BR-NTF-W-002` | Logout o canal push off | `deactivatePushTokenIfPresent`                                                  | `use-auth.ts`, prefs inbox        |
| `BR-NTF-W-003` | Push no soportado       | `isWebPushSupported()` false                                                    | `web-push-support.ts`             |
| `BR-NTF-W-004` | Tab focused             | Foreground = socket/toast; SW no debe duplicar                                  | `public/sw.js` + socket           |
| `BR-NTF-W-005` | `channels.inApp=false`  | Socket no conecta; unread query `enabled=false`; inbox vacío                    | `use-notifications-socket.ts`     |
