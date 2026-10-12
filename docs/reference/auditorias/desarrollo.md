# Auditoría de formularios — Personal OS Web

Fecha: 11 de octubre de 2026.
App: `http://localhost:3000`, sesión ya iniciada en Finanzas.
Referencia: crear movimiento (`/finance/transactions/new`) y transferir (`/finance/transfers/new`).

## Cómo se probó

Se abrió cada formulario en el navegador, se envió vacío para ver la validación y, cuando era seguro, se guardó un registro de prueba. Los que no llegué a enviar en vivo se revisaron en el código con el mismo criterio.

A mitad de la prueba de préstamos el API en el puerto 3100 dejó de responder. La sesión cayó a `/login`. Reinicié el API con `pnpm start:dev` en `personal-os-back`; al volver, la sesión ya no estaba, así que el resto no se pudo volver a enviar. Esos formularios quedan marcados como revisión de código.

## El modelo a seguir

Crear gasto/ingreso y transferir comparten este patrón:

- Pantalla completa (`FinanceFormScreen`), no un sheet con Cancelar/Guardar.
- Botón de envío fijo abajo. Permanece deshabilitado hasta que el formulario es válido.
- Monto grande, con calculadora y selector de moneda (`FinanceMoneyField`).
- Cuenta o tarjeta elegidas en un picker con logo y saldo, no en un `<select>` de ids.
- Opciones cortas en control segmentado (Gasto / Ingreso), con palabras de persona.
- Fecha y hora con `FinanceDateField`.
- Notas y descripción dentro de “Detalles opcionales”, cerrado por defecto.
- Copy en español de uso. Los códigos (`DEBIT`, `CONFIRMED`, ISO) no se muestran.

## Resumen

| Formulario                           | Estado                                                                 | En vivo     |
| ------------------------------------ | ---------------------------------------------------------------------- | ----------- |
| Nuevo gasto / ingreso                | Funciona. Es el modelo.                                                | Sí, se creó |
| Editar movimiento                    | Funciona al cargar. El guardado no se confirmó.                        | Parcial     |
| Nueva transferencia                  | UI del modelo. El envío no se confirmó en la lista.                    | Parcial     |
| Nueva institución                    | Funciona, y es el formulario más viejo.                                | Sí, se creó |
| Nueva cuenta                         | Funciona. Cerca del modelo, con un dropdown de más.                    | Sí, se creó |
| Nueva tarjeta                        | Funciona después de pelear con errores en toast.                       | Sí, se creó |
| Nueva categoría                      | Falla el primer guardado: el emoji que se ve no está elegido.          | Sí          |
| Nuevo préstamo                       | Falla al guardar. El API responde 500.                                 | Sí          |
| Meta de ahorro y aporte              | Mejorar. Montos a medias.                                              | Código      |
| Cobro y registrar cobro              | Mejorar. Dropdown de cuentas.                                          | Código      |
| Presupuesto                          | Mejorar. Dropdowns y monto plano.                                      | Código      |
| Ajustar saldo de cuenta / tarjeta    | Mejorar. Monto plano, sin calculadora.                                 | Código      |
| Correos (Gmail, vínculo, asignar)    | Mejorar. Dropdowns y jerga de sync.                                    | Código      |
| Ajustes de módulos                   | Aceptable para preferencias. Copy técnico en Finanzas y Suscripciones. | Código      |
| Cuenta, tema, IA, horario silencioso | Aceptable.                                                             | Código      |
| Borrar cuenta / borrar datos         | No se envió (destructivo).                                             | No          |
| Login                                | Validación de vacío correcta.                                          | Sí          |
| Registro                             | No se abrió en este viewport de escritorio.                            | No          |
| Contacto (landing)                   | Fuera del sistema de formularios de la app.                            | Código      |
| Keep Awake, chat, historial          | No son formularios de datos al estilo finanzas.                        | Código      |

## Hallazgos que se repiten

1. **Dos familias de formularios.** Movimiento y transferencia son pantalla. El resto sigue en `BottomSheet` con Cancelar y Guardar, y el botón siempre está activo. El error sale después del clic, a veces solo en un toast.
2. **Tres controles de monto.** `FinanceMoneyField` (modelo, con calculadora), `FinanceAmountField` (número grande, sin calculadora) y `FormTextField` con placeholder `0.00` (el viejo). En un mismo formulario conviven los dos últimos. Préstamo: “Monto original” es `FinanceAmountField` y “Saldo actual” / “Cuota” son `FormTextField`.
3. **Listas largas en** `SelectField`**.** Institución, cuenta, categoría padre, categoría de presupuesto y “cuenta donde entró el dinero” son combobox. El modelo usa un picker con marca y saldo (`DestinationPickerSheet`).
4. **Texto de implementación en la UI.**

