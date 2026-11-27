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

## Glosario

`HELP_TERMS` (`src/modules/help/constants/glossary.ts`) es la única fuente de los términos. El índice los arma por categoría desde `glossary/<id>.ts` y conserva el orden; lo mismo hace `guides.ts` con las áreas de `guides/`. `/help/glossary` los lista con buscador y `?term=slug` resalta una entrada. `GlossaryHelpButton` abre un término en una hoja con `?picker=sheet-glossary:<slug>`, el mismo esquema que usa el header de una hoja para sus conceptos.

El botón de la derecha del header de una hoja es adaptable:

- Si la hoja tiene términos en `SHEET_GLOSSARY_TERMS` (`src/modules/help/constants/sheet-terms.ts`), muestra «?». Abre una hoja anidada con las definiciones y «Preguntar al agente», que abre el overlay de chat con el contexto de la hoja.
- Si la hoja no tiene términos, muestra el icono del agente y abre el overlay directamente.

La decisión sale solo del mapa, no del agente. El mapa no crea términos: cada slug debe existir en `HELP_TERMS`, y `sheet-glossary.spec.ts` falla si un slug no existe o si se repite un término. Para sumar una hoja, se agrega su clave al mapa y se pasa `<SheetHelpAction sheetKey={...} />` en el slot `actions` de su `SheetHeader`.

Estado y trabajo pendiente: GitHub Issues del repo.
