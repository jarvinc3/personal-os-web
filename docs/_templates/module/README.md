# `<Module>` — mapa

Índice del módulo. Mantener corto. El detalle vive en los archivos enlazados.

| Documento | Contenido |
| --- | --- |
| [overview.md](./overview.md) | Propósito, alcance, fuera de alcance |
| [status.md](./status.md) | Implementado / en curso / pendiente / bloqueado |
| `capabilities/` | Flujos atómicos |
| `rules/` | Reglas de negocio |
| `contracts/` | Superficie pública (HTTP, façade, UI) |
| `operations/` | Runbooks |
| `decisions/` | ADR del módulo |

**Código:** `src/modules/<slug>/`  
**Chrome web:** si el módulo tiene secciones, seguir [architecture/module-conventions.md](../../architecture/module-conventions.md).  
**Dueño canónico de dominio/API:** backend, salvo módulos client-only.