- Préstamo, subtítulo del sheet: “12% se envía como 0.12. La tasa no es un entero de porcentaje.” Se repite junto al campo: “12% se envía como 0.12. Vacío = sin tasa (no es lo mismo que 0%).”
- Institución: “País (ISO-2)”, “Orden”, “Dominio”, “Nombre corto”, “Logo propio (PNG, JPG o WEBP, máx. 1 MB)”.
- Tarjeta: “Últimos 4”, “Cierre de estado (día)”.
- Ajustes de Finanzas: “Activar sync”, “Sync automático”, “Auto-categorizar”.
- Suscripciones: la moneda es un texto libre con placeholder `DOP`, sin el picker de moneda.

5. `<select>` **nativo.** Solo queda en el tipo de institución y en el motivo de la página de contacto. El resto de opciones cortas ya usa `FinanceSegmentedControl` o filas de radio.
6. `window.confirm` **del navegador** al borrar o archivar cuenta, tarjeta, categoría, institución, préstamo, meta, cobro, presupuesto, buzón y vínculo de correo. No usa el sheet de confirmación de la app.
7. **Errores de saldos anidados solo en toast.** En tarjeta, “Saldo” y “Límite de crédito” no pintan `FieldError`. Un saldo vacío con límite puesto responde “Saldo inválido” o “Límite de crédito obligatorio” en el toast, y el campo no se marca.
8. **Error de hidratación de Next.js** en el sidebar (`Collapsible` de Finanzas). El overlay de issues tapa el botón Guardar. No es del formulario, pero bloquea enviarlo.

## Formularios probados

### Nuevo gasto / ingreso — funciona

Ruta: `/finance/transactions/new`.

Al entrar se abre solo el picker de categoría. Con monto vacío, “Registrar gasto” está deshabilitado. Con `1.00` y comercio “Auditoría formulario” se creó el movimiento y volvió a la lista: Efectivo, 11 oct 2026, 11:49 a. m., − DOP $1.00.

El detalle abre “Opciones” con Editar y Eliminar. Es el patrón a copiar.

### Editar movimiento — carga bien

Ruta: `/finance/transactions/aae8171e-b3a0-43ce-9530-5a5820f25b1d/edit`.

Trae monto `1`, comercio, destino Efectivo y fecha. “Guardar” está habilitado. No confirmé el PATCH: el overlay de hidratación interceptó el clic. Desde el detalle, “Editar movimiento” dentro del sheet de opciones no navegó en el primer clic; la ruta directa sí abre el formulario.

### Nueva transferencia — UI del modelo

Ruta: `/finance/transfers/new`.

Origen y destino salen preseleccionados (Cuenta auditoría → Efectivo), con fecha y switch “Completado”. “Transferir” nace deshabilitado y se habilita al poner monto. Al enviar, la app hizo `router.back()` y terminé en Categorías, que era la página anterior. No alcancé a ver el movimiento nuevo en la lista antes de que cayera la sesión. Tratar el envío como probable, no como confirmado.

### Nueva institución — funciona, y hay que rehacerla

Ruta: `/finance/products?sheet=institution-sheet`.

Vacío: “Nombre obligatorio”. Con nombre “Auditoría Banco” y país `DO`: toast “Institución creada”. Aparece en el carrusel y en la lista.

Lo que se siente viejo:

- `<select>` nativo para el tipo (Banco, Cooperativa, etc.), con borde y tipografía distintos al resto.
- `<input type="file">` pelado para el logo.
- Etiquetas “País (ISO-2)”, “Orden”, “Dominio”, “Nombre corto”.
- El país pide el código de dos letras en vez de un país.

### Nueva cuenta — funciona

Sobre la institución de prueba, `?sheet=account-sheet`.

El saldo no se edita aquí (“empieza en 0”). Tipo en segmentado (Corriente, Ahorros, Efectivo, Inversión). Moneda en pastillas DOP/USD/MXN/EUR. Vacío: “Nombre obligatorio” y “Número de cuenta obligatorio (4 a 34 dígitos)”. Se creó “Cuenta auditoría”, corriente, •••• 7890.

