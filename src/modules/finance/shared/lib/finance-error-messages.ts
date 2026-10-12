const SERVER_ERROR = "No se pudo guardar. Intenta de nuevo."
const REQUEST_ERROR = "No se pudo guardar. Revisa los datos e intenta de nuevo."
const GMAIL_TOKEN_PREFIX = "Gmail tokens could not be decrypted"
const GMAIL_TOKEN_ERROR =
  "No se pudo leer el acceso a Gmail. Vuelve a conectar la cuenta."

/** Stable backend codes that the API sends alongside the message. */
const BACKEND_CODE_MESSAGE_ES: Record<string, string> = {
  TRANSACTION_LOCKED:
    "Este movimiento está completado. Márcalo como pendiente para editarlo.",
  TRANSACTION_IMMUTABLE: "Este movimiento ya no se puede editar.",
  TRANSACTION_LINKED:
    "Este movimiento está ligado a otro registro. Edítalo desde ahí.",
  TRANSFER_LOCKED:
    "Esta transferencia está completada. Márcala como pendiente para editarla.",
  SAME_ACCOUNT: "El origen y el destino no pueden ser la misma cuenta.",
  ACCOUNT_NOT_FOUND: "No encontramos la cuenta.",
  TRANSFER_TARGET_NOT_ACCOUNT:
    "El destino de una transferencia debe ser una cuenta. Para pagar una tarjeta usa Pagar tarjeta.",
  CARD_NOT_FOUND: "No encontramos la tarjeta.",
  CARD_NOT_CREDIT: "Solo se pagan tarjetas de crédito.",
  CARD_CURRENCY_MISSING: "La tarjeta no tiene saldo en esa moneda.",
  PAYMENT_EXCEEDS_INSTALLMENT:
    "El pago supera la cuota. ¿Quieres aplicar el excedente como abono a capital?",
  LOAN_HAS_OVERDUE: "Paga primero las cuotas vencidas.",
  LOAN_NOT_FOUND: "No encontramos el préstamo.",
  ALREADY_RESTORED: "Esto ya se restauró.",
  RESTORE_CONFLICT:
    "No se puede restaurar: ya existe un registro con los mismos datos.",
  PARTIAL_OPERATION:
    "Esta operación está incompleta. Restaura la operación completa.",
}

/** Backend messages translated once so no raw English reaches the screen. */
const BACKEND_MESSAGE_ES: Record<string, string> = {
  "Account is not active": "La cuenta no está activa.",
  "Account not found": "No encontramos la cuenta.",
  "Account or card not found": "No encontramos la cuenta ni la tarjeta.",
  "Archivo obligatorio": "Falta el archivo.",
  "Budget not found": "No encontramos el presupuesto.",
  "Budgets require an expense category":
    "Un presupuesto necesita una categoría de gasto.",
  "CREDIT cards must not set accountId":
    "Una tarjeta de crédito no lleva cuenta asociada.",
  "CREDIT cards require creditLimit": "Una tarjeta de crédito necesita límite.",
  "Card adjustments require a currency": "Elige una moneda para el ajuste.",
  "Card balance not found": "No encontramos el saldo de la tarjeta.",
  "Card is not active": "La tarjeta no está activa.",
  "Card not found": "No encontramos la tarjeta.",
  "Category cannot be its own parent":
    "Una categoría no puede ser su propia padre.",
  "Category not found": "No encontramos la categoría.",
  "Category parent would create a cycle": "Esa categoría padre crea un ciclo.",
  "Category type must be EXPENSE or INCOME":
    "El tipo de categoría no es válido.",
  "Connect Gmail before linking a bank":
    "Conecta Gmail antes de vincular un banco.",
  "Connect Gmail first": "Conecta Gmail primero.",
  "Contribution not found": "No encontramos el aporte.",
  "Credit card not found": "No encontramos la tarjeta de crédito.",
  "DEBIT cards require accountId": "Una tarjeta de débito necesita una cuenta.",
  "Dominio inválido": "El dominio no es válido.",
  "Email message has no extract to assign":
    "El correo no trae datos para asignar.",
  "Email message is missing an amount": "El correo no trae un monto.",
  "Email message is not pending assignment": "Ese correo ya fue asignado.",
  "Email message not found": "No encontramos el correo.",
  "Email source not found": "No encontramos el correo vinculado.",
  "Email source tokens not found": "No encontramos el acceso al correo.",
  "Google did not return a refresh token":
    "Google no autorizó el acceso permanente. Intenta de nuevo.",
  "Institution not found": "No encontramos la institución.",
  "Invalid or expired OAuth state":
    "La conexión con Google expiró. Intenta de nuevo.",
  "Invalid transfer accounts":
    "Las cuentas de la transferencia no son válidas.",
  "Loan has no pending instalment": "El préstamo no tiene cuotas pendientes.",
  "Loan not found": "No encontramos el préstamo.",
  "Mailbox not found": "No encontramos el correo.",
  "Manual transaction not found": "No encontramos el movimiento.",
  "Missing code or state": "Faltan datos de la conexión con Google.",
  "Parent category must have the same type":
    "La categoría padre debe ser del mismo tipo.",
  "Payment cannot exceed the outstanding amount":
    "El monto supera lo que queda por cobrar.",
  "Receivable not found": "No encontramos el cobro.",
  "Savings goal not found": "No encontramos la meta.",
}

export function translateFinanceError(
  status: number,
  message: string,
  code?: string
): string {
  if (status >= 500) {
    return SERVER_ERROR
  }
  const coded = code ? BACKEND_CODE_MESSAGE_ES[code] : undefined
  if (coded) {
    return coded
  }
  const translated = BACKEND_MESSAGE_ES[message]
  if (translated) {
    return translated
  }
  if (message.startsWith(GMAIL_TOKEN_PREFIX)) {
    return GMAIL_TOKEN_ERROR
  }
  return REQUEST_ERROR
}
