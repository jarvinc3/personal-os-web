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
