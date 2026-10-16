# Documentación — personal-os-web

Cliente **Next.js 16** de Personal OS. Estándar: [documentation-standard.md](./documentation-standard.md).

Dominio/API: repositorio hermano `personal-os-back` → `docs/README.md`.

| Área                                          | Para qué                                                        |
| --------------------------------------------- | --------------------------------------------------------------- |
| [architecture/](./architecture/README.md)     | App Router, módulos, chrome compartido                          |
| [modules/](./modules/README.md)               | auth, settings, notifications, ai, finance, keep-awake, home    |
| [infrastructure/](./infrastructure/README.md) | API client, auth bootstrap, push, proxy                         |
| [operations/](./operations/README.md)         | Runbook Next.js                                                 |
| [reference/](./reference/README.md)           | Trazabilidad y guía del changelog                               |
| [archive/](./archive/)                        | Pendientes, registro de revisión, auditorías y mockups cerrados |
| [glosario.md](./glosario.md)                  | App vs módulo: qué dice la interfaz y qué el código             |
| [decisions/](./decisions/README.md)           | ADR                                                             |

Estado, roadmap y hallazgos: GitHub Issues del repositorio (label `roadmap`). Los documentos de trabajo que se cierran pasan a `archive/`.

Este repo **no** es `personal-os-app` (React Native).
