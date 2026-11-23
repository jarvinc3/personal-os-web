# Sugerencias del agente por vista (#408)

La fila muestra hasta tres sugerencias activas del back para la vista actual. Consume `GET /api/intelligence/view-suggestions` y `DELETE /api/intelligence/view-suggestions/:id` de back #358.

## Dónde aparece

- **Fuera del overlay:** una fila horizontal encima del tab bar, en las vistas que tienen tab bar y no tienen un sheet ni un picker abierto. Si no hay sugerencias, no aparece la fila ni la X: solo queda el control que abre el agente (el `+` del tab bar o el botón del agente). La X al final oculta la fila durante el resto de la sesión en esa vista; no descarta nada.
- **Dentro del overlay:** la misma fila va encima del composer, siempre con las sugerencias activas aunque la fila exterior se haya ocultado. Cada badge lleva su propia X.
- La fila tiene scroll horizontal y un fundido en los bordes cuando el contenido no cabe. No lleva paginación.
- Tocar un badge en la fila exterior abre el overlay con `?suggestion=<id>` y deja el prompt de esa sugerencia en el composer. Tocar uno dentro del overlay hace lo mismo sin cerrar nada.
- La fila se oculta mientras hay un `BottomSheet` abierto para no quedar detrás de la hoja. La vista con sheet se atiende dentro del overlay, que calcula su alcance con `route + sheet`.

## Ocultar y descartar

- **Ocultar la fila:** la X de la barra guarda una marca por ruta y vista en `sessionStorage` (`personal-os:view-suggestions-hidden:…`). Vale solo para esa pestaña y esa vista. Al abrir el overlay, las sugerencias siguen visibles.
- **Descartar una sugerencia:** la X de un badge dentro del overlay abre el `AlertDialog` «¿Descartar esta sugerencia?» con Cancelar y Descartar. Cancelar no cambia nada. Descartar llama al `DELETE`, quita la sugerencia de todas las cachés de la fila y el back no la vuelve a generar para esa vista.
- Un fallo al descartar deja el diálogo abierto, muestra un toast y permite reintentar.
- Un fallo al cargar sugerencias deja la fila vacía sin bloquear el chat ni el resto de la vista.

## Alcance y datos

`buildViewSuggestionScope` usa `route` más `view` (el tab de la URL) o `sheet`. No incluye filtros ni entidad, igual que el recurso del back. `viewSuggestionScopeFromContext` reutiliza el contexto del overlay para que las sugerencias de un sheet sean las del sheet.

## Código

- `src/modules/intelligence/components/view-suggestions-bar.tsx` — fila exterior y ocultado por sesión.
- `view-suggestions-row.tsx` — fila reutilizable, scroll, fundido, badges y X.
- `src/modules/intelligence/hooks/use-view-suggestions.ts` — consulta, descarte e invalidación de caché.
- `src/modules/intelligence/lib/view-suggestions.ts` — alcance, query string y `sessionStorage`, con su spec.
- `agent-chat-overlay.tsx` — fila interior, prefill desde `?suggestion=` y `AlertDialog`.
- `agent-chat-host.tsx` — decide cuándo se ve la fila exterior y abre el overlay desde un badge.

Back: [personal-os-back#358](https://github.com/jarvinc3/personal-os-back/issues/358).
