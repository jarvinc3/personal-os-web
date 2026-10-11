function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isEmptyObject(value: unknown): boolean {
  return isPlainObject(value) && Object.keys(value).length === 0
}

export type SettingWithValue<T> = {
  fieldGuide: string
  value: T
}

/** Reads `value` from a `{ fieldGuide, value }` preference node (v1 contract). */
export function getSettingValue<T>(node: SettingWithValue<T>): T {
  return node.value
}

/** Updates `value` on a `{ fieldGuide, value }` preference node (v1 contract). */
export function patchSettingValue<T>(
  node: SettingWithValue<T>,
  newValue: T
): SettingWithValue<T> {
  return { ...node, value: newValue }
}

/**
 * Deep-merge that preserves `fieldGuide` and does not overwrite with `undefined`.
 * Arrays from source replace target arrays.
 */
export function mergeWithDefaults<T extends Record<string, unknown>>(
  partial: unknown,
  defaults: T
): T {
  if (partial === null || partial === undefined || isEmptyObject(partial)) {
    return structuredClone(defaults) as T
  }
  if (!isPlainObject(partial)) {
    return structuredClone(defaults) as T
  }

  const result = structuredClone(defaults) as Record<string, unknown>

  for (const key of Object.keys(partial)) {
    const sourceValue = partial[key]
    if (sourceValue === undefined) {
      continue
    }

    const defaultValue = result[key]

    if (isPlainObject(sourceValue) && isPlainObject(defaultValue)) {
      result[key] = mergeWithDefaults(
        sourceValue,
        defaultValue as Record<string, unknown>
      )
    } else {
      result[key] = sourceValue
    }
  }

  return result as T
}