Mejora: la institución sigue en `SelectField`. En esta pantalla ya venía elegida, así que el dropdown sobra cuando se abre desde la institución. El número de cuenta pide “4 a 34 dígitos”, que es una regla de validación dicha en voz de API.

### Nueva tarjeta — funciona, con fricción

`?sheet=card-sheet` en la misma institución.

Tipo y red ya son segmentados (Crédito/Débito, Visa/Mastercard/…). Institución preseleccionada. Vacío: “Nombre obligatorio” y “Deben ser 4 dígitos”.

Con nombre y últimos 4, el primer guardado avisó en toast “Límite de crédito obligatorio” sin marcar el campo. Con límite `10000` y saldo vacío, no cerró. Con saldo `0.00` sí: toast implícito al cerrar el sheet y la tarjeta “Visa auditoría” •••• 4242 quedó en la pestaña Tarjetas.

Después de crearla, la institución mostró saldo DOP −$10,000.00 y la tarjeta “Balance disponible DOP $0.00”. Con límite 10,000 y saldo 0, el disponible en cero y la deuda de la institución en −10,000 no cuadra con lo que se escribió. Conviene revisar si el límite se está contando como saldo usado.

Copy a cambiar: “Últimos 4”, “Cierre de estado (día)”, “Vencimiento (día)”. Los saldos iniciales deberían ser `FinanceMoneyField`, no dos `FormTextField`.

### Nueva categoría — falla el guardado con el emoji por defecto

`/finance/categories?sheet=category-sheet`.

El botón de emoji muestra 🛒 aunque el valor del formulario es `""` (`{value || "🛒"}` en `category-emoji-field.tsx`). El esquema exige un emoji de verdad. Al guardar con solo el nombre, el toast es “El icono debe ser un emoji” y el error se pinta debajo del carrito que parece elegido.

Al abrir el picker y elegir 🍽️, “Auditoría categoría” sí se creó.

Arreglo mínimo: no mostrar un emoji de adorno si el valor está vacío, o guardar ese emoji como valor inicial. “Categoría padre” puede seguir, pero un picker como el de movimientos encaja mejor que el `SelectField` cuando hay muchas categorías.

### Nuevo préstamo — falla al guardar

`/finance/planning?sheet=loan-sheet`.

Vacío, la validación sí funciona: “Prestamista obligatorio”, “Monto original obligatorio”, “Saldo obligatorio”, “Cuota obligatoria”, “Cuotas totales obligatorias”. Frecuencia en segmentado y moneda en pastillas.

Con prestamista “Auditoría préstamo”, monto 1000, saldo 800, cuota 100, 10 cuotas mensuales y vencimiento 11 oct 2026, Guardar no cierra el sheet. El toast es “No se pudo guardar. Intenta de nuevo.” `POST http://localhost:3100/api/finance/loans` respondió **500** varias veces. Ese texto sale de `financeErrorMessage` cuando el status es ≥ 500, así que el motivo real del servidor no llega a la pantalla.

Encima, el subtítulo del sheet es texto de implementación (“12% se envía como 0.12…”). La tasa vive en “Detalles opcionales” como “Tasa anual (%)”, que es lo correcto para la persona; el comentario de la fracción sobra. “Institución (si está en el catálogo)” y “Cuenta de pago (opcional)” son `SelectField`. “Saldo actual” y “Cuota” no usan el campo de monto grande.

## Revisados en código (no reenviados tras caer la sesión)

### Meta de ahorro y aporte

`savings-goal-sheet.tsx`, `savings-goal-contribution-sheet.tsx`.

Nombre, meta y fecha están claros. “Meta” usa `FinanceAmountField`; “Ahorrado” es un `FormTextField` con placeholder `0`. El aporte repite monto plano + fecha + nota, en sheet. El modelo de movimiento ya resuelve monto, moneda y fecha en una pantalla.

### Cobro y registrar cobro

`receivable-sheet.tsx` tiene deudor, estado segmentado (Pendiente, Parcial, Pagado, Cancelado), monto y vencimiento. “Cobrado” es texto plano. `receivable-payment-sheet.tsx` pide el monto y luego un `SelectField` “Cuenta donde entró el dinero”: ahí cabe el mismo picker de destino de la transferencia.

