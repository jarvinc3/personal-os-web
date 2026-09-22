const MONTH_BANNER_FILES = [
  "banner-enero.png",
  "banner-febrero.png",
  "banner-marzo.png",
  "banner-abril.png",
  "banner-mayo.png",
  "banner-junio.png",
  "banner-julio.png",
  "banner-agosto.png",
  "banner-septiembre.png",
  "banner-octubre.png",
  "banner-noviembre.png",
  "banner-diciembre.png",
] as const

export function monthBannerSrc(month: number): string {
  const file = MONTH_BANNER_FILES[month - 1] ?? MONTH_BANNER_FILES[0]
  return `/banners/${file}`
}
