# Landing

Marketing y legal bajo `app/(landing)/`.

| Documento                                                      | Contenido                       |
| -------------------------------------------------------------- | ------------------------------- |
| [overview.md](./overview.md)                                   | Marketing y legal               |
| [status.md](./status.md)                                       | Estado                          |
| [capabilities/public-pages.md](./capabilities/public-pages.md) | Proxy, waitlist, delete-account |
| [rules/access.md](./rules/access.md)                           | Público vs sesión               |

Código: `src/modules/landing/`. Datos: `modules-data.ts`, `faq-data.ts`, `site-info.ts`. Spec: `modules-data.spec.ts`. Contacto: UI local (sin API de tickets verificada). Waitlist: [#145](https://github.com/jarvinc3/personal-os-web/issues/145).

> [!NOTE]
> Este módulo migra a un repositorio Astro propio de la landing. Mientras ese repo no exista, los documentos se quedan aquí; al migrar se borran de este repo.
