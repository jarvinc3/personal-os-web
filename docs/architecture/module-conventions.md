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
7. Un módulo **hoja** sigue el UX de Keep Awake (hero + sheets). Un módulo **con secciones** sigue Finanzas (rutas + tab bar). No mezclar: tabs locales no sustituyen ni a las rutas ni al hero.

## Tipos (`src/shared/types/module-nav.ts`)

```ts
ModuleNavItem = {
  label, href, icon,
  matchExact?: boolean,          // Resumen de Finanzas: true (no activo en hijos)
  extraActiveHrefs?: string[],   // Productos también activo en categories y Correos
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
3. Cada `app/(app)/<slug>/**/page.tsx` monta la screen por ruta directa; la screen compone con ese layout (o un layout de ruta).
4. Cablear `ModuleAppNav` en `src/shared/components/layout/app-sidebar.tsx` bajo **Aplicaciones**.
5. Añadir el prefijo de ruta a `proxy.ts` (`isProtectedAppPath`) y a `APP_ROUTES`.
6. Título: o bien `PAGE_TITLES` / `startsWith` en `app-header.tsx`, o `usePageHeader` en la página.
7. Documentar en `docs/modules/<slug>/` y listar en `docs/modules/README.md`.

Hoy el único `ModuleAppNav` cableado es `FINANCE_APP_NAV`.

## Chrome: dos superficies

| Superficie      | Dónde                                    | Comportamiento                                                                                                                                                            |
| --------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sidebar desktop | `AppSidebar`                             | Módulo con `items`: collapsible; hijos siempre visibles en el menú (incluye `showInTabBar: false`). Sidebar colapsado: dropdown a la derecha con **todas** las secciones. |
| Tab bar móvil   | `ModuleTabBar` vía `ModuleSectionLayout` | `md:hidden`, fijo abajo, siempre visible (no se oculta al scroll). Filtra `showInTabBar === false`.                                                                       |

Regla de activo: `isModuleSectionActive(item, pathname)` — href (+ hijos si no `matchExact`) o `extraActiveHrefs`.

Finanzas (VERIFICADO runtime 2026-09-15):

| Ítem               | Tab bar | Sidebar | `matchExact` / extra                            |
| ------------------ | ------- | ------- | ----------------------------------------------- |
| Resumen `/finance` | sí      | sí      | `matchExact: true`                              |
| Movimientos        | sí      | sí      |                                                 |
| Estadísticas       | **no**  | sí      | `showInTabBar: false`                           |
| Planificación      | sí      | sí      | presupuestos viven aquí                         |
| Productos          | sí      | sí      | `extraActiveHrefs`: categories, `/finance/sync` |

Sync **no** es ítem de nav; queda bajo Productos.

## Header

`usePageHeader(config)` escribe en `HeaderProvider`.

| `variant`           | Efecto                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| `primary` (default) | Trigger sidebar + campana + menú usuario                                                                   |
| `secondary`         | Back (`onBack`); oculta trigger/campana/menú **y** el tab bar (`ModuleSectionLayout` lee `config.variant`) |

Usos `secondary`: detalle institución/cash, categorías, Correos, inbox de notificaciones, (chat configura header propio).

## Layouts

| Módulo               | Layout                                   | Tab bar       |
| -------------------- | ---------------------------------------- | ------------- |
| Finance              | `FinanceLayout` → `ModuleSectionLayout`  | sí (filtrado) |
| Keep Awake           | `KeepAwakeLayout` (max-width, padding)   | no            |
| Home / Settings      | padding local en la página               | no            |
| Chat / Notifications | página propia; notifications `secondary` | no            |

`KeepAwakeProvider` está en `app/(app)/layout.tsx`: el lock **sobrevive** la navegación entre módulos autenticados.

## Módulo hoja (UX)

Referencia `VERIFICADO` 2026-09-18: [`keep-awake-screen.tsx`](../../src/modules/keep-awake/keep-awake-screen.tsx) + [capabilities/session.md](../modules/keep-awake/capabilities/session.md). Controles: [ui-components.md](./ui-components.md).

La pantalla **es** la acción (Keep Awake, un timer, un recorder). No es un contenedor de mini-apps. Finanzas (`/finance/movimientos`) no usa este molde.

| Superficie               | Qué va ahí                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Hero                     | Un estado, un número, la CTA. Centrado, `max-w-lg`.                                                                           |
| Chrome                   | Iconos izq/der que abren sheets (recordatorio, historial, ayuda). Sin tabs locales.                                           |
| `BottomSheet` default    | Edición secundaria. Borrador; **Guardar** / **Aceptar** confirma, **Cerrar** descarta, **Quitar** / **Limpiar** es explícito. |
| `BottomSheet` `floating` | Evento: llegó la hora, terminó, falló. Poco texto, visual fuerte.                                                             |
| Popover                  | Un ajuste puntual (p. ej. duración), no un flujo entero.                                                                      |
| Página                   | Chip / punto / badge si hay algo activo. El usuario no abre el sheet para enterarse.                                          |

La screen **compone** (toolbar, hero, acciones, sheets) y habla con el contexto. Extraer un componente cuando tiene trabajo propio (ruedas, prompt con timers). No extraer un panel que solo reenvía props.

Copy: labels y estado, no manuales bajo cada control. Ayuda vive en su sheet.

**Prohibido en una hoja:** `Tabs*` locales; autosave sin Guardar; panel-puente; `<input type="date|time">`.

## Papeles de archivo y frontera

Un módulo es una carpeta de feature, no una mini-app con capas. Sin packages por feature y sin `presentation` / `application` / `infrastructure` / `domain`. Los papeles de abajo valen en todos los módulos.

| Papel  | Archivo                            | Qué contiene                                                                          |
| ------ | ---------------------------------- | ------------------------------------------------------------------------------------- |
| Ruta   | `app/.../page.tsx`                 | `Suspense` e importa la screen. Nada de UI, fetching ni reglas.                       |
| Screen | `<nombre>-screen.tsx`              | Exporta `<Nombre>Screen`. Cero hooks. Monta el cuerpo y, si existe el corte, el gate. |
| Cuerpo | el mismo archivo, sin exportar     | `<Nombre>ScreenBody`. Header, navegación y datos de esa ruta.                         |
| UI     | kebab-case del bloque              | Un bloque visual. Recibe datos ya preparados o llama un hook de su feature.           |
| Regla  | `<nombre>.ts` + `<nombre>.spec.ts` | Zod, payloads, agrupaciones, dinero, fechas. Sin JSX.                                 |

El cuerpo existe para que el gate pueda devolver carga o “módulo apagado” sin ejecutar los hooks de la pantalla. No renombrar el papel a `Client`, `View` ni `Catalog`.

```text
src/modules/<slug>/
  index.ts                 # API pública del feature (incluye las screens)
  <nombre>-screen.tsx      # ruta montada desde app/; cero hooks
  components/              # bloques visuales (kebab-case)
  hooks/
  <nombre>.ts + .spec.ts   # reglas, schemas, dinero, fechas
  constants/               # nav, sheet keys, routes locales
  types/
  context/                 # solo si el estado es de shell (keep-awake)
