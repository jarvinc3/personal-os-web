# Mockups v3 — Suscripciones

Rediseño visual de la vista de Suscripciones acordado con Jarvin (pendiente [14](../../pendientes/14-suscripciones-v3.md)). Son referencias visuales; habrá ajustes posteriores.

## Decisiones clave

- Hero suelto (sin `SummarySection`), como en Planificación y Productos, con 4 atajos con icono y contador/dot.
- Progreso del ciclo como anillo alrededor del logo; borde ámbar solo dentro de la ventana de aviso (5 días por defecto, configurable y global).
- «Hoy» / «Mañana» / «en N días» dentro de la ventana; fuera de ella, fecha corta (`17 Oct`).
- Filtros en bottom sheet usando los pickers reales de cuenta/tarjeta y categoría.
- Detalle con tabs Resumen / Pagos / Precio, como en Cards.

## Pantallas

| Archivo                      | Descripción                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `index.png`                  | Pantalla principal: hero suelto con gasto mensual y los 4 atajos (Próximos, Alertas, Detectados, Calendario). |
| `index-full.png`             | Pantalla principal completa con la lista de cards.                                                            |
| `estados-card.png`           | Galería de estados de la card: anillo de progreso en el logo y borde ámbar dentro de la ventana de 5 días.    |
| `proximos.png`               | Sheet de Próximos cobros (solo los que caen dentro de la ventana de aviso).                                   |
| `alertas.png`                | Sheet de Alertas (subidas de precio, pagos fallidos) con «Marcar vistas» y «Revisar».                         |
| `detectados.png`             | Sheet de suscripciones detectadas desde el correo para confirmar.                                             |
| `calendario.png`             | Vista de calendario mensual de cobros.                                                                        |
| `filtros.png`                | Bottom sheet de filtros con filas que abren los pickers reales, segmentados y «Ordenar por».                  |
| `picker-metodo.png`          | Picker real de método de pago: selección de institución/cuenta.                                               |
| `picker-metodo-tarjetas.png` | Picker real de método de pago: tarjetas de una institución.                                                   |
| `picker-categoria.png`       | Picker real de categorías.                                                                                    |
| `ajustes.png`                | Ajustes de suscripciones.                                                                                     |
| `ajustes-aviso.png`          | Ajuste del umbral de aviso (3, 5, 7 días o personalizado; 5 por defecto).                                     |
| `detalle-resumen.png`        | Detalle de suscripción, tab Resumen (próximo cobro, método de pago, categoría, ciclo actual).                 |
| `detalle-pagos.png`          | Detalle de suscripción, tab Pagos (historial de transacciones vinculadas).                                    |
| `detalle-precio.png`         | Detalle de suscripción, tab Precio (cambios de monto en el tiempo).                                           |
