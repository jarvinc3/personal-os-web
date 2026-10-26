# Galerías de referencia

Herramienta de referencia visual, permanente y visible en producción. Se abre solo desde Ajustes → Apariencia, con un atajo por galería. No lee ni escribe datos del usuario ni llama al back.

- `cards/`: cards reales de cada entidad con sus variantes (#272). Rutas: `/settings/appearance/cards` y `/settings/appearance/cards/<entidad>`.
- `components/`: componentes compartidos por propósito (#307). Rutas: `/settings/appearance/components` con la lista de categorías y un buscador, y `/settings/appearance/components/<categoría>` con sus fichas (#341).
- Datos: `cards/mock/` y `components/mock/`, siempre falsos y con formato de moneda y fecha fijos. No dependen del perfil ni del día.
- Toques: no ejecutan la acción real; muestran «Toque simulado» (`cards/gallery-tap.tsx` y `components/simulated-tap.ts`).
- Sheets de ejemplo: se abren con `useSheetParam` (`?sheet=ejemplo&sheetId=…`), así la URL cambia y Atrás los cierra.

## Mantener la galería de cards

Cada sub-issue de #271 actualiza su entrada con las variantes definitivas del componente real. Al añadir o cambiar una variante:

1. Añade o ajusta el variant en `cards/variants/<entidad>.tsx` con `label`, `propLabel`, `height` y `render`.
2. Usa la card real del módulo; solo si no existe todavía, un borrador de `cards/drafts/` con `isDraft: true`. Los borradores muestran la marca «Borrador» y desaparecen cuando su issue los mueve al módulo.
3. Comprueba en `/settings/appearance/cards/<entidad>` que se pinta con datos de ejemplo y sin desbordes a 360 px.

## Mantener la galería de componentes

1. Monta el componente real; no hay maquetas aparte.
2. Añade la ficha en la sección que le corresponde por propósito y escribe su ruta de importación real.
3. Suma el nombre de la ficha a `demos` de su sección en `components/sections.ts`: de ahí salen el conteo de la lista y el buscador, y un test comprueba que coincida con los `GalleryDemo` del archivo.
4. Muestra sus variantes y estados principales: normal, seleccionado, deshabilitado, error y pending.
5. Comprueba a 360 px, en claro y oscuro, que no hay desbordes y que el texto se lee.
