# Estándar documental — Personal OS

Guía para agentes y reviewers. Aplica a `personal-os-back` y, con las mismas reglas de taxonomía, a `personal-os-web`.

## Audiencia

- **Agentes:** reconstruir comportamiento, alcance y evidencia antes de cambiar código.
- **Reviewers:** comprobar que un cambio respeta contratos, reglas y fuera de alcance.

## Navegación

```text
AGENTS.md → docs/README.md → área → módulo → capacidad → código / prueba
```

No inventar comportamiento desde nombres de carpeta. Si falta evidencia, abrir [review-register.md](./review-register.md).

## Propiedad canónica

| Tipo de información | Dueño |
| --- | --- |
| Dominio, API, DTOs, datos, eventos, colas, seguridad, operación backend | `personal-os-back` |
| Rutas, UX, estado cliente, navegador, navegación, consumo de API | `personal-os-web` |

Las referencias cruzadas enlazan al dueño. No duplicar el contrato completo.

## Áreas

| Carpeta | Contenido |
| --- | --- |
| `architecture/` | Cómo se organiza el código de este repo |
| `modules/` | Comportamiento por módulo/capacidad |
| `infrastructure/` | Núcleo transversal (config, health, eventos, DB, WS) |
| `operations/` | Cómo arrancar, operar, probar y diagnosticar |
| `reference/` | Trazabilidad y catálogos que no son runbooks |
| `decisions/` | ADR vigentes |
| `_templates/` | Plantillas; no son fuente de verdad del producto |

## Archivos de un módulo

Obligatorios cuando el módulo existe en código:

- `README.md` — mapa (no monolito)
- `overview.md` — propósito, alcance, fuera de alcance, actores, dependencias
- `status.md` — `implemented` / `in-progress` / `planned` / `blocked` / `deprecated`

Opcionales, solo con contenido real:

- `capabilities/<capacidad>.md`
- `rules/<conjunto>.md`
- `contracts/<superficie>.md`
- `operations/<runbook>.md`
- `decisions/ADR-NNN-*.md`

No crear carpetas vacías como placeholder.

## IDs estables

| Prefijo | Uso | Ejemplo |
| --- | --- | --- |
| `BR-<MOD>-NNN` | Regla de negocio | `BR-FIN-001` |
| `AC-<MOD>-NNN` | Criterio de aceptación | `AC-FIN-014` |
| `ADR-NNN` | Decisión de arquitectura | `ADR-003` |
| `REV-BACK-NNN` / `REV-WEB-NNN` | Hallazgo de revisión | `REV-BACK-007` |

Códigos de módulo: `AUTH`, `USR`, `NTF`, `AI`, `FIN`, `CORE`, `KAW`, `SET`, `HOM`, `LND`, `SHR`.

## Estados de verificación

Cada afirmación funcional se clasifica:

| Estado | Significado |
| --- | --- |
| `VERIFICADO` | Contrastado con código, esquema, prueba o runtime |
| `PARCIALMENTE_IMPLEMENTADO` | Existe en parte |
| `NO_IMPLEMENTADO` | Documentado o decidido, no aplicado |
| `CONTRADICE_CODIGO` | El texto y el código no coinciden |
| `CONTRADICE_RUNTIME` | El comportamiento ejecutado no coincide |
| `NO_VERIFICABLE` | No hay evidencia suficiente |
| `CONTEXTO_NO_APLICABLE` | Pertenece a otro cliente/repo o ya no aplica aquí |

Toda categoría distinta de `VERIFICADO` se registra en `docs/review-register.md` y se resalta en el documento temático:

```markdown
> [!WARNING]
> **REV-BACK-NNN** (`NO_IMPLEMENTADO`) — resumen. Detalle: [review-register.md](./review-register.md)
```

Ninguna afirmación original se elimina sin destino: o vive en un documento vigente, o vive en el registro.

## Criterios de aceptación

Usar Given / When / Then. Enlazar evidencia (`ruta/archivo`, test, o smoke runtime).

## Anti-duplicación

- Un contrato tiene un dueño.
- Pendientes viven en `status.md` o en el registro, no repetidos en tres archivos.
- README de repo: setup + enlace a `docs/README.md`.
- Paths HTTP en backend incluyen el prefijo real (`/api/...` salvo que se declare el controlador sin prefijo).

## Vigencia

Al cambiar código que altera un contrato, regla, ruta o operación, actualizar el documento dueño en el mismo cambio. Si no se puede verificar, añadir un `REV-*` en vez de afirmar.
