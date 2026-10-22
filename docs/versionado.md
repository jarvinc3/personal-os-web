# Política de versionado

> **Reglas estrictas para agentes.** Esta política es obligatoria en `personal-os-web` y `personal-os-back` (el contenido es el mismo en ambos repos). Si otra guía contradice este documento, manda este documento. No se interpreta ni se flexibiliza: ante una duda, pregunta al usuario.

## Estado actual

- **Versión actual:** `0.58.1` (2026-10-21).
- **Etapa:** beta (`0.x`).
- El 2026-10-13 se reinició el esquema: las versiones `1.4.0` a `1.19.x` pasaron a ser historial y sus tags se borraron. El historial completo sigue en `CHANGELOG.md`.

## Regla 1: versión y etapa

1. Mientras el proyecto esté en beta, la versión es siempre `0.MINOR.PATCH`.
2. **MINOR** (`0.20.0` → `0.21.0`): una función nueva, una pantalla, un endpoint, una capacidad visible o un módulo nuevo (por ejemplo agenda o proyectos). En `0.x` un cambio que rompe compatibilidad también sube MINOR, y se marca en el changelog.
3. **PATCH** (`0.20.0` → `0.20.1`): correcciones, ajustes visuales, textos, refactors sin cambio de comportamiento y documentación.
4. **Prohibido bajar de versión.** Cada versión nueva es mayor que la anterior. No se reutiliza ni se recrea un tag que ya existió.
5. Cada release lleva, sin excepción:
   - una entrada nueva arriba en `CHANGELOG.md` (`## [X.Y.Z] - AAAA-MM-DD`);
   - `version` de `package.json` (raíz) actualizada a `X.Y.Z`;
   - un commit `chore(release): vX.Y.Z`;
   - el tag `vX.Y.Z` sobre ese commit de release, subido a `origin`.
6. Los paquetes internos del monorepo del back (`packages/*`) se quedan en `0.0.0`; solo se versiona el `package.json` de la raíz.

```bash
# Ejemplo de release PATCH
# 1. CHANGELOG.md: ## [0.20.1] - 2026-10-14
# 2. package.json: "version": "0.20.1"
git add CHANGELOG.md package.json
git commit -m "chore(release): v0.20.1"
git push origin develop
git tag v0.20.1
git push origin v0.20.1
```

| Cambio                                             | Antes    | Después  |
| -------------------------------------------------- | -------- | -------- |
| Corrige el cálculo del saldo de una tarjeta        | `0.20.0` | `0.20.1` |
| Ajusta colores y espaciados de Planificación       | `0.20.1` | `0.20.2` |
| Agrega importación de estados de cuenta            | `0.20.2` | `0.21.0` |
| Agrega el módulo de Agenda                         | `0.21.0` | `0.22.0` |
| Cambia un endpoint de forma incompatible (en beta) | `0.22.0` | `0.23.0` |

## Regla 2: marca de beta

1. El proyecto se marca como **beta** hasta `1.0.0`:
   - `README.md` de cada repo: línea `**Estado:** beta (0.x)`;
   - web: insignia "Beta" junto al nombre "Personal OS" en la barra lateral (`src/shared/components/layout/app-sidebar.tsx`).
2. No se quita ni se oculta la marca de beta mientras la versión sea `0.x`.
3. Al pasar a `1.0.0` (y solo entonces) se quita la marca en el README y en la UI.

## Regla 3: `1.0.0` reservada para el núcleo estable

1. `1.0.0` se usa solo cuando se cumplan **todas** estas condiciones:
   - se usan datos reales, no de prueba;
   - hay backups de la base de datos;
   - hay pruebas E2E del flujo principal en la web;
   - producción lleva varias semanas sin incidentes.
2. **Solo el usuario decide** cuándo pasar a `1.0.0`. Un agente nunca sube a `1.0.0` por su cuenta, aunque crea que se cumplen las condiciones; como mucho lo propone.
3. Después de `1.0.0`:
   - un módulo nuevo o una función nueva sube **MINOR** (`1.0.0` → `1.1.0`);
   - una corrección sube **PATCH** (`1.1.0` → `1.1.1`);
   - solo un cambio que rompe compatibilidad (contrato, DTO, esquema o datos guardados) sube **MAJOR** (`1.4.2` → `2.0.0`).

## Regla 4: hitos de módulos como nombre de release

1. Un módulo nuevo **no** sube MAJOR. Su hito se marca con un nombre de release en el título de la entrada del changelog.
2. Formato: `## [X.Y.Z] - AAAA-MM-DD - Nombre del hito`.

```markdown
## [0.22.0] - 2026-11-02 - Agenda

### Agregado

- Módulo de Agenda: eventos, recordatorios y vista semanal.
```

```markdown
## [0.25.0] - 2026-12-10 - Proyectos

### Agregado

- Módulo de Proyectos: tableros, tareas y estados.
```

Incorrecto: `## [2.0.0] - Agenda` o `## [3.0.0] - Proyectos`.

## Regla 5: notas de usuario (hoja «Novedades»)

1. Cada release agrega una entrada en `src/shared/constants/release-notes.ts`, arriba del arreglo, con la misma versión que `package.json`. Va en español de usuario (se dice **App**, nunca módulo) y explica qué cambió para quien usa la app, no el detalle técnico.
2. `LATEST_RELEASE_VERSION` es la versión de la primera entrada y debe coincidir con `package.json`; la prueba `src/shared/lib/release-notes.spec.ts` lo verifica.
3. La hoja se muestra una sola vez por versión: compara `LATEST_RELEASE_VERSION` con `lastSeenReleaseVersion` del perfil (`GET /users/me`). Al cerrarla se marca como vista con `PATCH /users/me/release-notes-seen`. En la **primera visita** (`null`) la versión actual se marca en silencio, sin hoja; una versión sin notas curadas también se marca en silencio. `localStorage` (clave `releaseNotesSeenVersion`) queda solo como caché para no mostrar la hoja mientras responde el perfil.
4. La hoja vive en el shell autenticado (`app/(app)/layout.tsx`): no aparece en rutas públicas.

## Lista de verificación del agente

- [ ] La versión nueva es mayor que la actual y sigue `0.MINOR.PATCH`.
- [ ] Elegí MINOR o PATCH según la regla 1.
- [ ] `CHANGELOG.md` y `package.json` dicen la misma versión.
- [ ] Commit `chore(release): vX.Y.Z`, push de `develop`, tag `vX.Y.Z` y push del tag.
- [ ] La marca de beta sigue en el README (y en la UI de la web).
- [ ] Si el release trae cambios visibles, agregué su entrada en `src/shared/constants/release-notes.ts` (regla 5).
- [ ] No subí a `1.0.0` sin que el usuario lo pidiera.
