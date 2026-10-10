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

| Tema                                         | Dónde                                                                                                                                                                         |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rutas, UX, estado, navegador, consumo de API | este repositorio                                                                                                                                                              |
| Dominio, REST, ledger, eventos, Prisma       | `personal-os-back`                                                                                                                                                            |
| Rutas de app                                 | `src/shared/constants/app-routes.ts` + `app/`                                                                                                                                 |
| Endpoints HTTP usados por el cliente         | `src/shared/constants/api-endpoints.ts`                                                                                                                                       |
| Defaults de preferencias                     | `src/modules/settings/constants/user-settings-defaults.ts`                                                                                                                    |
| Chrome de módulo                             | [docs/architecture/module-conventions.md](docs/architecture/module-conventions.md) — hoja (Keep Awake: hero + sheets) vs secciones (Finanzas: rutas + tab bar)                |
| Fecha/hora y UI compartida                   | [docs/architecture/ui-components.md](docs/architecture/ui-components.md) — `TimePairWheels` / `DurationWheels` / `DateWheels`, no inputs nativos; `BottomSheet` vs `floating` |
| Reglas de UI obligatorias                    | [`.cursor/rules/`](.cursor/rules) — una regla por archivo `.mdc`; se leen antes de crear o cambiar un control                                                                 |
| Sesión / 401 / proxy                         | [docs/modules/auth/](docs/modules/auth/README.md) + [docs/infrastructure/auth-session.md](docs/infrastructure/auth-session.md)                                                |

Este cliente es **Next.js 16**, no React Native. Instrucciones Expo/Metro/EAS no aplican aquí (ver registro).

## Reglas de UI

Viven en [`.cursor/rules/`](.cursor/rules), una regla por archivo `.mdc`. Rigen para cualquier agente, no solo Cursor: se leen antes de crear o cambiar un control.

```yaml
---
description: One line, in English, with what the rule demands.
globs: "**/*.{ts,tsx}" # solo si la regla aplica a archivos concretos
alwaysApply: true # si la regla no debe perderse nunca
---
```

El cuerpo va en español: la regla, el caso que la rompe y un ejemplo corto. `description` en inglés, como los archivos que ya están.

Si la regla se puede detectar en el código, agrega además la prohibición en [eslint.config.mjs](eslint.config.mjs). Una regla en prosa se ignora sin que nada avise.

## Skills

Viven en [`.agents/skills/`](.agents/skills). Abre solo el `SKILL.md` cuyo disparador coincida con el cambio. No leas la carpeta entera. Si una skill contradice [`.cursor/rules/`](.cursor/rules) o [docs/architecture/ui-components.md](docs/architecture/ui-components.md), manda la regla de este repo.

| Skill | Ábrela cuando |
| --- | --- |
| `shadcn`, `tailwind-v4-shadcn`, `tailwind-css-patterns` | tocas `src/shared/components/ui` o estilos |
| `react-hook-form`, `zod` | tocas un formulario o un schema |
| `react-best-practices`, `composition-patterns` | partes o escribes un componente |
| `accessibility` | creas un control |
| `next-best-practices` | tocas `app/` |
| `seo` | tocas metadata o la landing |
| `next-upgrade` | el trabajo es subir Next |
| `next-cache-components` | el trabajo es `use cache` o PPR |
| `migrate-radix-to-base` | se pide migrar de Radix a Base UI |

`frontend-design` y `typescript-advanced-types` están en la carpeta y no se abren para el trabajo de este cliente.

## Checklist al cambiar comportamiento

- [ ] Actualizar el documento dueño (capacidad, contrato UI o arquitectura).
- [ ] Enlazar al backend cuando el contrato sea de dominio/API; no copiar tablas Prisma.
- [ ] `agenda` / `projects` / `health` / `subscriptions` solo tienen sheets en Settings hasta que existan rutas en `app/`.
- [ ] Keep Awake es client-only: no inventar endpoints.
- [ ] Si tocaste UI, leíste [`.cursor/rules/`](.cursor/rules) y cumples cada regla.
- [ ] Si el cambio coincide con un disparador de Skills, leíste ese `SKILL.md`.
- [ ] Si el runtime contradice el doc, registrar `CONTRADICE_RUNTIME`.