### Presupuesto

`budget-sheet.tsx`: categoría y tipo de periodo en `SelectField`, tope en `FinanceAmountField`, umbral en texto (“80”). Las fechas de periodo custom sí usan `FinanceDateField`. La categoría debería elegirse como en el movimiento.

### Ajustar saldo

`account-balance-sheet.tsx` y `card-balance-sheet.tsx` piden el saldo nuevo en `FormTextField`. Es el caso más claro para `FinanceMoneyField` (teclado de monto + calculadora), porque el dato es exactamente un importe.

### Correos

`connect-gmail-sheet.tsx` es un paso a Google, correcto. `link-institution-mailbox-sheet.tsx` y `email-source-sheet.tsx` combinan dos `SelectField` (Gmail e institución) con textos “Correo del banco”, “Otros remitentes” y “Etiqueta”. `assign-email-message-sheet.tsx` asigna con un dropdown “Cuenta o tarjeta” en lugar del picker. Copy de ajustes: “Activar sync”.

### Ajustes

Los formularios de módulo (Finanzas, Agenda, Salud, Proyectos, Suscripciones) son filas con icono, radio y switch. Encajan con una pantalla de preferencias; no hace falta convertirlos en el formulario de movimiento.

Sí cambiar:

- Finanzas: “Activar sync”, “Sync automático”, “Auto-categorizar” → “Sincronizar correo”, “Sincronizar solo”, “Asignar categoría sola” (o equivalente en el tono de la app).
- Suscripciones: la moneda no debería ser un input de 3 letras. Usar las mismas pastillas o el picker de moneda.
- Borrar cuenta y borrar datos piden contraseña en `FormTextField`. No los envié.

Tema, tono de IA, proveedor, horario silencioso y nombre de perfil son sheets cortos y coherentes.

### Login y registro

En escritorio el login está en la página, no en sheet. Vacío: “Ingresa un email válido” y “La contraseña debe tener al menos 8 caracteres”, con `aria-invalid`. No probé credenciales.

En móvil, login y registro viven en `BottomSheet` (`login-sheet`, `register-sheet`). En este viewport de escritorio el botón de registro del sheet no está; no abrí el alta.

### Contacto, Keep Awake, chat

- Contacto (`contact-screen.tsx`) arma el formulario a mano: inputs con clases sueltas y un `<select>` nativo de motivo. No usa `FormTextField` ni el sheet.
- Keep Awake: el recordatorio es un sheet de hora y días. Historial, ayuda y alerta no son formularios de alta.
- Chat: el composer y el sheet de historial de conversaciones. No los comparé con el alta de un movimiento.

## Datos de prueba que quedaron

Hay que borrarlos a mano. La sesión se cayó antes de poder eliminarlos.

| Qué                                                                     | Dónde                                                       |
| ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| Movimiento “Auditoría formulario”, − DOP $1.00, 11 oct 2026 11:49 a. m. | Efectivo. Id `aae8171e-b3a0-43ce-9530-5a5820f25b1d`         |
| Institución “Auditoría Banco”                                           | Id `f4567390-10b3-4d06-9031-6427999d8894`                   |
| Cuenta “Cuenta auditoría”, corriente, •••• 7890                         | Dentro de esa institución                                   |
| Tarjeta “Visa auditoría”, crédito Visa, •••• 4242, límite 10,000        | Misma institución. El consolidado quedó en − DOP $10,000.00 |
| Categoría “Auditoría categoría”                                         | Pestaña Gastos                                              |

El préstamo no se creó. La transferencia no está confirmada.

## Orden sugerido para acercarlos al modelo

1. Arreglar el 500 de `POST /api/finance/loans` y quitar el copy de “se envía como 0.12”.
2. Hacer que el emoji por defecto de categoría sea un valor real, o no pintarlo.
3. Unificar montos de préstamo, ahorro, cobro, presupuesto, tarjeta y ajuste de saldo en `FinanceMoneyField`.
4. Sustituir los `SelectField` de cuenta/tarjeta/institución por el picker de destino.
5. Reescribir institución: país con nombre, tipo segmentado, logo con el mismo control de archivo que el resto de la app, y esconder “Orden”.
6. Sustituir los `window.confirm` por el sheet de confirmación.
7. Mostrar el error del API cuando no es un 500 genérico, y marcar el campo cuando el fallo es de saldo o límite.
