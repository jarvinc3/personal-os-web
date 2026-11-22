import {
  SHEET_GLOSSARY_TERMS,
  type SheetGlossaryKey,
} from "@/src/modules/help/constants/sheet-terms"

const SHEET_GLOSSARY_PICKER_PREFIX = "sheet-glossary:"

const SHEET_GLOSSARY_KEYS = new Set<string>(Object.keys(SHEET_GLOSSARY_TERMS))

function isSheetGlossaryKey(sheetKey: string): sheetKey is SheetGlossaryKey {
  return SHEET_GLOSSARY_KEYS.has(sheetKey)
}

export function glossarySlugsForSheet(sheetKey: string): readonly string[] {
  if (!isSheetGlossaryKey(sheetKey)) {
    return []
  }
  return SHEET_GLOSSARY_TERMS[sheetKey]
}

/** La hoja anidada viaja en `?picker=` para que Atrás cierre solo el glosario. */
export function glossaryPickerKey(key: string): string {
  return `${SHEET_GLOSSARY_PICKER_PREFIX}${key}`
}
