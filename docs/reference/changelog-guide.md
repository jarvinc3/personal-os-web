# Guía del CHANGELOG

Formato y reglas para `CHANGELOG.md` y para la versión de `package.json`. Léelo completo antes de cerrar una sesión.

## Reglas

- Un release por sesión de agente, aunque el cambio sea pequeño.
- La versión vive en `package.json`, en la raíz del repositorio. Una sola versión para todo el repo.
- El bump es el más alto de la sesión:
  - `MAJOR`: rompe un contrato o los datos guardados (endpoint, DTO, esquema, formato de un campo) y un cliente anterior deja de funcionar.
  - `MINOR`: agrega una función, una pantalla, un endpoint o una capacidad visible.
  - `PATCH`: corrección, texto, estilo, refactor sin cambio de comportamiento, documentación.
- El `CHANGELOG.md` va en español, de la versión más nueva a la más vieja.
- Cada versión lleva su fecha en `AAAA-MM-DD`.
- Las secciones que no aplican no se escriben.
- El tag de git es `vX.Y.Z` y se crea después del commit del release.
- `personal-os-app` está fuera de servicio y no sigue esta regla.

## Secciones

| Sección | Cuándo |
| --- | --- |
| `Agregado` | algo nuevo para quien usa la app |
| `Cambiado` | un comportamiento existente que cambia |
| `Obsoleto` | algo que sigue funcionando pero se va a quitar |
| `Eliminado` | algo que se quitó |
| `Corregido` | un fallo que se arregló |
| `Seguridad` | un problema de seguridad |

## Ejemplo

```markdown
# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y [SemVer](https://semver.org/lang/es/).

## [1.4.0] - 2026-10-12

### Agregado

- Deshacer después de eliminar: cada borrado guarda un snapshot y el toast permite reponerlo.

### Corregido

- El asistente de préstamo rechaza un saldo mayor que el monto original.

## [1.3.2] - 2026-09-16

### Cambiado

- El detalle de tarjeta muestra la deuda usada en lugar del disponible.
```

## Pasos al cerrar la sesión

1. Elige el bump más alto de la sesión.
2. Agrega la entrada arriba del todo en `CHANGELOG.md`, con la versión nueva y la fecha de hoy.
3. Sube `version` en `package.json`.
4. Commitea `chore(release): vX.Y.Z`.
5. Crea el tag: `git tag vX.Y.Z`.
