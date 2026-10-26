const SHORT_MESSAGE_ID_LENGTH = 8

/**
 * Los ids son UUID: ocho caracteres bastan para distinguir dos correos con el
 * mismo asunto, remitente y minuto.
 */
export function shortMessageId(messageId: string): string {
  return messageId.slice(0, SHORT_MESSAGE_ID_LENGTH)
}
