# Convenciones de issues en GitHub

Guía para abrir y editar issues en `personal-os-back` y `personal-os-web`. Está referenciada desde `AGENTS.md` y aplica a los dos repositorios del workspace.

Un issue de calidad permite que quien lo lee entienda **quién necesita algo, qué resultado espera, por qué importa y cómo comprobar que está completo**, sin reconstruir la intención desde conversaciones, código o comentarios.

## Flujo rápido

Antes de abrir o editar un issue:

1. Busca duplicados abiertos y cerrados: por título, por área y por número de versión del `CHANGELOG`.
2. Elige el repositorio dueño del entregable: `back` para dominio, API, Prisma, colas e IA; `web` para pantallas, rutas y estado del cliente.
3. Identifica a quién le sirve y redacta una sola necesidad.
4. Escribe un **título** orientado al resultado.
5. Completa el cuerpo con alcance, reglas de negocio, criterios de aceptación, dependencias y fuera de alcance.
6. Añade etiquetas de tipo y área, ponlo en el proyecto con Estado, Prioridad y Talla, y asígnalo al milestone si pertenece a una entrega.
7. Enlaza los prerrequisitos como dependencias o déjalos como sub-issues.
8. Revisa el issue con la checklist de calidad antes de guardarlo.

El issue está listo cuando otra persona puede explicar el resultado esperado y diseñar sus pruebas leyendo únicamente el issue y sus enlaces.

## Estructura estándar

Usa esta plantilla para capacidades y para trabajo técnico que entrega algo observable:

```md
Como <persona>, quiero <capacidad>, para <resultado o valor verificable>.

## Contexto

<Por qué se necesita ahora. Inclúyelo solo cuando evita una ambigüedad real.>

## Alcance

- <Comportamiento o capacidad incluida>
- <Estado, validación o interacción relevante>

## Reglas de negocio

- <Regla que debe cumplirse siempre>
- <Permiso, restricción, precedencia o caso límite relevante>

## Criterios de aceptación

- Dado <contexto>, cuando <acción>, entonces <resultado observable>.
- <Otro criterio independiente y verificable>.

## Dependencias

- `#<número>` — <qué debe existir primero>.

## Fuera de alcance

