# Centro de ayuda — contenido

Todos los textos viven en `src/modules/help/constants/`:

| Archivo          | Contenido                                                                  |
| ---------------- | -------------------------------------------------------------------------- |
| `glossary.ts`    | Índice de términos y categorías; cada categoría vive en `glossary/<id>.ts` |
| `guides.ts`      | Índice de grupos; cada área de las guías vive en `guides/<área>.ts`        |
| `faq.ts`         | Grupos de preguntas y respuestas                                           |
| `sheet-terms.ts` | Qué términos explica cada hoja de Finanzas                                 |

No se escribe copy de estas pantallas en los `.tsx`.

## Enlaces internos

Dentro de una definición, un paso o una respuesta se puede enlazar otra entrada con dos formas:

- `[[texto|slug]]` abre un término del glosario.
- `[[texto|guia:slug]]` abre una guía.

`parseHelpText` (`src/modules/help/lib/help-text.ts`) convierte el texto en segmentos y `HelpRichText` pinta los enlaces. `content.spec.ts` comprueba que cada slug existe y que no hay términos, guías ni preguntas duplicadas: un enlace roto falla en `pnpm test`, no en pantalla.

## Búsqueda y enlace directo

`filterHelpTerms` ignora mayúsculas y acentos con `foldSearchText` (`src/shared/lib/search-text.ts`) y busca en el término, sus sinónimos y la definición. `groupHelpTerms` respeta el orden de `HELP_TERM_CATEGORIES`.

`/help/glossary?term=slug` marca la entrada, la desplaza al centro y mantiene el buscador. Un enlace relacionado limpia la búsqueda antes de navegar para que el destino se vea.

## Glosario en las hojas

`SHEET_GLOSSARY_TERMS` (`src/modules/help/constants/sheet-terms.ts`) relaciona la clave de una hoja de Finanzas con los slugs que explica. El header de esa hoja muestra «?» y la hoja anidada lista solo esas definiciones; «Preguntar al agente» abre el overlay con el contexto de la hoja. Una hoja sin entrada conserva el icono del agente.

El mapa no crea términos: cada slug debe existir en `HELP_TERMS`. `sheet-glossary.spec.ts` falla si un slug no existe o si se repite un término.

## Alcance del contenido

El glosario cubre los conceptos que aparecen en pantalla, no todo el modelo interno. Las guías explican flujos que ya existen en Finanzas y en Ajustes; si un flujo cambia, se actualiza el texto en el mismo cambio de código.
