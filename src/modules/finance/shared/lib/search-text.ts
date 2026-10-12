/** Minúsculas y sin acentos, para comparar texto de búsqueda. */
export function foldSearchText(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim()
}
