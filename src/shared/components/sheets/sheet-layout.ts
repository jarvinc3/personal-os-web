/**
 * `wide` only changes the right drawer: below `md` the width stays the default
 * one, and from `md` up it takes room for a preview beside the form.
 */
export const WIDE_SHEET_CONTENT_CLASS =
  "data-[swipe-direction=right]:md:max-w-2xl"

export const FLOATING_SHEET_CONTENT_CLASS =
  "mx-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-xl border data-[swipe-direction=down]:bottom-4 data-[swipe-direction=down]:rounded-xl"

/** Pie de una hoja: acciones en fila, alineadas al final. */
export const SHEET_FOOTER_CLASS =
  "mt-4 flex w-full flex-row items-center justify-end gap-2 pt-4"
