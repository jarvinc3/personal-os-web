# Coding Guidelines

Cómo se escribe el código de este cliente Next.js. Los papeles de archivo, las capabilities y la frontera de imports viven en [AGENTS.md](AGENTS.md). La UX de producto (ruedas de fecha, sheets, confirmaciones, iconos) vive en [`.cursor/rules/`](.cursor/rules) y en [docs/architecture/ui-components.md](docs/architecture/ui-components.md).

Si este archivo contradice a `AGENTS.md` o a una regla `.mdc`, manda el repo. Aquí no se inventan capas `presentation` / `application` / `infrastructure` / `domain`, ni un port por hook.

Todos los ejemplos son TypeScript de este stack: React y Next con los patrones de este repo.

## Referencia rápida

| Haz                                                              | No hagas                                                                   |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Salir pronto ante una entrada inválida                           | Anidar `if/else` en pirámide                                               |
| Fallar con un error explícito                                    | Encadenar fallbacks que esconden el fallo                                  |
| Una razón para cambiar por unidad                                | Validar, transformar, guardar y notificar en el mismo sitio                |
| Extraer al tercer uso real del mismo concepto                    | Abstraer al primer parecido, o un componente que solo reenvía props        |
| La solución más simple para el problema de hoy                   | Un hook, una capa o un flag “por si acaso”                                 |
| Componer componentes y funciones                                 | Cadenas de herencia o un wrapper por cada prop                             |
| Hablar con el colaborador inmediato                              | Atravesar tres objetos propios para leer un campo                          |
| Una función hace o devuelve                                      | Un getter que además muta o navega                                         |
| Un schema Zod en el borde                                        | El mismo invariante revalidado en el mapper y en el submit                 |
| Dejar salir el error con contexto                                | Un `catch` vacío o devolver `null` como si no hubiera fallado              |
| Devolver un valor nuevo                                          | Mutar el argumento que recibió el caller                                   |
| Un significado por `null` / `undefined`                          | Usarlos para tres estados de negocio distintos                             |
| Reglas puras en `.ts`, con `*.spec.ts`                           | Lógica de dinero, fechas o payloads imposible de probar sin montar React   |
| La regla no importa React ni `api-client`                        | Un `.ts` de dominio que llama a `fetch` o a un cliente HTTP                |
| `"use client"` solo en la frontera                               | Marcar cada archivo, o convertir `page.tsx` en cliente para usar un estado |
| Calcular durante el render                                       | Un `useEffect` que copia props o deriva otro estado                        |
| `useQuery` / `useMutation`                                       | `useEffect` + `useState` para traer o guardar datos del API                |
| La query key incluye cada variable que usa `queryFn`             | Una key fija mientras el id o el filtro cambian                            |
| `apiGet` / `apiPost` / `apiDelete` de `src/config/api-client.ts` | Otro `fetch` que vuelva a abrir el envelope `{ data, meta }`               |
| `<button>` para acciones, `<Link>` para navegar                  | Un `<div onClick>`                                                         |
| Estado compartible en la URL                                     | Un filtro o tab que se pierde al recargar y solo vive en `useState`        |
| El tipo del borde, y después confiar en él                       | `any` en cualquier sitio                                                   |
| `unknown` más `safeParse` en el borde                            | Castear un `unknown` a una forma y esperar que exista                      |
| `as` con el motivo escrito                                       | `as` para callar al compilador                                             |
| Unión con `as const` para un conjunto cerrado                    | `enum` de strings para lo mismo                                            |
| `switch` exhaustivo que termina en `never`                       | Un `default` que se traga el caso nuevo                                    |
| `readonly` en props y arrays que no te tocan                     | Mutar el array que llegó por prop                                          |
| Tipo de retorno explícito en lo exportado                        | Que cada caller rederive el contrato                                       |
| Un objeto de props después de tres props                         | Booleanos sueltos que cambian la forma del componente                      |
| `await` o `.catch` en toda promesa                               | Una promesa que nadie mira                                                 |
| `Promise.all` para lo independiente                              | `await` en serie dentro de un bucle                                        |
| Un componente por archivo                                        | Tres componentes exportados en el mismo `.tsx`                             |
| El foco vuelve solo al cerrar la hoja                            | Pelear con el foco que base-ui ya gestiona                                 |

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

