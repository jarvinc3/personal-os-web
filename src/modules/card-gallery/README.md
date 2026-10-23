# Galería de cards

Referencia visual permanente de las cards de cada entidad y sus variantes (#272). Convive en `/dev` con la galería de componentes compartidos.

- Rutas: `/dev` (índice), `/dev/cards` (lista de entidades) y `/dev/cards/<entidad>` (todas las variantes, una por fila).
- Datos: `mock/`, siempre falsos y con formato de moneda fijo. No llama al back ni lee el perfil.
- Cards reales: se importan por ruta desde `src/modules`; las variantes viven en la prop `variant` del mismo componente.
- Borradores: `drafts/` reúne lo que aún no existe en el módulo real (comercio, meta, cobro, presupuesto, base tintada, detalle de movimiento y correo). Se muestran con la marca «Borrador» y desaparecen cuando su sub-issue de #271 los mueve al módulo.
- Variantes de cada entidad: `variants/`; el registro está en `variants/registry.ts`.
- Toques: no navegan, muestran «Toque simulado».

## Mantener la galería

Cada sub-issue de #271 actualiza su entrada con las variantes definitivas del componente real. Al añadir o cambiar una variante:

1. Añade o ajusta el variant en `variants/<entidad>.tsx` con `label`, `propLabel`, `height` y `render`.
2. Usa el componente real del módulo; solo si no existe todavía, un borrador de `drafts/` con `isDraft: true`.
3. Comprueba en `/dev/cards/<entidad>` que se pinta con datos de ejemplo y sin desbordes a 360 px.
