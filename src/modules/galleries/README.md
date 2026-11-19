# Galerías de referencia

Herramienta de referencia visual, permanente y visible en producción. Se abre solo desde Ajustes → Apariencia, con un atajo por galería. No lee ni escribe datos del usuario ni llama al back.

- `cards/`: cards reales de cada entidad con sus variantes (#272). Rutas: `/settings/appearance/cards` y `/settings/appearance/cards/<entidad>`.
- `components/`: componentes compartidos por propósito (#307, #341, #417). Rutas:
  - `/settings/appearance/components`: índice con búsqueda de todos los componentes de `src/shared/components/ui/` y de los wrappers de dominio.
  - `/settings/appearance/components/<categoría>`: fichas de una categoría.
  - `/settings/appearance/components/<categoría>/<componente>`: documentación del componente con vista previa y código, descripción, uso copiable, composición, variantes y estados, y API.
- Datos: `cards/mock/` y `components/mock/`, siempre falsos y con formato de moneda y fecha fijos. No dependen del perfil ni del día.
- Toques: no ejecutan la acción real; muestran «Toque simulado» (`cards/gallery-tap.tsx` y `components/simulated-tap.ts`).
- Sheets de ejemplo: se abren con `useSheetParam` (`?sheet=ejemplo&sheetId=…`), así la URL cambia y Atrás los cierra.

## Mantener la galería de cards

Cada sub-issue de #271 actualiza su entrada con las variantes definitivas del componente real. Al añadir o cambiar una variante:

1. Añade o ajusta el variant en `cards/variants/<entidad>.tsx` con `label`, `propLabel`, `height` y `render`.
2. Usa la card real del módulo; solo si no existe todavía, un borrador de `cards/drafts/` con `isDraft: true`. Los borradores muestran la marca «Borrador» y desaparecen cuando su issue los mueve al módulo.
3. Comprueba en `/settings/appearance/cards/<entidad>` que se pinta con datos de ejemplo y sin desbordes a 360 px.

## Mantener la galería de componentes

El catálogo vive en `components/catalog/` y tiene dos piezas separadas:

1. **Metadatos** en `catalog/entries/<categoría>.ts`: nombre, categoría, descripción, cuándo usarlo y cuándo no, snippet, subcomponentes, anatomía, variantes, props e import. Sin JSX, para que las pruebas crucen el catálogo con `/ui/` sin ejecutar React.
2. **Vista previa** en `catalog/demos/<categoría>.tsx`: un mapa `id → demos` con componentes reales. Monta el componente real; no hay maquetas aparte.
3. Añade la ficha a la categoría que le corresponde por propósito. Si el componente abre una hoja o un drawer, el ejemplo se abre por ruta con `useSheetParam`.
4. Muestra sus variantes y estados principales: normal, seleccionado, deshabilitado, error y pending.
5. Las pruebas de `components/sections.spec.ts` comprueban que cada archivo de `/ui/` tenga su ficha, que la ruta de import exista y que los ids de los demos coincidan con los del catálogo.
6. Comprueba a 360 px, en claro y oscuro, que no hay desbordes y que el texto se lee.
