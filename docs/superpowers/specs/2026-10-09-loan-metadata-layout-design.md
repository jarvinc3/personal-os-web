# Diseño: metadatos de préstamos

## Objetivo

Mejorar la lectura de los detalles secundarios de `LoanProgressCard` y asegurar que todas las fechas visibles del módulo Finanzas se presenten en español.

## Diseño aprobado

- Mantener una sola tarjeta compartida entre Planificación y el detalle de institución.
- Mostrar frecuencia y tasa debajo del nombre de la institución.
- Mostrar en la fila inferior las cuotas a la izquierda y el próximo vencimiento a la derecha.
- Usar el texto `Próximo pago · <fecha>` para el vencimiento.
- Formatear fechas con locale explícito `es`, sin depender del idioma del navegador.
- Mantener compatibilidad con los captions de texto de las demás tarjetas de progreso.

## Implementación

`PlanningProgressCard` aceptará contenido React como caption. `LoanProgressCard` compondrá las dos filas de metadatos. `formatCalendarDate` aplicará el locale español para todos sus consumidores en Finanzas.

## Verificación

- Prueba unitaria del formato español.
- Pruebas existentes de fechas y progreso.
- Typecheck y ESLint de los archivos modificados.
