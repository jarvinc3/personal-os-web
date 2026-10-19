# Resumen de issues de Personal OS — 2026-10-18

Revisión inicial de **21 issues abiertos** contra el código de `develop`: **1 implementado, 5 parcialmente implementados y 15 no implementados** en ese momento. La web tenía 13 issues abiertos y el backend 8. Landing no tenía issues abiertos. Estado actual: **4 implementados, 5 parcialmente implementados y 12 no implementados**.

Este documento conserva la clasificación de la revisión inicial. **Actualización posterior:** [Back #140](https://github.com/jarvinc3/personal-os-back/issues/140) fue validado y cerrado; [Back #155](https://github.com/jarvinc3/personal-os-back/issues/155) quedó corregido con la release `v0.43.2` (queda definir `PUBLIC_WEB_URL` en Railway); [Web #164](https://github.com/jarvinc3/personal-os-web/issues/164) quedó corregido con la release web `v0.45.1`; [Web #163](https://github.com/jarvinc3/personal-os-web/issues/163) quedó corregido con la release web `v0.45.2`. Los cuatro issues están cerrados y en **Done**. Quedan 17 de los issues de esta revisión abiertos, salvo cambios posteriores en GitHub.

## Guia para agente pi

Vamos a ir corrigiendo los issues en el orden que esta el archivo. Un issue por sesion a menos que se relacionen. Tienes que leer el issue en github, cuando termines de implementar haz una revision en el codigo y el issue para corregir deuda tecnica e implementaciones faltantes del issue y pormenores. Al terminar la verificacion adicional debes actualizar el issue en github y el archivo aqui.

## Criterios de clasificación

La prioridad es la del tablero; donde falta, se propone una con `*`.

- **P1:** alta.
- **P2:** media.
- **P3:** baja; recomendación de esta revisión, no un valor del tablero.

El tamaño estima **trabajo restante**, incluida validación:

- **S:** hasta 1 día.
- **M:** 2–3 días.
- **L:** 4–7 días.
- **XL:** más de una semana.

Las estimaciones son orientativas. En los bugs, «no implementado» significa que **la corrección solicitada sigue pendiente**, aunque la funcionalidad afectada ya exista.

## Ya implementados

| Issue                                                                                                            | Prioridad | Tamaño restante           | Evidencia                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------- | --------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Web #163 — Switches lentos y preferencias sobrescritas](https://github.com/jarvinc3/personal-os-web/issues/163) | P1        | S: implementado y cerrado | Switches con actualización optimista y mutaciones en serie; cada parche se calcula sobre la última caché. Si falla, vuelve el valor anterior con toast. 915 pruebas en verde.                                 |
| [Web #164 — Consultas con Finanzas desactivado](https://github.com/jarvinc3/personal-os-web/issues/164)          | P1        | S: implementado y cerrado | Ajustes → Finanzas consulta cuentas e integridad solo con la app activa; con Finanzas desactivada muestra el aviso para activarla y traduce el 403 de app desactivada. 913 pruebas en verde.                  |
| [Back #155 — Dominio incorrecto en enlaces de cobros](https://github.com/jarvinc3/personal-os-back/issues/155)   | P1        | S: implementado y cerrado | `PUBLIC_WEB_URL` con fallback al primer `CORS_ORIGIN`; create, list, revoke y regenerate devuelven `<web>/c/<token>`. Pruebas unitarias y e2e; la variable en Railway sigue pendiente.                        |
| [Back #140 — Reportes por comercio](https://github.com/jarvinc3/personal-os-back/issues/140)                     | P2*       | S: implementado y cerrado | `sumSpendByMerchant()` agrupa por `merchantId`; el listado admite `dateFrom/dateTo` y devuelve gasto y cantidad de movimientos. El comportamiento central solicitado ya existe. La web muestra el mes actual. |

### Validación y cierre de Back #140

Se verificó contra `develop`, commit `3cd9cefebbe09a162cea92a575e54b673ca34ef5`:

- `MerchantsRepository.sumSpendByMerchant()` agrupa por `merchantId`, no por el texto crudo de `merchant`; filtra por usuario, débitos confirmados y rango de fechas, y suma `amountBaseCurrency`.
- `MerchantsService.list()` admite `dateFrom` y `dateTo`, incluye el último día completo y permite consultar un mes o un año. Devuelve `monthSpend` y `monthMovements` por comercio; los nombres de esos campos se conservan incluso al consultar otro rango.
- La creación manual y la importación desde correo resuelven el comercio canónico mediante `MerchantsService.resolve()` y guardan su `merchantId`.
- La web consume estos agregados para mostrar el gasto del mes actual en Comercios. Un selector de periodos arbitrarios en la web no forma parte del alcance de este issue de backend.

**Resultado:** 2 suites y 20 pruebas aprobadas. Se dejó [evidencia en el issue](https://github.com/jarvinc3/personal-os-back/issues/140#issuecomment-6258650009), se cerró como completado y se movió a Done. No fue necesario cambiar código ni desplegar. No se comprobó el reporte con datos de producción.

### Implementación y cierre de Back #155

Se corrigió en `develop`, releases `v0.43.1` y `v0.43.2` (commit `b2d61c4`, 2026-10-19):

- `PUBLIC_WEB_URL` opcional en `packages/config/src/env.schema.ts`; sin valor se mantiene el fallback al primer `CORS_ORIGIN`.
- `shareUrl()` usa `<PUBLIC_WEB_URL>/c/<token>` en create, list, revoke y regenerate; `shareBaseUrl()` resuelve la base y quita la barra final.
- Se corrigió el fixture e2e: no incluía `token` y el resumen devolvía `/c/undefined` en la prueba.
- `pnpm format:check`, `pnpm lint`, `pnpm build`, 1.302 pruebas unitarias y 134 e2e en verde; el CI de `develop` también.
- [Issue actualizado](https://github.com/jarvinc3/personal-os-back/issues/155#issuecomment-6272804587) con evidencia, cerrado como completado y movido a **Done**.

**Operación pendiente (Jarvin):** definir `PUBLIC_WEB_URL` en Railway prod y dev y comprobar un link real. Sin la variable, producción conserva el dominio de la app; el despliegue por sí solo no cambia el resultado.

### Implementación y cierre de Web #164

Se corrigió en la web, release `v0.45.1` (2026-10-19):

- Ajustes → Finanzas solo consulta cuentas e integridad con la app activa (`isModuleEnabled`), no con `true`.
- Con Finanzas desactivada, la sección de integridad muestra el aviso para activarla en vez del error.
- Un 403 de app desactivada se traduce a «Finanzas está desactivado. Actívalo para usar esta función.»; otros 403 conservan el mensaje genérico.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck` y 913 pruebas en verde.
- Issue actualizado con evidencia, cerrado como completado y movido a **Done**.

**Verificación pendiente (Jarvin):** abrir Ajustes → Finanzas con una cuenta sin Finanzas activa, comprobar que no hay 403 en la consola y que aparece el aviso; después activar y guardar, y verificar que la integridad sigue funcionando.

### Implementación y cierre de Web #163

Se corrigió en la web, release `v0.45.2` (commit `222ef83`, 2026-10-19):

- `updatePreferences()` calcula el parche sobre la última caché y `onMutate` la actualiza al instante; `onError` restaura el perfil anterior con su toast.
- Los PATCH se serializan con `scope` y `onSuccess` no pisa una mutación pendiente.
- Ajustes y Notificaciones envían solo la hoja que cambia; ya no arrastran canales viejos.
- Se quitó el `GET /users/me` extra tras cada PATCH.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck` y 915 pruebas en verde; el CI de `develop` también.
- Issue cerrado como completado y movido a **Done**.

**Verificación pendiente (Jarvin):** tocar varios switches rápido y recargar; deben quedar los valores elegidos. Probar también un fallo de red para ver el rollback y el toast.

## Parcialmente implementados

| Issue                                                                                                      | Prioridad | Tamaño restante | Qué existe y qué falta                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------- | --------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Web #154 — Dividir archivos gigantes](https://github.com/jarvinc3/personal-os-web/issues/154)             | P1        | L               | Hay separación por funcionalidades y refactors previos. Persisten archivos de 700–1.075 líneas, incluidos formularios y tipos. Falta concretar qué archivos cubre el issue.                                                                                            |
| [Back #149 — Dividir archivos gigantes](https://github.com/jarvinc3/personal-os-back/issues/149)           | P1        | XL              | Hay extracción de responsabilidades, pero el repositorio del ledger conserva 2.423 líneas y varios servicios superan 1.000. Falta delimitar el alcance.                                                                                                                |
| [Back #139 — Cifrado y ajustes de esquema](https://github.com/jarvinc3/personal-os-back/issues/139)        | P1*       | S–M             | Ya existen cifrado AES, `last4`, hash, script de conversión, restricciones de presupuestos, auditoría de acciones IA y retención de payloads. No se encontró aplicada la adopción de `gen_random_uuid()`. Falta comprobar migración y conversión de datos por entorno. |
| [Web #145 — Captura de leads](https://github.com/jarvinc3/personal-os-web/issues/145)                      | P3*       | M               | La landing actual tiene formularios y endpoints configurables; el fallback es correo. Falta el endpoint real y la persistencia. El trabajo corresponde ahora principalmente a `personal-os-landing`.                                                                   |
| [Back #136 — Generalizar `RequiresEnabledModule`](https://github.com/jarvinc3/personal-os-back/issues/136) | P3*       | S por módulo    | El decorador ya acepta cualquier slug, pero se aplica a Finanzas. Falta extender su uso cuando existan otros módulos de dominio.                                                                                                                                       |

En los dos refactors, «parcial» describe avances generales; los issues son demasiado abiertos para medir un porcentaje de cumplimiento.

## No implementados

| Issue                                                                                                                | Prioridad | Tamaño                   | Hallazgo                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Web #161 — Mensaje de WhatsApp de cobros](https://github.com/jarvinc3/personal-os-web/issues/161)                   | P1        | S                        | Conserva el texto anterior, sin primer nombre, importe ni cantidad de cobros.                                                                                                        |
| [Web #162 — Login bloqueado unos 30 segundos](https://github.com/jarvinc3/personal-os-web/issues/162)                | P1        | M                        | El formulario sigue esperando el bootstrap. El fallback vuelve a esperar sesión e hidratación; no garantiza liberar el formulario en 3 segundos. Falta medir la causa en producción. |
| [Web #165 — Apps activas ausentes del sidebar](https://github.com/jarvinc3/personal-os-web/issues/165)               | P2        | S–M                      | La navegación sigue definida manualmente con Finanzas y Keep Awake.                                                                                                                  |
| [Web #166 — Activación pendiente poco clara](https://github.com/jarvinc3/personal-os-web/issues/166)                 | P2        | S–M                      | El switch solo cambia `pendingEnabled`; se conserva la nota pequeña sobre guardar.                                                                                                   |
| [Web #167 — Textos técnicos o en inglés](https://github.com/jarvinc3/personal-os-web/issues/167)                     | P2        | S                        | Apariencia muestra `fieldGuide`; Proyectos pinta los valores `board/list/timeline`.                                                                                                  |
| [Web #168 — Guardar perfil tarda demasiado](https://github.com/jarvinc3/personal-os-web/issues/168)                  | P2        | S–M                      | Después del PATCH continúa esperando `invalidateQueries()`. La latencia real requiere medición.                                                                                      |
| [Back #25 — Segundo módulo de vida](https://github.com/jarvinc3/personal-os-back/issues/25)                          | P2        | XL                       | No existe el nuevo dominio completo con tablas, CRUD y herramientas IA. Sigue pendiente elegirlo.                                                                                    |
| [Web #155 — Tipos generados desde OpenAPI](https://github.com/jarvinc3/personal-os-web/issues/155)                   | P2*       | M–L                      | No se encontró generación integrada; los tipos continúan mantenidos manualmente.                                                                                                     |
| [Web #160 — Estilos extensibles, Neo-Skeuo y color primario](https://github.com/jarvinc3/personal-os-web/issues/160) | P2*       | L–XL                     | Existe selección claro/oscuro/sistema, pero faltan registro de estilos, Neo-Skeuo y persistencia del primario independiente.                                                         |
| [Back #138 — Herramientas IA de Agenda, Proyectos y Salud](https://github.com/jarvinc3/personal-os-back/issues/138)  | P3*       | L–XL                     | Solo hay herramientas de configuración; depende de implementar los dominios.                                                                                                         |
| [Web #144 — Herramientas IA por módulo](https://github.com/jarvinc3/personal-os-web/issues/144)                      | P3*       | Compartido con Back #138 | Describe esencialmente el mismo pendiente del backend; conviene vincularlos y evitar estimarlos dos veces.                                                                           |
| [Back #137 — Adaptador FCM/APNs](https://github.com/jarvinc3/personal-os-back/issues/137)                            | P3*       | L                        | El envío actual usa Expo y Web Push. El adaptador dedicado depende de retomar un cliente móvil.                                                                                      |

## Orden recomendado

1. **Back #140, Back #155, Web #164 y Web #163** ya están implementados y cerrados.
2. Continuar con **Web #162**.
3. Resolver **Web #161, Web #167 y Web #168**.
4. Separar lo pendiente de **Back #139**.

Los refactors grandes están en P1 en el tablero, pero conviene dividirlos en tareas concretas antes de anteponerlos a los bugs que afectan al usuario.

## Alcance y limitaciones

- La clasificación se basa en evidencia del código y en el contenido de los issues consultados en GitHub. No confirma despliegues ni reproduce los fallos en producción.
- Durante la clasificación no se ejecutaron nuevas pruebas ni se modificaron issues o el tablero.
- Posteriormente se validó Back #140 y se corrigieron Back #155 y Web #164, con sus verificaciones obligatorias en verde. Los cuatro issues quedaron cerrados y este archivo al día.
- Las prioridades propuestas, estimaciones y recomendaciones de este archivo no se aplicaron al tablero.
- Este archivo es una fotografía de la revisión; el seguimiento vigente permanece en GitHub Issues y en el [proyecto Personal OS](https://github.com/users/jarvinc3/projects/3).
