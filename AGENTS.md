# AGENTS.md — personal-os-web

Instrucciones para agentes y reviewers que trabajan en el cliente web de Personal OS.

## Orden de lectura

1. Este archivo.
2. [docs/README.md](docs/README.md) — mapa del repositorio.
3. [docs/documentation-standard.md](docs/documentation-standard.md).
4. El módulo bajo `docs/modules/` o la arquitectura en `docs/architecture/`.
5. Código y pruebas citados. No inferir desde nombres.

Si una afirmación no está `VERIFICADO`, leer [docs/review-register.md](docs/review-register.md) antes de tratarla como comportamiento vigente.

## Fuentes canónicas

| Tema | Dónde |
| --- | --- |
| Rutas, UX, estado, navegador, consumo de API | este repositorio |
| Dominio, REST, ledger, eventos, Prisma | `personal-os-back` |
| Rutas de app | `src/shared/constants/app-routes.ts` + `app/` |
| Endpoints HTTP usados por el cliente | `src/shared/constants/api-endpoints.ts` |
| Defaults de preferencias | `src/modules/settings/constants/user-settings-defaults.ts` |
| Chrome de módulo | [docs/architecture/module-conventions.md](docs/architecture/module-conventions.md) |
| Sesión / 401 / proxy | [docs/modules/auth/](docs/modules/auth/README.md) + [docs/infrastructure/auth-session.md](docs/infrastructure/auth-session.md) |

Este cliente es **Next.js 16**, no React Native. Instrucciones Expo/Metro/EAS no aplican aquí (ver registro).

## Checklist al cambiar comportamiento

- [ ] Actualizar el documento dueño (capacidad, contrato UI o arquitectura).
- [ ] Enlazar al backend cuando el contrato sea de dominio/API; no copiar tablas Prisma.
- [ ] `agenda` / `projects` / `health` / `subscriptions` solo tienen sheets en Settings hasta que existan rutas en `app/`.
- [ ] Keep Awake es client-only: no inventar endpoints.
- [ ] Si el runtime contradice el doc, registrar `CONTRADICE_RUNTIME`.

## Estructura de código

```text
app/                 # App Router
src/modules/         # auth, settings, notifications, ai, finance, keep-awake, home, landing
src/shared/          # chrome, rutas, registry
src/providers/
src/config/          # api-client, supabase
proxy.ts
```