```

### Nombres

- kebab-case en archivos. Sin repetir el nombre del módulo dentro de su carpeta: `categories-screen.tsx` dentro de finance, no `finance-categories.tsx`.
- El export coincide con el archivo: `categories-screen.tsx` exporta `CategoriesScreen`.

### Qué puede vivir en un `.tsx`

- Header, atrás, gate y qué query disparar.
- Estado local de un control (sheet abierto, tab, drag).
- Componer componentes.

Schemas Zod, armado del body del API, agrupación, orden, dinero y fechas van en un `.ts` con spec (`node --test` sobre `*.spec.ts`). Un schema dentro de un client component no entra ahí. Un helper que solo usa ese componente puede quedarse en el `.tsx`.

### Gate y header

Un gate solo si el cuerpo no debe montarse hasta tener sesión o hasta que el módulo esté encendido. Ahí hay un solo nombre: `FinanceGate`, `SettingsGate`, `KeepAwakeGate` y el equivalente donde ese corte ya existe hoy. Login no gana un gate vacío. Home sigue el shell autenticado de `app/(app)` si ese shell ya impide montar el cuerpo.

El cuerpo declara el header con `usePageHeader` (ver [Header](#header)). El layout no vuelve a inferir “vista secundaria” leyendo el pathname. El objeto `{ currency, showCents, compactNumbers }` se arma en un solo hook de finance y lo consumen las screens.

### Capabilities (solo Finanzas)

Cada capability tiene sus components, hooks, reglas, types y screens. La screen de un detalle vive en su capability, no en un cajón `pages/` ni como `*-view.tsx` suelto bajo `components/`: **cuentas, tarjetas, catálogo, movimientos, planificación, préstamos, cobros, metas de ahorro, presupuestos, sync, dashboard**. Cada capability exporta su API en su `index.ts`; otra capability la importa solo desde ahí. Un símbolo agnóstico vive en `finance/shared/` de este módulo, no en `src/shared/`. Auth, settings, notifications, ai, keep-awake y home no se parten en capabilities.

### Frontera

Cada `index.ts` exporta solo la API pública que no es pantalla: hooks, tipos, componentes chicos y constantes. Nunca screens, páginas ni formularios pesados. Las páginas de `app/**` importan las screens por ruta directa —quedan exentas de la frontera— para no compilar las demás rutas del módulo. Dentro de `src/modules`, un módulo importa de otro solo su `index.ts`, salvo los genéricos de settings listados en `eslint.config.mjs` (`hooks`, `types`, `lib`, `constants`, `components/layout`, `components/profile-ui`, `settings-gate`), que se pueden tomar por ruta directa. En Finanzas, cada capability exporta su API en su `index.ts`; dentro de una capability los archivos se importan entre sí y otra capability la importa solo desde su `index.ts`, y puede importar `finance/shared`. ESLint aplica la frontera y la excepción de settings. `src/shared` no importa features; el nav del sidebar se registra desde la composición de la app.

Un archivo se borra cuando la screen nueva lo reemplaza y ningún import lo usa.

## Settings vs módulo de producto

`MODULE_REGISTRY` lista slugs backend (`finance`, `agenda`, `projects`, `health`). Un módulo sin pantallas de producto no declara `ModuleAppNav`: su ruta monta `ModuleComingSoon`.

| Slug                     | App routes                                    | Nav               |
| ------------------------ | --------------------------------------------- | ----------------- |
| `finance`                | `/finance/*`                                  | `FINANCE_APP_NAV` |
| agenda, projects, health | `/agenda`, `/projects`, `/health` (en camino) | solo Settings     |

Keep Awake y Home **no** son slugs de `MODULE_REGISTRY`.

## Fuera de alcance de estas convenciones

- Inventar tab bar para un módulo de una sola pantalla.
- Usar `Tabs*` locales en un módulo hoja (Keep Awake es el molde: hero + sheets).
- Duplicar `ModuleTabBar` dentro del feature.
- Inventar una constante `APP_ROUTES` sin `page.tsx` (los presupuestos de finance viven en `/finance/planning`).

## PR checklist (módulo nuevo)

- [ ] Rutas en `APP_ROUTES` + `proxy.ts`.
- [ ] Páginas bajo `app/(app)/` montan la screen del módulo por ruta directa.
- [ ] Con secciones: `ModuleAppNav` + `ModuleSectionLayout`; sin copiar tab bar de finance.
- [ ] Hoja: sin `items`; fila sidebar.
- [ ] Header vía shell / `usePageHeader`; sin título duplicado en el body.
- [ ] Título en `app-header.tsx` o header hook.
- [ ] Docs en `docs/modules/<slug>/` siguiendo [_templates/module](../_templates/module/README.md).
- [ ] Specs de match de nav si hay `extraActiveHrefs` / `matchExact`.

Hoja (además):

- [ ] Un hero (estado + número/CTA); secundario en `BottomSheet`, no en `Tabs*`.
- [ ] Edición = borrador hasta Guardar/Aceptar; Cerrar descarta.
- [ ] Estado activo visible en la página (chip, punto, badge).
- [ ] Eventos en `BottomSheet` `floating`.
- [ ] La screen compone; sin panel que solo reenvía props.

## Evidencia

- Tipos: `src/shared/types/module-nav.ts`
- Match: `src/shared/lib/module-nav-active.ts` + `module-nav-active.spec.ts`
- Layout: `module-section-layout.tsx`, `module-tab-bar.tsx`, `app-sidebar.tsx`, `app-header.tsx`
- Finance: `src/modules/finance/constants/nav.ts`, `components/layout/finance-layout.tsx`
- Keep Awake (hoja): `KeepAwakeLayout`, `src/modules/keep-awake/keep-awake-screen.tsx`
- Shell autenticado: `app/(app)/layout.tsx`
- Placeholder: `src/shared/components/layout/module-coming-soon.tsx`