- <Trabajo cercano que este issue no resolverá>.
```

Reglas de uso:

- La oración de historia, `Alcance` y `Criterios de aceptación` son obligatorios.
- `Contexto`, `Reglas de negocio`, `Dependencias` y `Fuera de alcance` se incluyen cuando aportan información real. No dejes secciones vacías.
- Un issue expresa una necesidad principal. Si contiene resultados independientes, divídelo y enlázalo.
- Mantén schema, API, pantalla y flujos operativos en issues separados, salvo que el alcance aprobado los combine explícitamente.

## Cómo redactar la historia

Usa esta estructura:

`Como <persona>, quiero <capacidad>, para <resultado o valor verificable>.`

### Persona: quién recibe el valor

- Elige la persona más específica cuyo flujo mejora.
- Nombra el rol, no el equipo que implementa ni un módulo del código.
- No uses `Como equipo de backend`.
- Usa el nombre de la app (`Finanzas`, `Agenda`, `Proyectos`, `Salud`) solo cuando la persona se identifique con ella; si no, describe el rol: `dueño de la cuenta`, `desarrollador`.
- Usa `desarrollador` únicamente cuando el valor sea habilitación técnica: contratos, schemas, migraciones, APIs, infraestructura, refactors, pruebas o tooling.
- Si varios roles se benefician, usa el actor principal en la historia y menciona los demás en alcance o criterios.

### Capacidad: qué necesita lograr

- Describe una acción o resultado del usuario, no una pantalla, endpoint, tabla o clase.
- Usa un verbo preciso: consultar, registrar, asignar, confirmar, revertir, configurar.
- Evita verbos vagos como mejorar, manejar, soportar, optimizar o gestionar sin explicar qué cambia.
- Mantén el alcance concreto: una capacidad principal con límites reconocibles.

### Valor: para qué lo necesita

- Explica la consecuencia útil de la capacidad.
- Debe responder por qué el issue importa para el actor o para el negocio.
- Evita cierres circulares como `para poder usar la funcionalidad` o `para mejorar el sistema`.
- No prometas métricas o beneficios que el issue no puede comprobar.

### Ejemplo

**Débil — describe una solución:**

> Como usuario, quiero un endpoint de presupuestos y un botón en el inicio, para gestionar los gastos.

**Fuerte — expresa necesidad y valor:**

> Como dueño de la cuenta, quiero ver cuánto llevo gastado del presupuesto de Alimentación este mes, para decidir si me queda margen antes de la quincena.

La historia fuerte permite cambiar la implementación sin cambiar la necesidad.

## Cómo escribir el título

El título debe permitir reconocer el resultado en la lista de issues sin abrirlo.

- Empieza con un verbo en infinitivo o una capacidad nominal clara.
- Nombra el resultado y el objeto de negocio.
- Conserva los términos del dominio: la interfaz dice **app**, el código dice `module` (ver [glosario.md](./glosario.md)).
- Escribe «movimiento», «cuenta», «tarjeta», «presupuesto», «meta de ahorro» como los usa la interfaz; `FinTransaction`, `fin_accounts` y similares son nombres de modelo y se conservan tal cual.
- Evita nombres de archivo, clases, librerías, comandos y detalles incidentales.
- Incluye tecnología solo cuando define el entregable y no existe una forma de expresarlo como capacidad.

| Evitar                                 | Preferir                                                         |
| -------------------------------------- | ---------------------------------------------------------------- |
| `Crear endpoint POST /finance/budgets` | `Permitir fijar un límite mensual por categoría`                 |
| `Cambios en weekly-summary.tsx`        | `Mostrar el gasto de la semana agrupado por categoría`           |
| `Fix de query de transacciones`        | `Corregir movimientos omitidos al filtrar por tarjeta`           |
| `Implementar ingesta de correo con IA` | `Importar movimientos desde los correos del banco`               |
| `Agregar columna en FinEmailMessage`   | `Evitar que dos lecturas del mismo correo creen dos movimientos` |

## Qué incluir en el issue

Incluye la información necesaria para decidir y verificar el comportamiento:

- La necesidad, persona y valor esperado.
- El comportamiento actual y el esperado, cuando el contraste sea relevante.
- Los estados iniciales y finales que cambian.
- Reglas de negocio, permisos, restricciones y precedencias.
- Validaciones y respuestas esperadas ante entradas inválidas o acciones no autorizadas.
- Casos límite que cambien el resultado: ausencia de datos, reintentos, concurrencia, vencimiento, duplicados o límites.
- Persistencia o idempotencia cuando sean observables para el usuario o críticas para el negocio.
- Dependencias con una frase que explique por qué bloquean.
- Contratos técnicos concretos solo en issues técnicos o cuando otro sistema dependa de ellos.
- Fuera de alcance para separar trabajo cercano que podría confundirse con este issue.

### Reglas de negocio frente a detalles técnicos

Una regla de negocio debe sobrevivir a un cambio de implementación.

**Regla de negocio:**

> Un movimiento toca exactamente una cuenta o una tarjeta, nunca ambas.

**Detalle de implementación que no pertenece al requisito funcional:**

> Añadir un `CHECK` que garantice que `account_id` y `card_id` no vienen ambos.

En un issue técnico, la restricción puede aparecer como criterio si es el entregable. En una capacidad funcional, pertenece al diseño, al ADR o al PR.

## Qué no incluir

Mantén fuera del cuerpo del issue:

- Una solución técnica especulativa cuando todavía no se ha tomado esa decisión.
- Rutas de archivos, números de línea, hashes de commit o listas de clases a modificar.
- Logs, salidas de consola y resultados de comandos rutinarios.
- Decisiones arquitectónicas extensas, alternativas descartadas o razonamientos de diseño; colócalos en un ADR o spec y enlázalos.
- Checklists de implementación interna que conviertan la historia en instrucciones paso a paso.
- Criterios como `hacer pruebas`, `ejecutar lint` o `actualizar documentación` cuando solo forman parte de la Definition of Done. Las pruebas deben derivarse del comportamiento esperado.
- Frases de relleno como `según mejores prácticas`, `de forma correcta`, `si aplica`, `etc.` o `manejar todos los errores`.
- Información duplicada entre contexto, alcance y criterios de aceptación.
- Trabajo futuro hipotético que no sea necesario para delimitar el alcance actual.

| Información                                               | Lugar correcto       |
| --------------------------------------------------------- | -------------------- |
| Necesidad, alcance, reglas y resultados verificables      | Issue de GitHub      |
| Decisión arquitectónica y alternativas                    | ADR o spec enlazado  |
| Archivos modificados, estrategia y comandos de validación | Pull request         |
| Cambio atómico implementado                               | Commit del release   |
| Progreso observable y bloqueos                            | Comentario del issue |

## Cómo escribir requisitos y alcance

`Alcance` describe **qué capacidades se entregan**. `Reglas de negocio` describe **qué condiciones gobiernan esas capacidades**.

### Alcance

- Escribe bullets independientes y orientados a comportamiento.
- Define qué puede hacer o ver el actor y qué estado cambia.
- Incluye lectura, escritura y feedback solo cuando forman parte de la misma capacidad.
- Evita repetir los criterios de aceptación palabra por palabra.

**Débil:**

> Implementar frontend, backend y base de datos para los presupuestos.

**Fuerte:**

- El dueño de la cuenta puede fijar un límite mensual a una categoría de gasto.
- El resumen del inicio muestra el avance del presupuesto con el gasto a la fecha.
- Al editar el límite, el avance se recalcula en la siguiente lectura.

### Reglas de negocio

Documenta únicamente reglas que cambian decisiones o resultados:

- Quién puede ejecutar la acción.
- Qué precondiciones deben cumplirse.
- Qué combinaciones están permitidas o prohibidas.
- Qué regla gana cuando existen varias fuentes o estados.
- Qué ocurre ante repetición, conflicto, vencimiento o cierre.
- Qué dato o sistema es la fuente de verdad.

Evita convertir esta sección en un diseño de tablas o algoritmo.

## Cómo escribir mejores criterios de aceptación

Los criterios de aceptación son el contrato observable. Definen las condiciones necesarias para considerar completo el issue; no describen cómo programarlo.

### Regla de construcción

Cada criterio debe contener:

1. **Contexto o precondición**: estado relevante antes de actuar.
2. **Acción o evento**: qué hace el actor o qué ocurre.
3. **Resultado observable**: qué cambia, qué se muestra o qué se rechaza.

Usa `Dado / Cuando / Entonces` cuando haya varias condiciones o estados. Para comportamientos simples, puede usarse un bullet directo si conserva esas tres partes.

```md
- Dado un presupuesto de Alimentación sin gastos del mes, cuando abro el inicio, entonces muestra 0 % usado y el límite completo disponible.
- Dado el mismo presupuesto con gastos que superan el límite, cuando abro el inicio, entonces el avance aparece marcado y no desaparece el límite.
- Dado un movimiento sin categoría, cuando se registra, entonces no altera el avance de ningún presupuesto.
```

### Cobertura relevante

No todos los issues necesitan todos los casos. Elige los que puedan cambiar el resultado:

- Camino principal exitoso.
- Permisos y visibilidad por usuario o app habilitada.
- Validaciones y mensajes que permiten recuperarse.
- Estado vacío o ausencia de datos.
- Persistencia después de recargar o volver a consultar.
- Reintentos e idempotencia.
- Conflictos o concurrencia.
- Fechas, vigencia, zona horaria o límites.
- Integración y degradación cuando una dependencia falla, por ejemplo el proveedor de IA o el correo del banco.
- Compatibilidad o paridad acordada.

### Calidad de cada criterio

Un criterio bueno es:

- **Observable**: puede comprobarse desde la interfaz o desde una respuesta de la API.
- **Específico**: identifica el estado, acción y resultado sin palabras ambiguas.
- **Independiente**: comprueba una regla principal; no agrupa cinco comportamientos con `y`.
- **Determinista**: dos personas llegan a la misma conclusión sobre si pasa o falla.
- **Trazable**: corresponde a un punto del alcance o una regla de negocio.
- **Neutral a la implementación**: permite cambiar la solución sin cambiar el comportamiento esperado.

### Anti-patrones

| Evitar                                   | Problema               | Reescribir como                                      |
| ---------------------------------------- | ---------------------- | ---------------------------------------------------- |
| `La funcionalidad trabaja correctamente` | No define resultado    | Estado, acción y resultado esperados                 |
| `La URL se ve bien`                      | No es verificable      | Acción que el usuario completa y feedback que recibe |
| `Manejar errores`                        | No dice cuáles ni cómo | Condición de error y estado visible posterior        |
| `Crear endpoint, tabla y pruebas`        | Checklist técnica      | Comportamiento contractual que esas piezas habilitan |
| `Debe funcionar para todos los casos`    | Alcance ilimitado      | Casos relevantes enumerados                          |
| `Según el diseño`                        | Oculta el contrato     | Regla concreta o enlace a una decisión específica    |

### Separar aceptación de verificación técnica

- **Criterio de aceptación**: `Un usuario sin la app finance habilitada recibe 403 y la pantalla muestra que la app está apagada.`
- **Prueba derivada**: test del guard que demuestra ese criterio.
- **Verificación de PR**: typecheck, lint, build y suites ejecutadas.

Los comandos y herramientas pueden cambiar; el comportamiento aceptado debe permanecer estable.

## Checklist de calidad del issue

Antes de guardar, confirma:

- [ ] La persona es específica y recibe el valor.
- [ ] La capacidad describe un objetivo, no una solución técnica.
- [ ] El `para` expresa un valor o resultado real.
- [ ] El título permite reconocer el entregable sin abrir el issue.
- [ ] El alcance contiene una sola necesidad principal y límites claros.
- [ ] Las reglas de negocio relevantes están explícitas.
- [ ] Cada criterio puede pasar o fallar de forma objetiva.
- [ ] Los criterios cubren los errores y casos límite que cambian el resultado.
- [ ] Cada criterio corresponde al alcance y no introduce trabajo nuevo.
- [ ] Los detalles técnicos aparecen solo cuando son contrato o entregable técnico.
- [ ] Las dependencias están enlazadas y explicadas.
- [ ] El fuera de alcance evita confusiones reales.
- [ ] Tipo, área, prioridad, talla y milestone son correctos.

## Tipos de issue

### Capacidad técnica

Puede usar `desarrollador` como persona cuando existe un consumidor y un valor técnico verificable:

> Como desarrollador, quiero consultar los movimientos de una tarjeta con un contrato estable, para que la pantalla de detalle no duplique reglas de saldo.

En estos issues sí pueden incluirse contratos, rutas, schemas, constraints o migraciones cuando definen la entrega. Explica siempre qué capacidad habilitan.

### Bug

Un bug no necesita forzar la fórmula de historia de usuario. Incluye:

```md
## Comportamiento observado

