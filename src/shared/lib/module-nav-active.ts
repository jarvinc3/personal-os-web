export type ModuleNavMatchInput = {
  href: string
  matchExact?: boolean
  extraActiveHrefs?: readonly string[]
}

export type ModuleNavSectionsInput = {
  items?: readonly unknown[]
}

function isHrefActive(
  href: string,
  pathname: string,
  matchExact?: boolean,
): boolean {
  if (pathname === href) {
    return true
  }
  if (matchExact) {
    return false
  }
  return pathname.startsWith(`${href}/`)
}

export function isModuleSectionActive(
  item: ModuleNavMatchInput,
  pathname: string,
): boolean {
  if (isHrefActive(item.href, pathname, item.matchExact)) {
    return true
  }
  return (item.extraActiveHrefs ?? []).some((href) =>
    isHrefActive(href, pathname, false),
  )
}

export function moduleHasSections(nav: ModuleNavSectionsInput): boolean {
  return (nav.items?.length ?? 0) >= 1
}
