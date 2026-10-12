# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y [SemVer](https://semver.org/lang/es/). Reglas y ejemplo en [docs/reference/changelog-guide.md](./docs/reference/changelog-guide.md).

## [1.4.0] - 2026-10-12

### Agregado

- Deshacer después de eliminar: cada borrado guarda un snapshot en el API y el toast permite reponerlo desde las 9 pantallas de detalle.
- Prefill del asistente de préstamo desde un enlace del chat con `amount`, `periods`, `ratePercent` o `installment`, `lenderName`, `freq` y `who`.
- El chat pinta enlaces markdown; una ruta interna se abre con `Link`.
- Confirmación con diálogo al cerrar un formulario con cambios sin guardar, en 12 sheets.
- La diferencia en vivo al ajustar el saldo de una cuenta o de una tarjeta.

### Cambiado

- La etiqueta de la cuenta en un movimiento sigue al tipo: "Desde" en un gasto, "Destino" en un ingreso.
- La rueda de fecha objetivo de una meta ya no ofrece días pasados.
- Las reglas de `.cursor/rules` y la documentación del módulo finance apuntan a las rutas reales por capability.
- Las auditorías de formularios viven en `docs/reference/auditorias/` con un resumen de lo aplicado y lo pendiente.

### Corregido

- La herramienta de IA de aporte a meta no enviaba la cuenta, lo que rompía el typecheck del paquete.
