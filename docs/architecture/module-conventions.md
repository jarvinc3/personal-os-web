# Convenciones de módulo (web)

House style para mini-apps en `src/modules/` + rutas en `app/(app)/`. El único módulo con secciones hoy es Finanzas; Keep Awake es una hoja. Referencia de código: `FINANCE_APP_NAV`, `FinanceLayout`, `KeepAwakeLayout`.

Equivalente backend: `personal-os-back/docs/architecture/modules.md` (capas Nest). Aquí el equivalente es **chrome + carpeta de feature**, no `presentation/application/infrastructure`.

## Principios

1. Organizar por **feature** bajo `src/modules/<slug>/`. `app/` solo monta páginas delgadas que importan el módulo.
2. Un módulo con **≥2 pantallas** declara `ModuleAppNav` (`items` = secciones) y envuelve páginas con `ModuleSectionLayout`.
3. Un módulo **hoja** (Keep Awake) no tiene `items`: fila plana en el sidebar y layout propio, sin tab bar.
4. **No** copiar un tab bar solo de finance. El chrome vive en `src/shared/components/layout/`.
5. El título de página lo pinta el **shell header** (`AppHeader` + `usePageHeader`). No duplicar un H1 hero con el mismo título.
6. Contratos de dominio/API se enlazan al backend; este repo documenta rutas, UX y consumo.

## Tipos (`src/shared/types/module-nav.ts`)

```ts
ModuleNavItem = {
  label, href, icon,
  matchExact?: boolean,          // Resumen de Finanzas: true (no activo en hijos)
  extraActiveHrefs?: string[],   // Cuentas también activo en /finance/sync*
  showInTabBar?: boolean,        // false = solo sidebar (Estadísticas)
}

ModuleAppNav = {
  slug?: ModuleSlug,             // opcional; finance usa "finance"
  rootHref, label, icon,
  items: ModuleNavItem[],
}
```

`moduleHasSections(nav)` es true si `items.length >= 1`. Evidencia: `src/shared/lib/module-nav-active.ts` + spec.

## Cómo registrar un módulo con secciones

1. Constantes de nav en el módulo (`src/modules/<slug>/constants/nav.ts`).
2. Layout del módulo que pasa a `ModuleSectionLayout` solo los ítems con `showInTabBar !== false`.
3. Cada `app/(app)/<slug>/**/page.tsx` envuelve el client con ese layout (o un layout de ruta).
4. Cablear `ModuleAppNav` en `src/shared/components/layout/app-sidebar.tsx` bajo **Aplicaciones**.
5. Añadir el prefijo de ruta a `proxy.ts` (`isProtectedAppPath`) y a `APP_ROUTES`.
6. Título: o bien `PAGE_TITLES` / `startsWith` en `app-header.tsx`, o `usePageHeader` en la página.
7. Documentar en `docs/modules/<slug>/` y listar en `docs/modules/README.md`.

Hoy el único `ModuleAppNav` cableado es `FINANCE_APP_NAV`.

## Chrome: dos superficies

| Superficie | Dónde | Comportamiento |
| --- | --- | --- |
| Sidebar desktop | `AppSidebar` | Módulo con `items`: collapsible; hijos siempre visibles en el menú (incluye `showInTabBar: false`). Sidebar colapsado: dropdown a la derecha con **todas** las secciones. |
| Tab bar móvil | `ModuleTabBar` vía `ModuleSectionLayout` | `md:hidden`, fijo abajo, se oculta al scroll (`ScrollChromeProvider`). Filtra `showInTabBar === false`. |

Regla de activo: `isModuleSectionActive(item, pathname)` — href (+ hijos si no `matchExact`) o `extraActiveHrefs`.

Finanzas (VERIFICADO runtime 2026-09-15):

| Ítem | Tab bar | Sidebar | `matchExact` / extra |
| --- | --- | --- | --- |
| Resumen `/finance` | sí | sí | `matchExact: true` |
| Movimientos | sí | sí | |
| Estadísticas | **no** | sí | `showInTabBar: false` |
| Planificación | sí | sí | presupuestos viven aquí |
| Cuentas | sí | sí | `extraActiveHrefs`: `/finance/sync`, oauth, categories |

Sync **no** es ítem de nav; queda bajo Cuentas.

## Header

`usePageHeader(config)` escribe en `HeaderProvider`.

| `variant` | Efecto |
| --- | --- |
| `primary` (default) | Trigger sidebar + campana + menú usuario |
| `secondary` | Back (`onBack`); oculta trigger/campana/menú **y** el tab bar (`ModuleSectionLayout` lee `config.variant`) |

Usos `secondary`: detalle institución/cash, categorías, inbox de notificaciones, (chat configura header propio).

## Layouts

| Módulo | Layout | Tab bar |
| --- | --- | --- |
| Finance | `FinanceLayout` → `ModuleSectionLayout` | sí (filtrado) |
| Keep Awake | `KeepAwakeLayout` (max-width, padding) | no |
| Home / Settings | padding local en la página | no |
| Chat / Notifications | página propia; notifications `secondary` | no |

`KeepAwakeProvider` está en `app/(app)/layout.tsx`: el lock **sobrevive** la navegación entre módulos autenticados.

## Carpetas típicas de un módulo web

```text
src/modules/<slug>/
  index.ts                 # barrel público del feature
  constants/               # nav, sheet keys, routes locales
  pages/                   # *client.tsx montados desde app/
  components/
  hooks/
  lib/                     # helpers + *.spec.ts
  types/
  context/                 # solo si el estado es de shell (keep-awake)
```

`app/(app)/<slug>/page.tsx` debe ser delgado (import del client). No poner reglas de negocio en `app/`.

## Settings vs módulo de producto

`MODULE_REGISTRY` lista slugs backend (`finance`, `agenda`, `projects`, `subscriptions`, `health`). Tener sheet en Ajustes **no** crea rutas ni `ModuleAppNav`.

| Slug | App routes | Nav |
| --- | --- | --- |
| `finance` | `/finance/*` | `FINANCE_APP_NAV` |
| agenda, projects, health, subscriptions | ninguna | solo Settings |

Keep Awake y Landing/Home **no** son slugs de `MODULE_REGISTRY`.

## Fuera de alcance de estas convenciones

- Inventar tab bar para un módulo de una sola pantalla.
- Duplicar `ModuleTabBar` dentro del feature.
- Tratar `APP_ROUTES.app.financeBudgets` como ruta real (404 — REV-WEB-012).

## PR checklist (módulo nuevo)

- [ ] Rutas en `APP_ROUTES` + `proxy.ts`.
- [ ] Páginas bajo `app/(app)/` montan el client del módulo.
- [ ] Con secciones: `ModuleAppNav` + `ModuleSectionLayout`; sin copiar tab bar de finance.
- [ ] Hoja: sin `items`; fila sidebar.
- [ ] Header vía shell / `usePageHeader`; sin título duplicado en el body.
- [ ] Título en `app-header.tsx` o header hook.
- [ ] Docs en `docs/modules/<slug>/` siguiendo [_templates/module](../_templates/module/README.md).
- [ ] Specs de match de nav si hay `extraActiveHrefs` / `matchExact`.

## Evidencia

- Tipos: `src/shared/types/module-nav.ts`
- Match: `src/shared/lib/module-nav-active.ts` + `module-nav-active.spec.ts`
- Layout: `module-section-layout.tsx`, `module-tab-bar.tsx`, `app-sidebar.tsx`, `app-header.tsx`
- Finance: `src/modules/finance/constants/nav.ts`, `components/layout/finance-layout.tsx`
- Shell autenticado: `app/(app)/layout.tsx`
