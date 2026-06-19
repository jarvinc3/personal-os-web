# Personal OS App — Core Runbook

Guía operativa para levantar el frontend (`personal-os-app`) y conectarlo al backend core.

## Requisitos

- **Node.js 20 LTS** (ver `.nvmrc` en app y backend: `nvm use` o `fnm use`)
- **pnpm**
- Cuenta **Supabase** con Auth (email + Google)
- Backend **NestJS** en `personal-os-back` corriendo

## Variables de entorno

Copiar `.env.example` → `.env` en `personal-os-app/`:

| Variable                               | Descripción                                      |
| -------------------------------------- | ------------------------------------------------ |
| `EXPO_PUBLIC_SUPABASE_URL`             | URL del proyecto Supabase                        |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key                             |
| `EXPO_PUBLIC_API_URL`                  | Base API Nest, ej. `http://192.168.1.x:3100/api` |

**Dispositivo físico:** no uses `localhost` en `EXPO_PUBLIC_API_URL`. Usa la IP LAN de tu máquina.

## Arranque — Backend

```bash
cd personal-os-back
pnpm install
pnpm start:dev
```

API por defecto con prefijo `/api` (puerto según configuración del proyecto, típicamente `3100`).

## Arranque — App

```bash
cd personal-os-app
pnpm install
pnpm dev
```

`pnpm dev` ejecuta `expo start -c` (cache limpia de Metro).

### Perfiles EAS

| Perfil        | Uso                                |
| ------------- | ---------------------------------- |
| `development` | Dev client + debugging nativo      |
| `preview`     | APK interno para QA en dispositivo |
| `production`  | Release                            |

Push remoto **no funciona en Expo Go**; requiere development build o standalone.

### Development build (push real)

```bash
cd personal-os-app
pnpm install
eas build --profile development --platform android
# o: eas build --profile development --platform ios
```

Instala el APK/IPA resultante, concede permisos de notificaciones y verifica en logs del backend que `POST /notifications/push-tokens` recibe el token Expo (`ExponentPushToken[...]`).

## Supabase Auth

1. Habilitar proveedor **Google** en Authentication → Providers.
2. Redirect URLs: incluir `personal-os://**` y URLs de Expo dev si aplica.
3. En Google Cloud Console: OAuth client con redirect de Supabase.

## Troubleshooting

### Metro crash al guardar (`addedFiles` undefined)

Causa conocida: incompatibilidad `react-native-css-interop@0.2.3` con Metro 0.83+.

- Verificar que `patches/react-native-css-interop@0.2.3.patch` esté aplicado en `pnpm-lock.yaml`.
- Reiniciar con `pnpm dev` (`expo start -c`).

### API no responde desde el teléfono

- Comprobar `EXPO_PUBLIC_API_URL` (IP LAN, no localhost).
- Backend escuchando en `0.0.0.0`, no solo `127.0.0.1`.
- Firewall permite el puerto del API.

### Sesión expirada / 401

La app emite sign-out automático vía `auth-events` cuando el API devuelve 401. Si persiste, cerrar sesión manualmente en Settings.

### Push token no se registra

- En Expo Go: comportamiento esperado (hook hace no-op).
- En dev build: conceder permisos de notificaciones en el SO.

## Referencias

- [`core-infra-status.md`](./core-infra-status.md) — estado del core
- [`core-contracts.md`](./core-contracts.md) — contratos API
- [`project-guide.md`](./project-guide.md) — arquitectura del producto