<Qué ocurre y a quién afecta.>

## Comportamiento esperado

<Resultado correcto y verificable.>

## Pasos para reproducir

1. <Estado inicial>
2. <Acción>
3. <Resultado observado>

## Impacto

<Frecuencia, usuarios afectados y bloqueo operativo.>

## Criterios de aceptación

- <Prueba observable de la corrección y ausencia de regresión relevante.>
```

Adjunta datos mínimos anonimizados para reproducir. No copies secretos, tokens, datos personales innecesarios ni logs completos.

### Tarea interna

Refactor, tooling o documentación que no cambia el comportamiento observable. No exige historia de usuario; sí exige decir qué se simplifica y qué debe seguir funcionando igual.

## Personas

- `dueño de la cuenta`: la persona que usa Personal OS y ve su dinero, su agenda, sus proyectos o su salud. Es la persona por defecto.
- `desarrollador`: implementa o consume capacidades técnicas del workspace. Úsalo solo cuando el valor sea habilitación técnica.

Evita inventar roles que el producto no tiene. Si el valor es para un módulo concreto, dilo en el alcance, no en la persona.

## Propiedad de repositorios

- `personal-os-back` contiene dominio, REST, Prisma, migraciones, eventos, colas, autenticación, seguridad, IA y notificaciones.
- `personal-os-web` contiene pantallas Next.js, rutas, estado del cliente, API client, push del navegador y proxy.
- Un cambio end-to-end se divide en dos issues enlazados: el del back define el contrato y el comportamiento de servidor; el de web lo consume. El de back bloquea al de web.

Cada issue vive en el repositorio que lo resuelve. No abras el mismo issue en los dos.

## Entregas y milestones

- Un milestone es **una entrega**, con fecha y un resultado reconocible. No un milestone por iniciativa ni por persona.
- Un issue pertenece a un solo milestone; si no pertenece a ninguno, queda fuera de la entrega.
- El milestone no reemplaza al issue: el resultado y los criterios viven en el cuerpo.

## Etiquetas: taxonomía cerrada

Solo se permiten estas etiquetas; cada dimensión es opcional y un issue puede combinarlas:

- **Tipo**: `feature`, `bug`, `chore`, `docs`.
- **Área**: `finance`, `agenda`, `projects`, `health`, `ai`, `notifications`, `users`, `core`. Nombra la app de producto o el paquete del workspace que el issue toca; `agenda`, `projects` y `health` son apps, `core` es un paquete del backend.
- **Estado del roadmap**: `roadmap`, para lo decidido y todavía no implementado.

No uses `backend`, `database`, `frontend`, `ui` ni `api`: el repositorio ya dice dónde vive el trabajo y el área dice qué toca.

## Prioridad y talla

La prioridad expresa impacto y urgencia, no dificultad técnica. La talla expresa tamaño, no importancia.

**Prioridad** (campo del proyecto):

- **High**: bloquea la entrega en curso o el trabajo de otra persona.
- **Medium**: trabajo normal de la entrega; es el valor por defecto.
- **Low**: mejora sin fecha comprometida.

**Talla** (campo del proyecto):

- **S**: un par de archivos, sin migración ni cambio de contrato.
- **M**: toca un contrato HTTP, una migración o más de un paquete del workspace.
- **L**: cruza back y web, o no cabe en un PR revisable. Pártelo en sub-issues.

No se estiman horas ni se registra tiempo: el repositorio mide releases, no jornadas.

## Proyecto y estados

El tablero es un GitHub Project del workspace con estos estados:

- **Todo**: definido y sin empezar.
- **In Progress**: alguien lo tiene abierto.
- **Done**: implementado y verificado.

Reglas:

- Un issue en `Done` sin PR necesita un comentario que diga cómo se verificó.
- Un issue cerrado sin implementar se cierra como `not planned` y no pasa por `Done`.
- La columna no sustituye al cuerpo: si el estado cambió, el comentario dice qué cambió.

## Dependencias y sub-issues

- Una entrega grande se parte en **sub-issues**; el issue padre describe el resultado y cada hijo una parte.
- Un prerrequisito real se marca como **blocked by**. Si el repositorio no tiene las dependencias activadas, escribe `Bloqueado por #<número>` en el cuerpo.
- La dependencia siempre lleva una frase: sin ella, el lector no sabe si bloquea de verdad o es cortesía.
- No enlaces issues que solo comparten tema. Un enlace significa que uno necesita al otro.