```tsx
// Mal — dos props que solo existen para un caso que no llegó
<FinanceSummary data={summary} compact={false} withChart={false} />

// Bien — el caso que existe hoy
<FinanceSummary data={summary} />
```

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

## TypeScript

### Tipado estricto

**Sin `any`.** Apaga todas las comprobaciones sobre el valor y se propaga a cada caller. `@typescript-eslint/no-explicit-any` está activo.

**`unknown` en el borde, validado antes de usarlo.** Un dato que viene de fuera (respuesta del API, `localStorage`, un mensaje del navegador) es `unknown` hasta que un schema demuestra su forma.

```ts
// Mal — el cast convierte un fallo de runtime en un fallo silencioso
const cached = JSON.parse(raw) as FinanceBudget[]

// Bien — unknown hasta que Zod demuestra la forma
const parsed = budgetsSchema.safeParse(JSON.parse(raw))
if (!parsed.success) {
  throw new Error(`Presupuestos guardados inválidos: ${parsed.error.message}`)
}
const cached: FinanceBudget[] = parsed.data
```

**`as` solo con el motivo escrito.** Un cast es una promesa al compilador de que sabes más que él. Si el motivo no cabe en una línea, el cast esconde un problema de diseño.

```ts
// Mal — calla al compilador y rompe cuando el contrato cambie
const body = values as CreateBudgetBody

// Bien — el estrechamiento es local y tiene una razón
// `buildCreateBudgetBody` ya validó la forma; el genérico del cliente no la puede inferir.
const body = payload.body as CreateBudgetBody
```

**`satisfies` para mapas literales.** Comprueba la forma sin ensanchar los literales, así las claves siguen estrechas.

```ts
// Mal — la anotación ensancha cada clave a string
const LABEL: Record<FinanceBudgetPeriod, string> = { MONTHLY: "Mensual" }

// Bien — la forma se comprueba y las claves siguen estrechas
const LABEL = {
  MONTHLY: "Mensual",
  WEEKLY: "Semanal",
  CUSTOM: "Personalizado",
} satisfies Record<FinanceBudgetPeriod, string>
```

**`readonly` para lo que no te toca.** Props, arrays de datos y resultados de una función que no debes mutar se declaran `readonly`, y el compilador rechaza la mutación en vez de que la vea el reviewer.

```tsx
// Mal — el componente puede ordenar el array del caller en su sitio
type Props = { budgets: FinanceBudget[] }

// Bien — la firma prohíbe la mutación
type Props = { budgets: readonly FinanceBudget[] }
```

**Tipo de retorno explícito en lo exportado.** El tipo de retorno es parte del contrato. Si se infiere, un cambio dentro de la función cambia en silencio lo que recibe cada caller.

```ts
// Mal — el contrato cambia cuando cambia el cuerpo
export function resolvePeriodLabel(period: FinanceBudgetPeriod) {
  return LABEL[period]
}

// Bien — el contrato está escrito
export function resolvePeriodLabel(period: FinanceBudgetPeriod): string {
  return LABEL[period]
}
```

### Enums, uniones y switch exhaustivo

Para un conjunto cerrado usa un array `as const` o un objeto `as const` con su unión. No añade un objeto en runtime y es el mismo string que manda el API.

```ts
// Mal — el enum agrega un objeto en runtime para un valor que ya es un string
export enum FinanceBudgetPeriod {
  Monthly = "MONTHLY",
}

// Bien — array const más unión, la misma forma que el contrato
export const FINANCE_BUDGET_PERIODS = ["MONTHLY", "WEEKLY", "CUSTOM"] as const
export type FinanceBudgetPeriod = (typeof FINANCE_BUDGET_PERIODS)[number]
```

Los tipos del API vienen generados desde el contrato OpenAPI. Reutiliza ese tipo en vez de declarar una segunda copia de la misma unión.

