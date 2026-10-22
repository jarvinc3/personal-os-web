import { APP_ROUTES } from "@/src/shared/constants/app-routes"

export function glossaryTermHref(slug: string): string {
  const params = new URLSearchParams({ term: slug })
  return `${APP_ROUTES.app.helpGlossary}?${params.toString()}`
}

export function helpGuideHref(slug: string): string {
  return APP_ROUTES.app.helpGuide(slug)
}