## Estructura de código

Un solo app Next.js. Sin packages por feature y sin capas `presentation` / `application` / `infrastructure` / `domain`. `app/` solo compone rutas; cada feature vive en `src/modules/<slug>/` y otro módulo importa solo su `index.ts`.

```text
app/                 # rutas delgadas: Suspense + screen del index.ts del módulo
src/modules/         # auth, settings, notifications, ai, finance, keep-awake, home, landing
src/shared/          # chrome, rutas, api-endpoints, primitivos de UI; no importa features
src/providers/
src/config/          # api-client, supabase
proxy.ts             # refresh de sesión + guards de rutas
```

### Papeles de un archivo

Valen en todos los módulos. Detalle y checklist: [docs/architecture/module-conventions.md](docs/architecture/module-conventions.md).

| Papel | Archivo | Qué contiene |
| --- | --- | --- |
| Ruta | `app/.../page.tsx` | `Suspense` e importa la screen. Nada de UI, fetching ni reglas. |
| Screen | `<nombre>-screen.tsx` | Exporta `<Nombre>Screen`. Cero hooks. Monta el cuerpo y, si existe el corte, el gate. |
| Cuerpo | el mismo archivo, sin exportar | `<Nombre>ScreenBody`. Header, navegación y datos de esa ruta. |
| UI | kebab-case del bloque | Un bloque visual. Recibe datos ya preparados o llama un hook de su feature. |
| Regla | `<nombre>.ts` + `<nombre>.spec.ts` | Zod, payloads, agrupaciones, dinero, fechas. Sin JSX. |

El cuerpo existe para que el gate pueda devolver carga o “módulo apagado” sin ejecutar los hooks de la pantalla. Consérvalo. No lo renombres `Client`, `View` ni `Catalog`.

### Nombres

- kebab-case en archivos. Sin repetir el nombre del módulo dentro de su carpeta: `categories-screen.tsx` dentro de finance, no `finance-categories.tsx`.
- El export coincide con el archivo: `categories-screen.tsx` exporta `CategoriesScreen`. Landing en PascalCase entra en la misma regla.

### Qué puede vivir en un `.tsx`

- Header, atrás, gate y qué query disparar.
- Estado local de un control (sheet abierto, tab, drag).
- Componer componentes.

Schemas Zod, armado del body del API, agrupación, orden, dinero y fechas van en un `.ts` con `*.spec.ts` (`node --test`). Un helper que solo usa ese componente puede quedarse en el `.tsx`.

### Gate y header

Un gate solo si el cuerpo no debe montarse hasta tener sesión o hasta que el módulo esté encendido. Ahí hay un solo nombre: `FinanceGate`, `SettingsGate`, `KeepAwakeGate` y el equivalente donde ese corte ya existe hoy. Landing y login no ganan un gate vacío. Home sigue el shell autenticado de `app/(app)`.

El cuerpo declara el header con `usePageHeader`. El layout no vuelve a inferir “vista secundaria” leyendo el pathname. El objeto `{ currency, showCents, compactNumbers }` se arma en un solo hook de finance y lo consumen las screens.

### Capabilities (solo Finanzas)

Cada capability tiene sus components, hooks, reglas, types y screens. La screen de un detalle vive en su capability, no en un cajón `pages/` ni como `*-view.tsx` suelto bajo `components/`: cuentas, tarjetas, catálogo, movimientos, planificación, presupuestos, sync, dashboard. Un símbolo compartido por dos capabilities vive en `finance/shared/`, no en `src/shared/`. Auth, settings, notifications, ai, keep-awake, home y landing no se parten en capabilities.

### Frontera

Cada módulo exporta su API y sus screens en su `index.ts`; `app/.../page.tsx` importa la screen solo desde ahí. En Finanzas, cada capability exporta la suya y el `index.ts` del módulo reexporta lo que otros módulos pueden usar; las capabilities pueden importar `finance/shared`. ESLint `no-restricted-imports` rechaza cualquier import profundo hacia otro módulo o hacia otra capability, incluida la carpeta de la screen. El nav del sidebar se registra desde la composición de la app, no desde `src/shared`.
