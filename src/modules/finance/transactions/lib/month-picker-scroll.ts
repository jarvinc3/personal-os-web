export function centeredScrollLeft(input: {
  listScrollLeft: number
  listLeft: number
  listWidth: number
  chipLeft: number
  chipWidth: number
}): number {
  return (
    input.listScrollLeft +
    (input.chipLeft - input.listLeft) -
    (input.listWidth - input.chipWidth) / 2
  )
}

/**
 * The first month lands before the next paint. A smooth scroll started while
 * the strip mounts can be dropped, which left the picker on the first month.
 */
export function monthPickerScrollBehavior(
  hasCentered: boolean
): ScrollBehavior {
  return hasCentered ? "smooth" : "auto"
}
