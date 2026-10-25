# Galería de componentes

Referencia visual permanente de los componentes compartidos, agrupados por propósito (#307). Convive en `/dev` con la galería de cards (#272).

- Rutas: `/dev` (índice con «Cards» y «Componentes») y `/dev/components` (once secciones).
- Secciones: `sections.ts` es la única lista; cada id tiene su cuerpo en `sections/registry.ts`.
- Cada ficha (`demo.tsx`) muestra el nombre del componente, su ruta de importación real, sus variantes y el componente montado con datos de ejemplo.
- Datos: `mock/values.ts`, fijos (moneda y fecha), para no depender del perfil ni del día.
- Sheets y diálogos: `sections/overlays.tsx` los abre con `useSheetParam` (`?sheet=ejemplo&sheetId=…`), así la URL cambia y Atrás los cierra.
- Toques: no ejecutan la acción real (`simulated-tap.ts`); muestran «Toque simulado».
- Sin red: la galería no lee ni escribe datos del usuario ni llama al back.

## Agregar o actualizar un componente

1. Monta el componente real; no hay maquetas aparte.
2. Añade la ficha en la sección que le corresponde por propósito y escribe su ruta de importación real.
3. Muestra sus variantes y estados principales: normal, seleccionado, deshabilitado, error y pending.
4. Si el componente todavía no existe, créalo con su issue y agrégalo después; la galería no anuncia componentes inexistentes.
5. Comprueba a 360 px, en claro y oscuro, que no hay desbordes y que el texto se lee.
