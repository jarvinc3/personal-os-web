# Coding Guidelines

Cómo se escribe el código de este cliente Next.js. Los papeles de archivo, las capabilities y la frontera de imports viven en [AGENTS.md](AGENTS.md). La UX de producto (ruedas de fecha, sheets, confirmaciones, iconos) vive en [`.cursor/rules/`](.cursor/rules) y en [docs/architecture/ui-components.md](docs/architecture/ui-components.md).

Si este archivo contradice a `AGENTS.md` o a una regla `.mdc`, manda el repo. Aquí no se inventan capas `presentation` / `application` / `infrastructure` / `domain`, ni un port por hook.

## Referencia rápida

| Haz | No hagas |
| --- | --- |
| Salir pronto ante una entrada inválida | Anidar `if/else` en pirámide |
| Fallar con un error explícito | Encadenar fallbacks que esconden el fallo |
| Una razón para cambiar por unidad | Validar, transformar, guardar y notificar en el mismo sitio |
| Extraer al tercer uso real del mismo concepto | Abstraer al primer parecido, o un componente que solo reenvía props |
| La solución más simple para el problema de hoy | Un hook, una capa o un flag “por si acaso” |
| Componer componentes y funciones | Cadenas de herencia o un wrapper por cada prop |
| Hablar con el colaborador inmediato | Atravesar tres objetos propios para leer un campo |
| Una función hace o devuelve | Un getter que además muta o navega |
| Un schema Zod en el borde | El mismo invariante revalidado en el mapper y en el submit |
| Dejar salir el error con contexto | Un `catch` vacío o devolver `null` como si no hubiera fallado |
| Devolver un valor nuevo | Mutar el argumento que recibió el caller |
| Un significado por `null` / `undefined` | Usarlos para tres estados de negocio distintos |
| Reglas puras en `.ts`, con `*.spec.ts` | Lógica de dinero, fechas o payloads imposible de probar sin montar React |
| La regla no importa React ni `api-client` | Un `.ts` de dominio que llama a `fetch` o a un cliente HTTP |
| `"use client"` solo en la frontera | Marcar cada archivo, o convertir `page.tsx` en cliente para usar un estado |
| Calcular durante el render | Un `useEffect` que copia props o deriva otro estado |
| `useQuery` / `useMutation` | `useEffect` + `useState` para traer o guardar datos del API |
| La query key incluye cada variable que usa `queryFn` | Una key fija mientras el id o el filtro cambian |
| `apiGet` / `apiPost` / `apiDelete` de `src/config/api-client.ts` | Otro `fetch` que vuelva a abrir el envelope `{ data, meta }` |
| `<button>` para acciones, `<Link>` para navegar | Un `<div onClick>` |
| Estado compartible en la URL | Un filtro o tab que se pierde al recargar y solo vive en `useState` |

## Principios

### Guard clauses

Valida y sal pronto. El camino feliz queda al final, con la menor sangría.

```ts
function getDiscount(user: User | null): number {
  if (!user) return 0
  if (!user.isActive) return 0
  if (!user.hasSubscription) return 0
  return 0.2
}
```

### Fail fast

Una entrada inválida, un estado imposible o una dependencia rota fallan en el acto, con un error claro. Eso aplica a invariantes que no deberían ocurrir si el contrato de arriba se cumplió. No es permiso para repetir la regla de negocio que el schema ya validó.

```ts
function getShippingCost(order: Order): number {
  const zone = ZONES[order.zoneId]
  if (!zone) throw new Error(`Unknown zoneId: ${order.zoneId}`)
  return zone.baseCost
}
```

### Una responsabilidad

Una función, un componente o un hook cambia por una razón. Si valida, transforma, persiste y notifica, se parte. En este cliente el corte habitual es: el schema y el mapeo en un `.ts`, la llamada HTTP en un hook, el render en el componente.

### DRY

No copies una decisión que significa lo mismo. Extrae cuando se cumplan al menos dos de estas tres:

- La misma lógica aparece tres veces. Dos se toleran.
- Un cambio de la regla de negocio hay que aplicarlo en todos los sitios a la vez.
- Lo copiado es el mismo concepto de dominio, no código que se parece.

No extraigas:

- Dos validaciones que hoy se parecen y pertenecen a conceptos distintos.
- El molde que impone el entorno (dos hooks con la misma forma porque `useQuery` se escribe así).
- Un componente que solo recibe props y las reenvía. Eso no tiene un trabajo propio.

### KISS y YAGNI

KISS: la solución elegida se queda simple. YAGNI: no construyas el caso que nadie pidió. Un parámetro, un flag o un hook “por si más adelante” no entra hasta que hay un segundo uso real.

