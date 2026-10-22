# ADR-006: Apariencia extensible con modo, estilo y color primario

- Estado: `accepted`
- Fecha: 2026-10-21
- Origen: web #160

## Decisión

La apariencia tiene tres ejes independientes: modo (claro, oscuro o sistema), estilo y color primario.

- Los estilos viven en un registro en `src/shared/appearance/style-registry.ts`. Cada estilo aporta un archivo CSS con los tokens semánticos de superficie, borde, sombra y radio bajo `[data-style="<id>"]`.
- El selector y su vista previa se generan desde el registro. Agregar un estilo es una entrada en el registro, su archivo CSS y la línea de importación en `styles/index.css`; no se toca ningún componente.
- El color primario se elige de una paleta curada o con el selector de color. El texto sobre el primario es negro o blanco según el contraste; el mínimo es 4.5:1.
- La preferencia vive en `preferences.theme` (`value`, `style`, `primaryColor`), con `preferences.version` 2. Los perfiles anteriores se completan al leerlos.
- Una copia en `localStorage` (`personal-os-appearance`) y un script antes del primer pintado aplican el estilo y el color sin parpadeo. El perfil manda; la copia es solo caché.

## Motivo

Neo-Skeuo se aprobó con la condición de que la arquitectura soportara una lista creciente de estilos, no un interruptor entre dos. Un registro con tokens evita ramas por estilo en los componentes. La caché local evita el parpadeo de esperar al perfil, y el perfil conserva la preferencia entre dispositivos.

## Consecuencias

- Los componentes nuevos usan tokens (`bg-background`, `bg-card`, `border-border`, `shadow-sm`, `rounded-*`), no valores de color sueltos.
- Toda pantalla cuelga del layout raíz, que declara `data-style`. Un estilo sin archivo no pinta tokens; el registro y el script validan el id.
- La primera visita en un dispositivo nuevo muestra la apariencia por defecto hasta que responde el perfil; en recargas del mismo dispositivo no hay parpadeo.
- El color primario no cambia los acentos propios de cada app ni los colores semánticos (éxito, aviso, peligro).
- Neo-Skeuo queda en #235. Su archivo CSS solo agrega tokens; no cambia el registro del selector.
- El modo sigue con `next-themes`; el estilo y el color los aplica el cliente y el script del primer pintado.

## Evidencia

- `src/shared/appearance/`
- `src/modules/settings/hooks/use-apply-appearance-preference.ts`
- `src/modules/settings/screens/appearance-settings-screen.tsx`
- `app/layout.tsx`
- `src/shared/constants/release-notes.ts`
