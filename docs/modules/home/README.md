# Home

Página de inicio post-login: saludo con nombre de perfil, atajos a notificaciones y ajustes, y las secciones de Finanzas, entrada rápida y Keep Awake. No es `ModuleAppNav`; no tiene tab bar.

## Alcance

- Ruta `/home` bajo `app/(app)`.
- `useAuthGuard` + redirect a login si no hay sesión.
- Header: subtitle `Hola,` + `fullName` (perfil o user store).

## Fuera de alcance

- Dashboard financiero (eso es `/finance`).
- Lista de notificaciones (eso es `/notifications`).

## Dependencias

`useProfile` (`GET /users/me`), `APP_ROUTES`, shell `(app)`.

## Flujo del hub

1. Guard de auth; loading → `LoadingView`.
2. Título de header = nombre.
3. Atajos: Notificaciones y Configuración; debajo, resumen mensual y semanal de Finanzas, entrada rápida y Keep Awake.

| ID           | Condición                 | Resultado                                                                                 | Evidencia                                         |
| ------------ | ------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `BR-HOM-001` | Finance `isEnabled=false` | El atajo **sigue** yendo a `/finance` (el gate del módulo muestra CTA a Settings; no 404) | `home-screen.tsx`, `useFinanceEnabled` en finance |
| `BR-HOM-002` | Nombre                    | `profile.fullName` else `user.fullName` else `"Usuario"`                                  | `home-screen.tsx`                                 |

## Criterios

- `AC-HOM-001` — Given sesión, When `/home`, Then atajos a notificaciones y ajustes, resumen de Finanzas, entrada rápida y Keep Awake. Runtime 2026-09-15: verificado.

## Evidencia

`src/modules/home/home-screen.tsx`, `app/(app)/home/page.tsx`.

Estado y trabajo pendiente: GitHub Issues del repo (`roadmap`).