## Traslado y cierre

Cuando un issue está en el repositorio equivocado o fue reemplazado, conserva la trazabilidad sin presentarlo como trabajo implementado.

1. Abre el reemplazo en el repositorio correcto con cuerpo, etiquetas y talla propias.
2. Enlaza origen y reemplazo en ambos cuerpos.
3. En el origen:
   - Cambia el título a `[Trasladado a <repo>#<número>] <título original>`.
   - Sustituye el cuerpo por el motivo y el enlace al reemplazo.
   - Quita etiquetas de área y milestone.
4. Cierra el origen como `not planned`.

Un duplicado se cierra como `duplicate` con enlace al que se queda.

## Cierre y referencia desde el código

- `Closes #<número>` en el cuerpo del PR o del commit cuando el cambio resuelve el issue.
- `Refs #<número>` mientras solo avanza.
- Un commit del workspace referencia el issue por número y repositorio cuando el issue no vive donde está el commit.
- No cierres un issue a mano si el PR ya lo cierra.

## Comentarios y actualizaciones de progreso

Los comentarios comunican progreso observable; no sustituyen commits ni PRs.

Usa encabezados fechados:

- `## Progreso (YYYY-MM-DD)` para el primer avance.
- `## Actualización (YYYY-MM-DD)` para avances posteriores.
- `## Bloqueo activo (YYYY-MM-DD)` y `## Desbloqueo (YYYY-MM-DD)` cuando corresponda.