Un `switch` sobre una unión termina en `never`. `@typescript-eslint/switch-exhaustiveness-check` avisa del caso que falta; la asignación a `never` convierte el siguiente miembro agregado en un error de compilación.

```ts
// Mal — el estado nuevo cae en el default y el bug se publica
switch (status) {
  case "CONFIRMED":
    return "Confirmado"
  case "CANCELLED":
    return "Cancelado"
  default:
    return ""
}

// Bien — el compilador rechaza el miembro nuevo hasta que se maneje
switch (status) {
  case "CONFIRMED":
    return "Confirmado"
  case "CANCELLED":
    return "Cancelado"
  default: {
    const unhandled: never = status
    throw new Error(`Estado no manejado: ${String(unhandled)}`)
  }
}
```

### Límites medibles

Son regla de review primero y de lint después. Los números de abajo son los que `eslint.config.mjs` aplica en `warn`.

| Límite                           | Valor             |
| -------------------------------- | ----------------- |
| Líneas por función o componente  | 120               |
| Líneas por archivo (sin blancos) | 300               |
| Props o parámetros               | 3, después objeto |
| Profundidad de anidación         | 4                 |
| Complejidad ciclomática          | 12                |
| Ternarios anidados               | ninguno           |

Un componente que pasa de 120 líneas o de complejidad 12 suele esconder dos bloques. Extrae por intención, no por conteo: si el nombre extraído no deja al caller entender el flujo sin leer el cuerpo, la división empeoró el archivo.

**Tres props, después un objeto.** La cuarta prop posicional deja de ser legible, y dos call sites terminan intercambiando el orden.

```tsx
// Mal — cuatro props, dos de ellas booleanas
<BudgetCard budget={budget} currency="DOP" showCents compact />

// Bien — un objeto con nombre, cada valor dicho en el call site
<BudgetCard budget={budget} display={displayConfig} />
```

**Sin prop booleana que cambia la forma.** Un `true` en el call site no dice nada, y el componente crece con una segunda rama que nadie revisa. Un `variant` nombrado, o dos componentes, dice qué se pinta.

```tsx
// Mal — el caller tiene que recordar qué significa `true`
<TransactionRow transaction={row} detailed />

// Bien — la variante tiene nombre
<TransactionRow transaction={row} variant="detailed" />
```

**Sin ternarios anidados.** Una expresión condicional se lee. Dos, no.

```tsx
// Mal
{
  kind === "CARD" ? "Tarjeta" : kind === "CASH" ? "Efectivo" : "Cuenta"
}

// Bien — una tabla lo dice una vez
{
  INSTRUMENT_LABEL[kind]
}
```

### Async y promesas

**Sin promesas flotantes.** Una promesa que nadie espera rechaza en un rechazo no manejado, lejos de la línea que lo causó. O la esperas, o la devuelves, o la marcas `void` a propósito.

```ts
// Mal — el error desaparece
queryClient.invalidateQueries({ queryKey: ["finance", "budgets"] })

// Bien — esperada dentro del flujo que la necesita
await queryClient.invalidateQueries({ queryKey: ["finance", "budgets"] })
```

**Sin callback `async` en `forEach`.** `forEach` ignora la promesa devuelta: el bucle termina antes que el trabajo y el primer rechazo se pierde. Usa `for...of` si el orden importa y `Promise.all` con `map` si no.

```ts
// Mal — el handler resuelve antes de que se guarden las filas
ids.forEach(async (id) => {
  await removeBudget(id)
})

// Bien — en serie cuando cada paso depende del anterior
for (const id of ids) {
  await removeBudget(id)
}

// Bien — en paralelo cuando son independientes
await Promise.all(ids.map((id) => removeBudget(id)))
```

**Paraleliza lo independiente.** Dos queries que no dependen entre sí cuestan una ida, no dos. En React, se declaran juntas y TanStack Query las corre en paralelo.

**Un handler `async` no va directo a `onClick`.** `onClick={onSubmit}` con `onSubmit` async devuelve una promesa que React no espera y cuyo rechazo nadie captura. `@typescript-eslint/no-misused-promises` lo detecta.

