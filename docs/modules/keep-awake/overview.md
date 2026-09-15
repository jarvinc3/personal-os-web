# Keep Awake — overview

Utilidad **solo cliente**: Wake Lock API + Document Picture-in-Picture opcional. Sin endpoints ni tablas. Persistencia `localStorage` + `BroadcastChannel` (`personal-os-keep-awake`).

Ruta `/keep-awake` protegida. El lock vive en `KeepAwakeProvider` (`app/(app)/layout.tsx`): navegar a Home/Finanzas **no** lo suelta. Se suelta al unmount del layout, pausa/fin, u otra tab reclamando ownership.

No es slug de `MODULE_REGISTRY` / backend.

Código: `src/modules/keep-awake/`. Tests: 8 specs en `lib/`.