### Composición

Compón componentes pequeños. Heredar un componente base para colgarle comportamiento que no comparten fuerza a cada hijo a conocer detalles del padre.

Un componente de UI o llama un hook de su feature o recibe datos ya preparados. No hagas las dos cosas para el mismo dato.

### Ley de Demeter

Una unidad habla con sus colaboradores inmediatos. No atravieses tres objetos tuyos (`screen.body.list.item.label`).

Un DTO que viene del API no gana un método `getCityName()` para cumplir esta regla. Lees el campo que el contrato te dio. Si el acceso es ruidoso en varios sitios y es la misma decisión, esa decisión se vuelve una función pura con nombre.

### Command Query Separation

Una función hace algo o devuelve algo. Un handler de click o de submit ejecuta el comando. El render calcula qué se ve. No navegues, no mutes la caché y no dispares un POST durante el render.

### Errores explícitos

El error sale con contexto. Un `catch` vacío, o devolver `null` para que la pantalla siga como si nada, esconde el fallo. `queryFn` y `mutationFn` lanzan. TanStack Query pasa la query a `error` y deja `data` en el estado anterior. Quien pinta la pantalla decide el vacío, el reintento o el toast. No tragues el `ApiError` dentro del cliente.

### Inmutabilidad

Devuelve un valor nuevo. No mutes el array o el objeto que llegó por argumento: React y la caché comparan por referencia, y una mutación a medias se ve como “no cambió nada” o como un cambio fantasma.

```ts
function appendItem<T>(items: readonly T[], item: T): T[] {
  return [...items, item]
}
```

### `null` y `undefined`

Un significado por ausencia. `undefined` es “todavía no está”. `null` es “vacío a propósito”, cuando el contrato lo usa así. Cero, lista vacía y “sin plan” no se codifican como `null` si son estados distintos. Una query sin datos todavía es `isPending`, no un `data: null` inventado en el `catch`.

### Testabilidad

Si una regla no se puede probar sin montar React, no era una regla de UI: era dinero, una fecha, un payload o un agrupamiento, y vive en un `.ts` con `*.spec.ts` (`node --test`).

Inyecta el reloj o el dato variable como argumento. No construyas una clase con un port para sustituir `new Date()` o el cliente HTTP.

```ts
function isSubscriptionExpired(expiresAt: Date, now: Date): boolean {
  return expiresAt < now
}
```

### Dirección de las dependencias

La regla pura no importa React, Next ni `src/config/api-client.ts`. Recibe datos y devuelve datos.

El hook llama a `apiGet`, `apiPost` o `apiDelete`. El componente llama al hook o pinta lo que ya le pasaron. `page.tsx` no hace fetching.

No hay capas hexagonales ni un interface por cada llamada. La variación de HTTP ya está concentrada en el cliente de `src/config`.

### Nombres, comentarios y literales

El nombre dice el rol o el concepto. `data`, `info`, `temp`, `result`, `obj` y `item` no dicen nada cuando hay una palabra de dominio.

Un comentario solo explica una restricción que el nombre no puede cargar: por qué se hace polling, por qué un id tiene que venir del cliente, por qué un efecto limpia una suscripción. El resto se borra.

Un literal de dominio o de protocolo (estado, rol, código de error, path, nombre de evento) se nombra una vez: const, unión de strings o el mapa de `API_ENDPOINTS`. Un texto de UI que aparece una sola vez puede quedar en el JSX.

### SOLID, aplicado a este cliente

Una responsabilidad, y dependencias invertidas solo donde hoy existe más de una implementación. El cliente HTTP es uno. No añadas `MailerPort`, `Repository` ni `UseCase` para un solo caller.

Donde sí hay variación real, el hueco es un argumento de función o el componente que ya compone la pantalla, no una jerarquía de clases.

### Validar una vez

El schema Zod del input es el contrato. Se parsea en el borde: el formulario o el armado del body. Hacia adentro viaja el tipo ya parseado. No recompruebes el mismo “requerido”, el mismo rango o el mismo formato en el mapper y otra vez en el handler.

`schema.safeParse` para habilitar el botón y el parse del submit tienen que ser el mismo schema. La regla del botón deshabilitado está en [`.cursor/rules/form-submit-disabled.mdc`](.cursor/rules/form-submit-disabled.mdc): no uses `formState.isValid`, que nace en `true`.

## React y Next.js

`app/` es Server Component salvo la frontera que necesita estado, eventos o el navegador. `"use client"` va en el archivo que cruza esa frontera, antes de los imports. No se copia en cada hijo: todo lo que ese archivo importa entra al bundle del cliente. Un Server Component que solo se pasa como `children` sigue renderizándose en el servidor.

