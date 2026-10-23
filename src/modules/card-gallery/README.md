# Galería de cards (provisional)

Galería aislada para aprobar los diseños de las cards por entidad antes de aplicarlos en el resto de la app (#272).

- Rutas: `/dev/cards` y `/dev/cards/<entidad>`.
- Datos: `mock/`, siempre falsos y con formato de moneda fijo. No llama al back ni lee el perfil.
- Cards reales: se importan por ruta desde `src/modules/finance`; las variantes compacta e inline viven en la prop `variant` de cada componente.
- Diseños que aún no existen en producción: `provisional/` (comercio, base tintada, meta, cobro, presupuesto, detalle de movimiento, patrimonio, correo y avisos).
- Variantes de cada entidad: `variants/`; el registro y los conteos están en `variants/registry.ts`.

## Cómo se retira

Lo elimina #290:

1. Borrar `src/modules/card-gallery/`.
2. Borrar `app/(app)/dev/cards/`.
3. Quitar `devCardGallery` y `devCardGalleryEntity` de `src/shared/constants/app-routes.ts`, el prefijo de `src/shared/lib/proxy-routes.ts` y el atajo de Inicio.
4. Conservar las props `variant` añadidas a las cards reales.
