/**
 * Notas de usuario que alimentan la hoja «Novedades».
 *
 * Se mantiene a mano junto al `CHANGELOG.md`: mismas versiones, mismo orden
 * (la más nueva arriba), pero escritas para quien usa la app. Aquí no va el
 * changelog técnico. Cómo agregarlas: `docs/versionado.md`.
 */
export type ReleaseNotesEntry = {
  version: string
  highlights: readonly string[]
}

export const RELEASE_NOTES: readonly ReleaseNotesEntry[] = [
  {
    version: "0.60.1",
    highlights: [
      "Sin cambios visibles: esta versión solo ordena detalles internos del proyecto.",
    ],
  },
  {
    version: "0.60.0",
    highlights: [
      "La galería de cards es permanente y ahora se abre desde el índice /dev; muestra las variantes reales de cada entidad.",
      "Institución, cuenta, tarjeta, préstamo, meta, cobro, presupuesto y comercio se ven en tamaño compacto cuando son un dato de otra pantalla.",
      "El detalle de un movimiento muestra su categoría y las cards de su cuenta, tarjeta y comercio.",
    ],
  },
  {
    version: "0.59.0",
    highlights: [
      "Nueva galería provisional para revisar las cards de cada entidad y sus variantes antes de aplicarlas en la app.",
      "Se abre desde Inicio y usa datos de ejemplo; se retira cuando los diseños estén aprobados.",
    ],
  },
  {
    version: "0.58.9",
    highlights: [
      "Al crear la cuenta o iniciar sesión, la contraseña puede tener 6 caracteres como mínimo, siempre con mayúsculas, minúsculas y números.",
    ],
  },
  {
    version: "0.58.8",
    highlights: [
      "Sin cambios visibles: esta versión solo ordena detalles internos del proyecto.",
    ],
  },
  {
    version: "0.58.7",
    highlights: [
      "Las fechas de Finanzas se ven igual en toda la app, con la abreviatura «sep» y sin fechas en formato técnico.",
      "El comercio de un movimiento se muestra tal como lo escribiste.",
      "Los nombres de las opciones y del menú de acciones ya no se cortan en el móvil, y el total de la dona de Suscripciones se ve completo.",
      "Al editar una suscripción, el selector de fecha empieza cerrado.",
    ],
  },
  {
    version: "0.58.6",
    highlights: [
      "La hora de cada movimiento se ve en tu zona horaria en la lista, el detalle y el formulario, y coincide en los tres.",
      "En Planificación, la cabecera muestra siempre el resumen de la pestaña en la que estás y la pestaña activa se lee bien.",
      "Una suscripción activa con la fecha de cobro pasada aparece marcada como «Vencida».",
      "Pausar una suscripción ahora pide confirmación; reanudarla no.",
      "El detalle de un presupuesto muestra su cabecera al instante y carga sus gastos en segundo plano.",
    ],
  },
  {
    version: "0.58.5",
    highlights: [
      "Sin cambios visibles: esta versión solo ordena detalles internos del proyecto.",
    ],
  },
  {
    version: "0.58.4",
    highlights: [
      "Productos, Patrimonio y la pestaña Cobros de Planificación dejan de caer en la pantalla de error cuando la respuesta del servidor viene incompleta: verás un aviso y el resto de la vista sigue funcionando.",
      "Un cobro con un monto ilegible se marca como no disponible y ya no tumba la lista; tampoco suma a los totales.",
      "El gastado de un presupuesto coincide siempre con la lista de gastos de su periodo.",
      "Actualizamos la base del cliente a una versión corregida por seguridad.",
    ],
  },
  {
    version: "0.58.3",
    highlights: [
      "Si tu inicio de sesión o tu registro falla, ahora ves el motivo en español y no un mensaje técnico en inglés.",
      "Al crear la cuenta, la contraseña debe tener al menos 10 caracteres e incluir mayúsculas, minúsculas y números; el formulario te lo dice antes de enviar.",
    ],
  },
  {
    version: "0.58.2",
    highlights: [
      "Sin cambios visibles: esta versión solo ajusta detalles internos del proyecto.",
    ],
  },
  {
    version: "0.58.1",
    highlights: [
      "Si falla el guardado de Apariencia, la hoja sigue abierta con el aviso y puedes reintentar o descartar el cambio.",
    ],
  },
  {
    version: "0.58.0",
    highlights: [
      "Apariencia ahora tiene tres ajustes: modo claro u oscuro, estilo visual y color primario.",
      "Elige el color primario de una paleta o con el selector; el texto sobre ese color se ajusta solo para que se lea.",
      "El estilo visual se elige con una vista previa y la app recuerda tu elección al recargar.",
    ],
  },
  {
    version: "0.57.0",
    highlights: [
      "Puedes ponerle un nombre a cada préstamo para distinguirlo, y elegir la cuenta donde entró el dinero: ese saldo sube y el patrimonio no baja por el capital recibido.",
      "Cada meta de ahorro muestra en qué cuenta vive su dinero, y ahora puedes retirar lo apartado hacia la cuenta que elijas sin borrar el historial.",
      "La vista de Efectivo queda propia de una institución del sistema: menú con Nueva cuenta, el saldo de cada moneda en el header y una pestaña Préstamos con los préstamos que no están ligados a un banco.",
    ],
  },
  {
    version: "0.56.1",
    highlights: [
      "El detalle de una institución muestra el saldo de cada moneda cuando tiene más de una, y con una sola moneda lo muestra en esa moneda, sin convertir.",
    ],
  },
  {
    version: "0.56.0",
    highlights: [
      "Al registrar un gasto, si te pasas del presupuesto de su categoría, la app te dice cuánto queda de exceso y te deja decidir si lo guardas igual.",
      "Movimientos muestra los compromisos que ya conoces, como la próxima cuota de un préstamo o el próximo cobro de una suscripción, marcados como programados y sin cambiar los totales.",
      "Si tienes cuentas o suscripciones en varias monedas, los totales de Productos y Suscripciones se muestran por moneda, sin convertir todo a una sola cifra.",
    ],
  },
  {
    version: "0.55.0",
    highlights: [
      "El patrimonio ahora tiene su propia vista: toca la cifra del balance en Productos para ver cuánto tienes disponible, cuánto te deben y qué debes, separado por moneda.",
      "Los cobros pendientes suman al patrimonio; los vencidos hace más de 90 días se muestran aparte como dudosos y no suman.",
      "Los avisos de descuadre y de productos sin conciliar ahora son dos indicadores con su lista y sus acciones, en vez de tarjetas rojas.",
      "Los botones de ayuda de esos avisos abren el glosario del Centro de ayuda.",
    ],
  },
  {
    version: "0.54.2",
    highlights: [
      "Un gasto ya no deja una cuenta de efectivo en negativo: la app lo bloquea y te dice cuánto tienes disponible.",
      "En una cuenta bancaria, si el gasto supera el saldo, la app muestra cómo quedaría la cuenta y pide confirmación antes de guardar.",
    ],
  },
  {
    version: "0.54.1",
    highlights: [
      "Sin cambios visibles: el Centro de ayuda queda igual por dentro, con los enlaces y la búsqueda más ordenados.",
    ],
  },
  {
    version: "0.54.0",
    highlights: [
      "Nuevo Centro de ayuda en Ajustes → Ayuda: glosario con buscador, guías paso a paso y preguntas frecuentes.",
      "Cada término del glosario tiene su propio enlace y las guías y respuestas llevan al término que explican.",
      "Guías para instalar la app en Android, iPhone y escritorio, y para conectar el correo, conciliar, presupuestar, ahorrar, prestar y cobrar.",
      "La sección Módulos de Ajustes ahora se llama Apps.",
    ],
  },
  {
    version: "0.53.0",
    highlights: [
      "El primer día de la semana se elige en Preferencias › Región y lo usan los calendarios. Finanzas y Agenda ya no guardan uno propio.",
      "Las fechas, las tasas y los montos respetan el idioma y la región de tu perfil, y puedes escribir montos con coma o punto.",
      "Ajustes de Finanzas ahora es una lista corta: Categorías, Monedas y Conciliación, y cada sección abre su propia hoja.",
      "En Privacidad y datos, vaciar todo abre una hoja que explica qué se borra y pide tu contraseña o tu cuenta de Google.",
      "Ajustes de Finanzas tiene su propia zona de peligro para vaciar solo los datos de ese módulo.",
    ],
  },
  {
    version: "0.52.1",
    highlights: [
      "La hoja de Idioma muestra el idioma guardado al abrirse, incluso si el perfil tarda en cargar.",
    ],
  },
  {
    version: "0.52.0",
    highlights: [
      "Ajustes ahora es una lista de secciones: Perfil y cuenta, Preferencias regionales, Apariencia, Asistente IA, Notificaciones, Privacidad y datos, y Módulos.",
      "Cada sección abre su propia pantalla y puedes volver con la flecha; la zona horaria, el idioma y la moneda quedan juntos en Preferencias regionales.",
    ],
  },
  {
    version: "0.51.1",
    highlights: [
      "En Productos, la gráfica ya no se rompe con saldos negativos: lo que tienes va a un lado y lo que debes al otro, cada grupo con su porcentaje.",
      "El centro sigue mostrando el patrimonio neto con su signo, y si todo está en cero aparece un estado vacío.",
    ],
  },
  {
    version: "0.51.0",
    highlights: [
      "La lista de Apps ya no dice Activo antes de tiempo: mientras el interruptor está encendido sin guardar, esa app aparece como «Pendiente de guardar».",
      "El botón Guardar se destaca mientras falta guardar y, si sales del panel, la app pide confirmación antes de descartar el cambio.",
    ],
  },
  {
    version: "0.50.1",
    highlights: [
      "Si los datos de un cobro llegan rotos, los totales de Cobros avisan en vez de mostrar una cifra inventada.",
    ],
  },
  {
    version: "0.50.0",
    highlights: [
      "En Cobros ves arriba de la lista cuánto te deben y cuánto ya cobraste, separado por moneda.",
      "Guardar el perfil ya no espera: el nombre o el avatar cambian al instante y, si algo falla, vuelve el valor anterior con un aviso.",
    ],
  },
  {
    version: "0.49.6",
    highlights: [
      "Marcar un movimiento como pendiente o reversarlo ahora pide confirmación y avisa el monto y la cuenta que cambia.",
    ],
  },
  {
    version: "0.49.5",
    highlights: [
      "Sin cambios visibles: las pantallas de Planificación, Notificaciones, Suscripciones y el formulario de institución quedan iguales por dentro, ordenadas en piezas más pequeñas.",
    ],
  },
  {
    version: "0.49.4",
    highlights: [
      "Sin cambios visibles: los formularios de movimiento y de transferencia comparten internamente la fecha y su interruptor de estado.",
    ],
  },
  {
    version: "0.49.3",
    highlights: [
      "El aviso de sobrepago de un cobro muestra el sobrante real y deja elegir a qué otro cobro va la diferencia.",
      "Un monto escrito con separador de miles se lee completo: 3,003 sobre 3,000 avisa que sobran 3.00.",
    ],
  },
  {
    version: "0.49.1",
    highlights: [
      "El formulario de Gasto abre completo: la categoría se elige cuando la tocas y el campo Comercio queda a la vista.",
      "Si pasas una cuenta a Efectivo, la institución queda en Efectivo sin perder lo demás que escribiste.",
    ],
  },
  {
    version: "0.49.0",
    highlights: [
      "Ya puedes elegir tu zona horaria en Ajustes, Cuenta, Zona horaria; la primera vez se toma del navegador.",
      "Las horas de Finanzas se muestran en tu zona, incluido el ajuste de saldo que crea la conciliación.",
    ],
  },
  {
    version: "0.48.0",
    highlights: [
      "En Productos, las instituciones se mueven con un deslizamiento horizontal y el botón Desplegar las abre en fila para verlas todas.",
      "La pila vuelve a empezar donde la dejaste y recuerda si prefieres verla apilada o desplegada.",
    ],
  },
  {
    version: "0.47.10",
    highlights: [
      "Al ver una transferencia entre monedas, cada cuenta muestra su propio monto: lo que salió y lo que llegó, con la tasa usada.",
      "Si un monto lleva más de dos decimales o pasa del máximo, el campo te lo dice antes de guardar.",
      "Una cuenta de efectivo se guarda siempre en Efectivo, aunque la estés creando desde un banco.",
    ],
  },
  {
    version: "0.47.9",
    highlights: [
      "Al crear una categoría desde el presupuesto, la hoja se cierra y la categoría queda elegida.",
    ],
  },
  {
    version: "0.47.8",
    highlights: [
      "Cuando ya conciliaste todos los productos del mes, el aviso de productos sin conciliar deja de aparecer.",
    ],
  },
  {
    version: "0.47.7",
    highlights: [
      "El aviso de productos sin conciliar cuenta lo mismo que muestra, resume los que sobran con «+N más» y te lleva a conciliar el producto con un toque.",
      "Al crear un presupuesto ya no aparece una categoría elegida: la eliges tú, y si escribes una que no existe puedes crearla desde el mismo selector.",
    ],
  },
  {
    version: "0.47.6",
    highlights: [
      "Sin cambios visibles: ajustes internos en el formulario de movimientos y en el reparto de conciliación para que sea más fácil mantenerlos.",
    ],
  },
  {
    version: "0.47.5",
    highlights: [
      "Al guardar un gasto o un ingreso vuelves a Movimientos con el movimiento que acabas de registrar. Si abriste el formulario desde una cuenta o una tarjeta, vuelves a esa pantalla con el movimiento en su historial.",
      "Una meta de ahorro que pasa de su objetivo muestra el avance real y cuánto es el excedente. Al registrar un aporte que se pasa de la meta, la app te avisa antes de guardarlo.",
    ],
  },
  {
    version: "0.47.4",
    highlights: [
      "En el formulario de una suscripción, la cuenta o la tarjeta se ve a simple vista. Si la dejas vacía, la app te avisa: los pagos que registres no moverán ningún saldo hasta que la asignes, y el detalle te deja hacerlo.",
      "El historial de una cuenta y de una tarjeta marca los movimientos revertidos en gris con su etiqueta, y muestra si una transferencia entró o salió, con signo y color.",
      "El reparto de una conciliación muestra los nombres en español (Impuesto DGII, Comisión, Otro) y el monto completo, sin cortar los decimales.",
    ],
  },
  {
    version: "0.47.3",
    highlights: [
      "Sin cambios visibles: orden interno de la configuración de Finanzas para que sea más fácil de mantener.",
    ],
  },
  {
    version: "0.47.2",
    highlights: [
      "El menú lateral muestra solo las apps que tienes activas, en el mismo orden de siempre, y se actualiza al encenderlas o apagarlas. Keep Awake sigue fijo.",
      "La descripción de Apariencia y las opciones de vista de Proyectos ya se leen en español: Tablero, Lista y Cronograma.",
      "El detalle de la tarjeta muestra la utilización real aunque la deuda pase del límite, y avisa cuánto es el sobregiro.",
      "El resumen del préstamo cuadra el interés total con las cuotas que ves, y la última cuota aparece con su monto ajustado.",
      "Al eliminar un movimiento, el diálogo lo nombra por su descripción e indica el monto antes de confirmar.",
    ],
  },
  {
    version: "0.47.1",
    highlights: [
      "Sin cambios visibles: orden interno de los tipos y del detalle de movimiento para que sea más fácil mantenerlos.",
    ],
  },
  {
    version: "0.47.0",
    highlights: [
      "El detalle de una transferencia permite confirmarla, marcarla como pendiente para editarla o reversarla. Al reversar, los saldos vuelven a su lugar.",
      "Registrar el pago de una suscripción ya crea el gasto en su cuenta o tarjeta y lo cuenta en el mes. Si la suscripción no tiene método de pago, la app te pide asignarlo primero.",
      "Los pagos de tarjeta aparecen en Movimientos y en el historial de la cuenta y de la tarjeta.",
    ],
  },
  {
    version: "0.46.0",
    highlights: [
      "Al transferir entre monedas ya ves la tasa del día y puedes escribir la que usó el banco o el monto que recibiste. Antes de guardar ves cuánto entrará en la cuenta destino.",
      "El detalle de la transferencia muestra lo enviado, lo recibido y la tasa. Si dejaste la tasa del día, te avisa que es una estimación.",
    ],
  },
  {
    version: "0.45.9",
    highlights: [
      "Al crear una tarjeta de crédito ya queda con la deuda que escribes, no con el límite completo. Un saldo vacío cuenta como 0.",
      "La tarjeta de Finanzas del inicio muestra los mismos ingresos y gastos del mes que Movimientos, incluidos los de hoy.",
      "El mensaje de WhatsApp de cobros saluda por el primer nombre, dice cuántos cobros son y cuánto deben en cada moneda.",
    ],
  },
  {
    version: "0.45.8",
    highlights: [
      "El detalle de un préstamo ya abre siempre: si una cuota llega sin un capital legible, el plan de amortización muestra esa fila y deja el saldo restante en blanco, en vez de caer en una pantalla de error.",
    ],
  },
  {
    version: "0.45.7",
    highlights: [
      "En el detalle de una cuenta en dólares, los totales de ingresos y egresos del mes ya se muestran en dólares y suman solo los movimientos de esa cuenta.",
    ],
  },
  {
    version: "0.45.6",
    highlights: [
      "En el detalle de un cobro, la acción para registrar un pago sigue visible después del primero y solo desaparece si el cobro está cancelado o castigado.",
    ],
  },
  {
    version: "0.45.4",
    highlights: [
      "Sin cambios visibles: ajuste interno del arranque de sesión y más pruebas.",
    ],
  },
  {
    version: "0.45.3",
    highlights: [
      "El formulario de login aparece de inmediato, aunque el servidor tarde en responder o haya una sesión vieja guardada. Si la sesión sigue siendo válida, la app entra sola.",
    ],
  },
  {
    version: "0.45.2",
    highlights: [
      "Los switches de ajustes y notificaciones responden al toque: el cambio se ve al instante y ya no se pierde si tocas varios seguidos. Si el guardado falla, el switch vuelve a su valor anterior.",
    ],
  },
  {
    version: "0.45.1",
    highlights: [
      "Con Finanzas desactivada, sus ajustes ya no muestran un error al abrir: ves el aviso para activarla y, cuando la activas, la revisión de integridad funciona igual.",
    ],
  },
  {
    version: "0.45.0",
    highlights: [
      "Planificación estrena cabecera: cambia entre Ahorros, Presupuestos, Cobros y Préstamos tocando la pestaña y ve el total de cada una. Los montos nunca se convierten entre monedas.",
      "Al crear o editar una meta de ahorro ya eliges la cuenta donde guardas el dinero, y puedes quitar la fecha objetivo cuando quieras.",
      "En el detalle de una meta tienes «Agregar aporte» en el menú y en el botón de arriba; si el dinero sale de otra cuenta, la app mueve el saldo por ti y te avisa si no alcanza.",
      "Al borrar un aporte, la transferencia que creó se deshace. Una transferencia entre tus cuentas avisa una sola vez.",
    ],
  },
  {
    version: "0.44.0",
    highlights: [
      "Al editar una cuenta, el número ya no aparece completo: ves solo los últimos 4 dígitos. Déjalo vacío para conservarlo o escribe uno nuevo para cambiarlo.",
    ],
  },
  {
    version: "0.43.2",
    highlights: [
      "Sin cambios visibles: ajustes internos de la sesión y la navegación.",
    ],
  },
  {
    version: "0.43.1",
    highlights: [
      "Agenda, Proyectos y Salud ya muestran su pantalla de «en camino» con acceso a sus ajustes.",
      "Sin cambios visibles en el resto: mejoras internas para que la app abra y navegue más rápido.",
    ],
  },
  {
    version: "0.43.0",
    highlights: [
      "Comparte cobros con un link: elige los cobros de una misma persona, genera el enlace y mándalo por WhatsApp o cópialo.",
      "Quien lo recibe ve el total pendiente, cada cobro y su historial de pagos, sin cuenta ni contraseña. Es de solo lectura: no enseña tus cuentas.",
      "Puedes revocar el link cuando quieras; a partir de ahí deja de abrirse.",
      "Al crear o editar un cobro, el campo Concepto ahora es obligatorio.",
    ],
  },
  {
    version: "0.42.4",
    highlights: [
      "Sin cambios visibles: las pruebas ahora miden todo el código de la app.",
    ],
  },
  {
    version: "0.42.3",
    highlights: [
      "Sin cambios visibles: actualización interna de dependencias.",
    ],
  },
  {
    version: "0.42.2",
    highlights: [
      "Sin cambios visibles: limpieza interna de dependencias y del icono del navegador.",
    ],
  },
  {
    version: "0.42.1",
    highlights: [
      "Sin cambios visibles: ajuste interno de cómo la app recuerda la última versión de Novedades que viste.",
    ],
  },
  {
    version: "0.42.0",
    highlights: [
      "La hoja «Novedades» ahora recuerda en tu perfil la última versión que viste, así que no vuelve a aparecer aunque entres desde otro dispositivo.",
    ],
  },
  {
    version: "0.41.0",
    highlights: [
      "Si una acción se reintenta por un corte de red, la app ya no la repite: si el servidor ya la había registrado, verás el mismo resultado en vez de crear un duplicado.",
    ],
  },
  {
    version: "0.40.0",
    highlights: [
      "Estreno de la hoja «Novedades»: cuando salga una versión nueva, la primera vez que abras Personal OS verás qué cambió, explicado en lenguaje corriente.",
      "La hoja aparece una sola vez por versión. Si ya la viste, no vuelve a salir.",
    ],
  },
]

/** Versión de la app que la hoja compara con la última vista. Sigue a `package.json`. */
export const LATEST_RELEASE_VERSION = RELEASE_NOTES[0].version
