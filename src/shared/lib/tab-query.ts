/** Keeps the active tab in the query string without dropping other params. */
export function withTabQuery(
  pathname: string,
  currentQuery: string,
  key: string,
  value: string,
): string | null {
  const params = new URLSearchParams(currentQuery)
  if (params.get(key) === value) {
    return null
  }
  params.set(key, value)
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
