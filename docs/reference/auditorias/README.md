# Auditorías de formularios

Dos recorridos manuales sobre los formularios de Finanzas. Se conservan como evidencia de lo que se probó y de los mockups acordados; el estado vigente vive en [status.md](../../modules/finance/status.md).

| Documento | Fecha | Alcance |
| --- | --- | --- |
| [desarrollo.md](./desarrollo.md) | 11 oct 2026 | `localhost:3000`, un recorrido por cada formulario |
| [produccion.md](./produccion.md) | 11 oct 2026 | `personal-os-web-one.vercel.app`, ancho móvil, con mockups |

`mockups/` guarda los mockups móviles citados por la auditoría de producción.

## Resultado

Aplicado:

- Vista dedicada para movimiento, transferencia (alta y edición), préstamo (asistente y edición), tarjeta e institución.
- `FinanceMoneyField`, selector de moneda con bandera y tarjeta de cuenta en todos los formularios de dinero.
- Validación cruzada de préstamos en el cliente y en el DTO del API.
- Esc dentro de un picker ya no cierra el sheet; cerrar con cambios pide confirmación.
- Patrón único de borrado: "Eliminar" en el ⋮ del detalle, con `AlertDialog` que nombra el registro y sus consecuencias.
- Errores del API traducidos al español; el detalle de validación no se pierde.
- Emoji por defecto de categoría, país por nombre, tipo segmentado y logo con vista previa en institución.
- Accesibilidad de avatares, ruedas de hora (pasos de 5 minutos) y nombres de modelo del proveedor de IA.

Pendiente (P2):

- Comercios, suscripciones y recurrentes: sin ruta todavía.
- Deshacer tras eliminar y borrado suave.
- Prefill del formulario con el agente de IA.
- Leer la tarjeta desde un estado de cuenta o correo: hoy solo hay un atajo a Correos.
