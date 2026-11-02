const UUID_PATTERN = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i

export function shouldReturnToTransactionOnMessageClose(
  open: boolean,
  returnToTransactionId: string | null
): boolean {
  return !open && UUID_PATTERN.test(returnToTransactionId ?? "")
}