```tsx
// Mal — React no espera la promesa y el rechazo queda suelto
<Button onClick={onSubmit}>Guardar</Button>

// Bien — el handler envuelve la promesa
<Button onClick={() => void onSubmit()}>Guardar</Button>
```

### Nombres

| Qué                          | Convención                       | Ejemplo                      |
| ---------------------------- | -------------------------------- | ---------------------------- |
| Archivo                      | kebab-case, el rol al final      | `budget-sheet.tsx`           |
| Componente                   | PascalCase, igual que el archivo | `BudgetSheet`                |
| Hook                         | camelCase con `use`              | `useFinanceEnabled`          |
| Función, variable            | camelCase, verbo primero         | `buildCreateBudgetBody`      |
| Constante, literal de módulo | SCREAMING_SNAKE_CASE             | `FINANCE_BUDGET_PERIODS`     |
| Booleano                     | `is` / `has` / `can` / `should`  | `isPending`, `hasCategories` |
| Query key                    | array de strings en kebab-case   | `["finance", "budgets", id]` |

Dentro de la carpeta del módulo no se repite el nombre del módulo: `categories-screen.tsx`, no `finance-categories.tsx`.

Un nombre que necesita el tipo para entenderse es un nombre malo. `budgetIds` se lee sin escribir `Array`.

### Qué hace un buen test

Un test enuncia una conducta, arma el estado mínimo que la produce y falla con un mensaje que nombra la regla rota. En este cliente son `.spec.ts` junto a la regla y corren con `node --test`.

- **Una conducta por `test`.** “arma el body, lo manda y recarga la lista” son tres.
- **El nombre dice qué se garantiza**, no qué método corrió: `test("rechaza un monto con tres decimales")`, no `test("parseFinanceMoney")`.
- **Arrange, Act, Assert visibles.** Un helper que arma un fixture válido está bien; uno que esconde la aserción, no.
- **Prueba el borde de tu código**, no la librería. Si el test solo comprueba que Zod valida, no prueba nada tuyo.
- **Afirma sobre el resultado observable**: el valor devuelto, el body que se envió, el error que se lanzó. Afirmar el orden interno de llamadas rompe en cada refactor y no demuestra nada.
- **Una aserción que atrape la regresión** vale más que diez que repiten la implementación.
- **Todo bug arreglado empieza con el test que falla.** Si el test no falla antes del arreglo, no cubre el bug.

```ts
test("rechaza un monto con más de dos decimales", () => {
  const parsed = budgetSchema.safeParse({ amountLimit: "10.001" })

  assert.equal(parsed.success, false)
})

test("arma el body con el monto como string", () => {
  const payload = buildCreateBudgetBody(validValues)

  assert.equal(payload.ok, true)
  assert.equal(payload.body.amountLimit, "2500.00")
})
```

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

El efecto que se suscribe devuelve la limpieza. No mientas al array de dependencias: si el linter pide un valor, o entra en la lista o se demuestra que no es reactivo (moverlo fuera, leer un primitivo, o un updater `setState(prev => …)`). `useEffectEvent` es solo para la lógica que se dispara desde un efecto y no debe re-dispararlo. No sirve para callar al linter, y no se llama durante el render ni se pasa a un hijo.

### Hooks y render

Los hooks van en el tope, incondicionales, en el mismo orden. Un return anticipado va después de los hooks. El gate de `AGENTS.md` existe para eso: el cuerpo con hooks no se monta hasta que la sesión o el módulo lo permiten.

La `key` de una lista es un id estable. El índice solo sirve si la lista es estática y nunca se reordena, filtra o inserta. Una `key` que cambia a propósito resetea el estado de ese subárbol; no la uses como truco para forzar un refetch.

No leas layout durante el render (`getBoundingClientRect`, `offsetWidth`, `scrollTop`). Eso no es puro y se dispara en cada render.

## Componentes

### Tamaño

