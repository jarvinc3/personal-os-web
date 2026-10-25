/**
 * `1 cuenta` / `2 cuentas`: the count decides the word, never the other counts
 * in the same row.
 */
export function countLabel(
  count: number,
  singular: string,
  plural: string
): string {
  return `${count} ${count === 1 ? singular : plural}`
}
