# App assets

Iconografía neumórfica de Personal OS (módulos: finanzas, calendario, tareas, salud, etc.).

## Uso en `app.json` / nativo (Expo prebuild)

| Archivo             | Tamaño    | Rol                                                                                          |
| ------------------- | --------- | -------------------------------------------------------------------------------------------- |
| `icon.png`          | 1024×1024 | Icono principal de la app (iOS, Android legacy, referencia Expo). Copia de `icon-light.png`. |
| `icon-512x512.png`  | 512×512   | Primer plano del **adaptive icon** de Android (`android.adaptiveIcon.foregroundImage`).      |
| `splash.png`        | 1254×1254 | Imagen del splash (`splash.image`, `resizeMode: contain`).                                   |
| `favicon-96x96.png` | 96×96     | Favicon web (`web.favicon`).                                                                 |
| `favicon.ico`       | —         | Favicon alternativo para navegadores legacy (no referenciado en `app.json`).                 |

## Variantes de tema (UI en la app)

| Archivo          | Tamaño    | Rol                                                                         |
| ---------------- | --------- | --------------------------------------------------------------------------- |
| `icon-light.png` | 1024×1024 | Icono claro — drawer, pantalla de auth (`getAppIconSource` en modo light).  |
| `icon-dark.png`  | 1254×1254 | Icono oscuro — mismo arte en gris oscuro (`getAppIconSource` en modo dark). |

## Web / PWA (export estático)

| Archivo                | Tamaño  | Rol                                                  |
| ---------------------- | ------- | ---------------------------------------------------- |
| `apple-touch-icon.png` | 180×180 | “Añadir a pantalla de inicio” en iOS Safari.         |
| `icon-192x192.png`     | 192×192 | Manifest PWA / Android web (si se configura aparte). |
| `favicon.svg`          | vector  | Fuente escalable; no usada por Expo por defecto.     |

## Otros / no usados en `app.json`

| Archivo       | Notas                                                                                  |
| ------------- | -------------------------------------------------------------------------------------- |
| `icon-x2.png` | Export grande (~1254px) con fondo oscuro; reserva o marketing. No enlazar en prebuild. |
| `images/*`    | Ilustraciones de bienvenida y banners; solo UI, no iconos de sistema.                  |

## Reglas Expo

- Icono de tienda: **1024×1024** PNG → `icon.png` (desde `icon-light.png`).
- Adaptive Android: logo en zona segura; fondo `#141414` en `app.json` → `icon-512x512.png`.
- Tras cambiar iconos aquí, ejecutar `npx expo prebuild` (o actualizar carpetas `android/`/`ios/` a mano).