Un componente cabe en las 120 líneas de la tabla de límites, y normalmente en menos. Cuando no cabe, el corte casi siempre es el mismo: el bloque con su propio título (`SummarySection`), la fila que se repite y el formulario que se arma aparte.

Un componente que recibe diez props y decide cuatro cosas distintas es dos componentes. Divide por bloque visual, no por línea.

El cuerpo de una screen puede ser largo porque compone bloques: si empieza a calcular, mapear o validar, eso se va al `.ts` o a un componente del bloque.

### Props tipadas

Las props son un `type` con nombre, no un objeto anónimo inline. Cada prop dice qué dato es y si es opcional; lo que no puede faltar no lleva `?`.

```tsx
// Mal — el tipo se repite en cada uso y no tiene nombre
function BudgetCard({
  budget,
  display,
}: {
  budget: FinanceBudget
  display: Display
}) {}

// Bien — el tipo tiene nombre, se exporta si otro bloque lo compone
type BudgetCardProps = {
  budget: FinanceBudget
  display: DisplayConfig
  onOpen?: (budget: FinanceBudget) => void
}

function BudgetCard({ budget, display, onOpen }: BudgetCardProps) {}
```

- Un callback recibe el dato que necesita, no el evento, si el caller no va a leer el evento.
- Un `children` es `ReactNode`. No lo tipes como `JSX.Element`.
- Si el componente reenvía props a un primitivo, tipa desde el primitivo (`ComponentProps<typeof Button>`) en vez de copiar la lista a mano.
- Una prop opcional que solo existe para un caso que hoy no se usa no entra.

### Un archivo, un componente

Un `.tsx` exporta un componente y, si hace falta, los tipos de sus props. Los bloques internos que ese componente usa van en su propio archivo cuando tienen nombre y se repiten.

La excepción ya está en `AGENTS.md` y no se toca: `page.tsx` importa la screen, la screen exporta `<Nombre>Screen` y define `<Nombre>ScreenBody` en el mismo archivo. El cuerpo existe para que el gate no ejecute sus hooks.

Un archivo con tres `export function` de componentes distintos no se revisa: el segundo y el tercero no tienen dueño.

## Rendimiento

### Memo

Este repo no tiene el React Compiler activado. Aun así, `useMemo` y `useCallback` no se ponen por defecto. Úsalos cuando el cálculo es caro y medido, o cuando una referencia nueva re-dispara una query o un efecto. Una función creada en el render y pasada a un hijo sin `memo` no necesita `useCallback`.

```tsx
// Mal — memo para un cálculo que cuesta nada, y encima sin dependencia real
const total = useMemo(() => items.length, [items])

// Bien — la referencia nueva re-dispararía la query del historial
const historyRange = useMemo(() => previousMonthsBounds(new Date(), 3), [])
```

### Listas largas

Una lista larga no pinta todos los nodos de golpe y no pagina con botones. El contrato está en [`.cursor/rules/list-infinite-scroll.mdc`](.cursor/rules/list-infinite-scroll.mdc): `useInfiniteQuery` con `getNextPageParam`, un `IntersectionObserver` sobre `InfiniteListSentinel` al final, y el tamaño de tanda en un `limit` con nombre.

- La carga siguiente se dispara al acercarse al final, no con un botón “Anterior / Siguiente”.
- Mientras llega la tanda hay un indicador al pie; cuando no hay más, la lista termina en silencio.
- Un fallo al traer la siguiente tanda muestra un aviso con reintento y no borra lo ya cargado.
- Un cálculo por fila (total, saldo, etiqueta) no se repite para cada item si el mismo resultado sirve a toda la lista: se calcula una vez arriba y baja como dato.

### Carga diferida

El corte de este repo es la ruta: cada `page.tsx` importa su screen por ruta directa, así entrar a Finanzas no compila el módulo de IA. No metas la screen de otro módulo en el barrel ni la importes desde un componente compartido, porque arrastra todo su árbol al bundle.

Un panel pesado que no se ve en el primer render no monta hasta que hace falta. Un sheet ya cumple esto por construcción: su contenido solo existe cuando el parámetro de la URL lo abre.

