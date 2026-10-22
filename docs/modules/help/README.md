# Centro de ayuda (web)

Contenido fijo en la web, sin endpoints. Vive en `src/modules/help/`.

| Documento                  | Contenido                            |
| -------------------------- | ------------------------------------ |
| [content.md](./content.md) | Glosario, guías, preguntas y enlaces |

Rutas:

| Ruta                  | Pantalla              | Contenido                                               |
| --------------------- | --------------------- | ------------------------------------------------------- |
| `/help`               | `help-screen.tsx`     | Entrada con las tres secciones                          |
| `/help/glossary`      | `glossary-screen.tsx` | Glosario con buscador; `?term=slug` resalta una entrada |
| `/help/guides`        | `guides-screen.tsx`   | Instalación, primeros pasos y guías por app             |
| `/help/guides/[slug]` | `guide-screen.tsx`    | Pasos de una guía                                       |
| `/help/faq`           | `faq-screen.tsx`      | Preguntas agrupadas por tema                            |

La entrada está en Ajustes → Ayuda. Las rutas exigen sesión (`proxy.ts`). Las subvistas usan el header secundario; la vuelta regresa a la pantalla anterior y, si no hay historial, al índice.

El botón «?» de Finanzas que debía abrir estos términos (issue web #229) sigue pendiente: depende del desglose del patrimonio (#218) y de los indicadores de descuadre (#215).

Estado y trabajo pendiente: GitHub Issues del repo.
