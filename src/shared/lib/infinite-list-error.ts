export type InfiniteListErrorState = "none" | "inline" | "full"

type InfiniteListErrorInput = {
  hasError: boolean
  itemCount: number
}

/**
 * Una lista infinita conserva lo que ya cargó: el fallo de la siguiente tanda se
 * avisa al pie con reintento, y solo sin filas se cambia la lista entera por el
 * estado de error.
 */
export function resolveInfiniteListErrorState({
  hasError,
  itemCount,
}: InfiniteListErrorInput): InfiniteListErrorState {
  if (!hasError) {
    return "none"
  }

  return itemCount > 0 ? "inline" : "full"
}