Cuando un bloque pesado sí vive en la primera pantalla (un gráfico, un editor, una librería de terceros), ese es el caso de `next/dynamic` con `ssr: false` en un componente cliente. No lo uses para todo: cada `dynamic` agrega un estado de carga que hay que pintar.

## Accesibilidad

Antes de crear un control, lee `.cursor/rules` y [docs/architecture/ui-components.md](docs/architecture/ui-components.md). Aquí va lo que aplica a cualquier componente.

### Etiquetas

- Todo campo tiene `<label htmlFor>` o, si el texto no se ve, `aria-label`. Un placeholder no es una etiqueta: desaparece al escribir.
- Un botón con solo icono lleva `aria-label`. Un icono decorativo lleva `aria-hidden="true"`.
- Un mensaje de error se asocia al campo (`aria-describedby`) y no solo se pinta en rojo.
- Un toast o un aviso que aparece sin mover el foco va en una región `aria-live="polite"`.
- HTML semántico antes que ARIA: `nav`, `main`, `button`, encabezados en orden.
- El foco visible no se apaga. `outline-none` sin un reemplazo `focus-visible` deja el control invisible al teclado.

### Foco al abrir y cerrar un sheet

`BottomSheet` monta un `Drawer` de base-ui, que atrapa el foco dentro, lo mueve al popup al abrir y lo devuelve al elemento que abrió la hoja al cerrar. El componente no lo pelea: no muevas el foco a mano con `ref.focus()` en un `useEffect`, y no desmontes el disparador mientras la hoja está abierta.

El foco inicial por defecto lo elige base-ui. Cuando la hoja es de lectura y el título es lo primero que debe leer el lector de pantalla, pasa `focusTitleOnOpen`; `resolveSheetTitleFocus` agrega el `tabIndex={-1}` que un encabezado necesita para recibir foco por programa.

```tsx
// Bien — hoja de lectura: el título recibe el foco y se anuncia la descripción
<BottomSheet
  open={open}
  onOpenChange={setOpen}
  title="Resumen de la cuenta"
  description="Saldo actual y últimos movimientos"
  focusTitleOnOpen
>
  {content}
</BottomSheet>
```

- El primer campo de un formulario es el foco natural al abrir; no hace falta pedirlo.
- Al cerrar, el foco vuelve a quien abrió la hoja. Si la acción que abrió la hoja ya no existe (la fila se borró), el foco se va a un punto estable de la pantalla y no al `body`.
- Un sheet abierto por ruta (`useSheetParams`) se abre y se cierra con el botón atrás del navegador. No cierres con `router.push` a mano ni dejes la URL con el parámetro abierto y la hoja cerrada.
- Una hoja no anidada dentro de otra hoja salvo el caso de un selector, que ya resuelve `?picker=` en [`.cursor/rules/sheet-url-route.mdc`](.cursor/rules/sheet-url-route.mdc).
- Un backdrop que se cierra con click también se cierra con `Escape`, y el botón de cerrar es alcanzable con teclado.

## Datos

El servidor de este cliente es el API de `personal-os-back`. En el navegador, leer es `useQuery` y escribir es `useMutation`. La `queryFn` devuelve la promesa de `apiGet` / `apiPost` / `apiDelete`. Esos helpers ya sacan `data` del envelope y lanzan `ApiError`. Un 401 cierra la sesión. No escribas otro wrapper.

