export type SheetTitleFocus = {
  /** El popup toma el título como foco inicial; si no, base-ui enfoca el popup. */
  focusesTitle: boolean
  /** Un encabezado solo recibe foco por programa con `tabIndex={-1}`. */
  titleTabIndex: -1 | undefined
}

/**
 * El foco inicial de una hoja: por defecto lo elige base-ui. Con
 * `focusTitleOnOpen` la hoja enfoca su título, que necesita `tabIndex={-1}`.
 */
export function resolveSheetTitleFocus(
  focusTitleOnOpen: boolean
): SheetTitleFocus {
  if (!focusTitleOnOpen) {
    return { focusesTitle: false, titleTabIndex: undefined }
  }
  return { focusesTitle: true, titleTabIndex: -1 }
}
