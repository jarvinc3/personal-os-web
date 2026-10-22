# Centro de ayuda — contenido

Todos los textos viven en `src/modules/help/constants/`:

| Archivo       | Contenido                                               |
| ------------- | ------------------------------------------------------- |
| `glossary.ts` | Términos, categorías, sinónimos y términos relacionados |
| `guides.ts`   | Grupos y pasos de las guías                             |
| `faq.ts`      | Grupos de preguntas y respuestas                        |

No se escribe copy de estas pantallas en los `.tsx`.

## Enlaces internos

Dentro de una definición, un paso o una respuesta se puede enlazar otra entrada con dos formas:

- `[[texto|slug]]` abre un término del glosario.
- `[[texto|guia:slug]]` abre una guía.

`parseHelpText` (`src/modules/help/lib/help-text.ts`) convierte el texto en segmentos y `HelpRichText` pinta los enlaces. `content.spec.ts` comprueba que cada slug existe y que no hay términos, guías ni preguntas duplicadas: un enlace roto falla en `pnpm test`, no en pantalla.

## Búsqueda y enlace directo

`filterHelpTerms` ignora mayúsculas y acentos con `foldSearchText` (`src/shared/lib/search-text.ts`) y busca en el término, sus sinónimos y la definición. `groupHelpTerms` respeta el orden de `HELP_TERM_CATEGORIES`.

`/help/glossary?term=slug` marca la entrada, la desplaza al centro y mantiene el buscador. Un enlace relacionado limpia la búsqueda antes de navegar para que el destino se vea.

## Alcance del contenido

El glosario cubre los conceptos que aparecen en pantalla, no todo el modelo interno. Las guías explican flujos que ya existen en Finanzas y en Ajustes; si un flujo cambia, se actualiza el texto en el mismo cambio de código.