```tsx
export function useAiSession(sessionId: string | null) {
  const session = useAppStore((state) => state.session)

  return useQuery({
    queryKey: ["ai", "session", sessionId],
    queryFn: () =>
      apiGet<AiSessionDetail>(API_ENDPOINTS.AI.SESSION(sessionId!)),
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
- El texto largo tiene `truncate`, `line-clamp` o `break-words`. Un hijo flex que debe truncar lleva `min-w-0`.
- Una columna de cifras usa `tabular-nums` para que no salte al comparar.
- Animá `transform` y `opacity`, con las propiedades nombradas. `transition: all` anima también color, sombra y layout. Respeta `prefers-reduced-motion`.
- Una imagen con tamaño conocido declara ancho y alto, o el hueco empuja la página al cargar. Lo que está bajo el pliegue no compite con lo que se ve primero.
- Fechas y números que no son el contrato de money usan `Intl`. No formatees con `toFixed` y un símbolo escrito a mano. Un `Date` renderizado distinto en servidor y cliente rompe la hidratación: o se formatea en el cliente a propósito, o el valor ya viene listo.
- Un string vacío o un array vacío tienen estado vacío. No dejes un encabezado sobre una lista rota.
- Una acción destructiva pide confirmación. Esa regla ya está en `confirm-important-changes.mdc`.
- No desactives el zoom (`user-scalable=no`, `maximum-scale=1`). No uses `autoFocus` salvo el único campo primario de un escritorio.

## Regla de guía a regla de ESLint

Las reglas de abajo están activas en [eslint.config.mjs](eslint.config.mjs). Lo nuevo entra en `warn` hasta que el backlog esté limpio.

| Regla de la guía                               | Regla de ESLint                                  | Nivel |
| ---------------------------------------------- | ------------------------------------------------ | ----- |
| Sin `any`                                      | `@typescript-eslint/no-explicit-any`             | warn  |
| Función o componente de 120 líneas como máximo | `max-lines-per-function`                         | warn  |
| Archivo de 300 líneas como máximo              | `max-lines`                                      | warn  |
| Tres props o parámetros, después un objeto     | `max-params`                                     | warn  |
| Anidación de 4 niveles como máximo             | `max-depth`                                      | warn  |
| Complejidad ciclomática 12 como máximo         | `complexity`                                     | warn  |
| Sin ternarios anidados                         | `no-nested-ternary`                              | warn  |
| Toda promesa esperada o capturada              | `@typescript-eslint/no-floating-promises`        | warn  |
| Un handler `async` no va directo al JSX        | `@typescript-eslint/no-misused-promises`         | warn  |
| `switch` exhaustivo, sin `default` silencioso  | `@typescript-eslint/switch-exhaustiveness-check` | warn  |
| Llaves en todo `if`                            | `curly`                                          | error |
| Frontera de módulo y de capability             | `no-restricted-imports`                          | error |
| Imports absolutos, sin `../`                   | `no-restricted-syntax`                           | error |
| Sin inputs nativos de fecha u hora             | `no-restricted-syntax`                           | error |
| El submit no se apoya en `formState.isValid`   | `no-restricted-syntax`                           | error |
| Reglas de hooks y dependencias                 | `react-hooks` (config de Next)                   | error |

Lo revisa una persona, porque no hay regla fiable:

- `as` con el motivo escrito, y `unknown` validado antes de usarlo.
- `readonly` en props y arrays, y tipo de retorno en lo exportado.
- Nombres de booleanos (`is` / `has` / `can` / `should`) y props booleanas que cambian la forma.
- Un componente por archivo, salvo el corte Screen / Body de `AGENTS.md`.
- Un test que enuncia una conducta y fallaría con la regresión.
- Foco al abrir y cerrar la hoja, etiquetas y anuncios de `aria-live`.

## Fuentes

- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) — efectos solo para sincronizar con un sistema externo; derivar en el render; eventos en el handler.
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) — dependencias, limpieza y el doble montaje de Strict Mode.
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — `"use client"` es la frontera del módulo, no una marca en cada archivo.
- [Query Keys](https://tanstack.com/query/v5/docs/framework/react/guides/query-keys) — la key incluye cada variable de la `queryFn`.
- [Important Defaults](https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults) — el caché nace stale; `staleTime` y `"static"`.
- [Request Waterfalls](https://tanstack.com/query/v5/docs/framework/react/guides/request-waterfalls) — queries independientes en paralelo.
- [Web Interface Guidelines](https://vercel.com/design/guidelines) — foco, semántica, URL, listas, movimiento. El botón de submit de este repo no sigue la de “habilitado hasta el request”: manda `form-submit-disabled.mdc`.