Estructura cada comentario con:

- **Hecho**: comportamiento observable disponible.
- **Pendiente vs criterios**: criterio faltante y issue bloqueante, si lo hay.
- Una frase de estado: `Pasa a **Done**`, `Sigue en **In Progress** hasta...` o `Vuelve a **Todo** porque...`.

No incluyas rutas, tablas, clases, migraciones, librerías, hashes, archivos, comandos ni logs. Esos detalles pertenecen al commit o al PR.

**Ejemplo:**

```md
## Actualización (2026-10-20)

**Hecho**

- El resumen del inicio muestra el avance del presupuesto por categoría.
- El avance se recalcula al registrar un movimiento, sin recargar la página.

**Pendiente vs criterios**

- Queda el criterio del presupuesto con arrastre; depende de #612.

Pasa a **In Progress** hasta cerrar ese criterio.
```

## Plantillas

Las plantillas viven en `.github/ISSUE_TEMPLATE/` de cada repositorio:

- `feature.yml` — capacidad, con historia, alcance, reglas y criterios.
- `bug.yml` — fallo, con comportamiento observado, esperado y pasos.

Al abrir un issue desde GitHub, elige la plantilla y completa los campos. Si algo no aplica, escribe `No aplica` y explica por qué en una frase; no dejes el campo vacío.