Las props que cruzan de servidor a cliente tienen que ser serializables. Funciones, clases y `Date` no cruzan esa frontera. El estado de interacción vive en el cliente; el secreto y el fetch que no debe llegar al navegador viven en el servidor.

No conviertas una `page.tsx` en cliente para leer un `useState`. La page sigue siendo `Suspense` más la screen, como dice `AGENTS.md`.

### Estado

Calcula durante el render lo que sale de props u otro estado: listas filtradas, totales, flags. Guardarlo en otro `useState` y copiarlo con `useEffect` pinta un frame de más y se desincroniza.

No copies props a estado para “editarlas” salvo que el componente tome una foto inicial a propósito. Si la identidad de lo que se edita cambia (otro id de ruta), resetea con `key` en el padre en lugar de un efecto que haga `setState`.

El estado vive en el componente más bajo que lo usa. Subirlo “por si un hermano lo necesita” acopla a toda la rama.

Un filtro, tab, página o panel que el usuario debe poder recargar o compartir va en la URL (`searchParams`), no solo en `useState`.

### Efectos

`useEffect` sincroniza con un sistema externo: suscripción del navegador, widget no-React, timer, socket. Si no hay sistema externo, no hay efecto.

No uses un efecto para:

- Derivar estado de otro estado.
- Reaccionar a un click o a un submit. Eso es el handler.
- Pedir datos del API. Eso es `useQuery`.

El efecto que se suscribe devuelve la limpieza. No mientas al array de dependencias: si el linter pide un valor, o entra en la lista o se demuestra que no es reactivo (moverlo fuera, leer un primitivo, o un updater `setState(prev => …)`). `useEffectEvent` es solo para la lógica que se dispara desde un efecto y no debe re-dispararlo. No sirve para callar el linter, y no se llama durante el render ni se pasa a un hijo.

### Hooks y render

Los hooks van en el tope, incondicionales, en el mismo orden. Un return anticipado va después de los hooks. El gate de `AGENTS.md` existe para eso: el cuerpo con hooks no se monta hasta que la sesión o el módulo lo permiten.

La `key` de una lista es un id estable. El índice solo sirve si la lista es estática y nunca se reordena, filtra o inserta. Una `key` que cambia a propósito resetea el estado de ese subárbol; no la uses como truco para forzar un refetch.

No leas layout durante el render (`getBoundingClientRect`, `offsetWidth`, `scrollTop`). Eso no es puro y se dispara en cada render.

### Memo

Este repo no tiene el React Compiler activado. Aun así, `useMemo` y `useCallback` no se ponen por defecto. Úsalos cuando el cálculo es caro y medido, o cuando una referencia nueva re-dispara una query o un efecto. Una función creada en el render y pasada a un hijo sin `memo` no necesita `useCallback`.

## Datos

El servidor de este cliente es el API de `personal-os-back`. En el navegador, leer es `useQuery` y escribir es `useMutation`. La `queryFn` devuelve la promesa de `apiGet` / `apiPost` / `apiDelete`. Esos helpers ya sacan `data` del envelope y lanzan `ApiError`. Un 401 cierra la sesión. No escribas otro wrapper.

```tsx
export function useAiSession(sessionId: string | null) {
  const session = useAppStore((state) => state.session)

  return useQuery({
    queryKey: ["ai", "session", sessionId],
    queryFn: () => apiGet<AiSessionDetail>(API_ENDPOINTS.AI.SESSION(sessionId!)),
    enabled: Boolean(session) && Boolean(sessionId),
  })
}
```

La query key es un array serializable e incluye cada variable que la `queryFn` usa para cambiar el resultado. Una key `["session"]` con el id cerrado por scope cachea la sesión equivocada.

`status` dice si hay `data`. `fetchStatus` dice si la `queryFn` está corriendo. Una query puede estar en `success` y a la vez en `fetching` durante un refetch. No trates `isFetching` como “no hay datos”.

Por defecto el dato cacheado nace stale y puede revalidarse al montar, al enfocar la ventana o al reconectar. Sube `staleTime` cuando ese refetch estorba. `staleTime: "static"` ni siquiera obedece a `invalidateQueries`. Úsalo solo para algo que no cambia mientras la app vive.

Queries independientes se declaran juntas y corren en paralelo. `enabled` espera un dato del que la segunda query depende de verdad. Varias `useSuspenseQuery` secuenciales en el mismo componente se esperan en serie: si tienen que ir juntas, usa `useSuspenseQueries`.

Después de una mutación, invalida las keys que esa escritura dejó viejas. No copies la respuesta a un `useState` paralelo “para que la lista se entere”.

El dinero que llega del API es string. Se parsea a number solo para editar o escribir, con `parseFinanceMoney` y el resto de `src/modules/finance/shared/lib/money.ts`. No sumes monedas distintas en el cliente. La decisión está en [docs/decisions/ADR-002-money-strings.md](docs/decisions/ADR-002-money-strings.md).

## Formularios

Un formulario usa react-hook-form y un solo schema Zod, definido en un `.ts`. El submit parsea ese schema y manda el resultado. No armes el body a mano con un segundo conjunto de `if`.

Los textos de error salen al salir del campo (`mode: "onTouched"`), no todos en el primer tecleo. El botón de guardar sigue la regla del repo, no la guía genérica de “dejar el submit habilitado hasta que empiece el request”.

Inputs controlados caros por tecla se evitan. Si el campo no necesita reaccionar en cada tecla, prefiere el registro no controlado de react-hook-form.

No bloquees el pegado. Un control tiene `<label htmlFor>` o `aria-label`. El tipo y el `inputMode` coinciden con el dato (`email`, `tel`, decimal). Emails, códigos y usuarios llevan `spellCheck={false}`.

## Interfaz

Estas reglas cubren lo que no está ya en `.cursor/rules`. Si una pantalla repite un comportamiento que ya tiene `.mdc`, se cumple esa regla y no se reescribe aquí.

- Acción: `<button>`. Navegación: `<Link>` de Next. Un `<div onClick>` no se abre con teclado, no anuncia rol y no permite abrir en otra pestaña.
- En la web los iconos son obligatorios: todo botón lleva un icono representativo (el texto es opcional) y todo campo lleva icono líder ([`.cursor/rules/icons-required.mdc`](.cursor/rules/icons-required.mdc)). Un botón que solo tiene icono lleva `aria-label`; un icono decorativo lleva `aria-hidden`.
- Un campo no lleva placeholder por defecto; solo cuando muestra un ejemplo o un formato ([`.cursor/rules/input-placeholders.mdc`](.cursor/rules/input-placeholders.mdc)).
- HTML semántico antes que ARIA: `nav`, `main`, `button`, encabezados en orden.
- El foco visible no se apaga. `outline-none` sin un reemplazo `focus-visible` deja el control invisible al teclado. El anillo usa `:focus-visible`, no `:focus`, para no mostrarlo en cada click.
- Un toast o un error que aparece sin mover el foco va en una región `aria-live="polite"`.
- El texto largo tiene `truncate`, `line-clamp` o `break-words`. Un hijo flex que debe truncar lleva `min-w-0`.
- Una columna de cifras usa `tabular-nums` para que no salte al comparar.
- Una lista larga trae más filas al bajar (scroll infinito, [`.cursor/rules/list-infinite-scroll.mdc`](.cursor/rules/list-infinite-scroll.mdc)). No usa botones de página y no pinta todos los nodos de golpe.
- Animá `transform` y `opacity`, con las propiedades nombradas. `transition: all` anima también color, sombra y layout. Respeta `prefers-reduced-motion`.
- Una imagen con tamaño conocido declara ancho y alto, o el hueco empuja la página al cargar. Lo que está bajo el pliegue no compite con lo que se ve primero.
- Fechas y números que no son el contrato de money usan `Intl`. No formatees con `toFixed` y un símbolo escrito a mano. Un `Date` renderizado distinto en servidor y cliente rompe la hidratación: o se formatea en el cliente a propósito, o el valor ya viene listo.
- Un string vacío o un array vacío tienen estado vacío. No dejes un encabezado sobre una lista rota.
- Una acción destructiva pide confirmación. Esa regla ya está en `confirm-important-changes.mdc`.
- No desactives el zoom (`user-scalable=no`, `maximum-scale=1`). No uses `autoFocus` salvo el único campo primario de un escritorio.

## Fuentes

- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) — efectos solo para sincronizar con un sistema externo; derivar en el render; eventos en el handler.
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) — dependencias, limpieza y el doble montaje de Strict Mode.
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — `"use client"` es la frontera del módulo, no una marca en cada archivo.
- [Query Keys](https://tanstack.com/query/v5/docs/framework/react/guides/query-keys) — la key incluye cada variable de la `queryFn`.
- [Important Defaults](https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults) — el caché nace stale; `staleTime` y `"static"`.
- [Request Waterfalls](https://tanstack.com/query/v5/docs/framework/react/guides/request-waterfalls) — queries independientes en paralelo.
- [Web Interface Guidelines](https://vercel.com/design/guidelines) — foco, semántica, URL, listas, movimiento. El botón de submit de este repo no sigue la de “habilitado hasta el request”: manda `form-submit-disabled.mdc`.
